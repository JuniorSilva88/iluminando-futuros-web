import { supabase } from "@/integrations/supabase/client";

export type FotoGaleria = {
  id: string;
  edicao: string;
  caminho: string;
  alt: string;
  ordem: number;
  url: string;
};

const VALIDADE_SEGUNDOS = 60 * 60 * 8;

/** Busca as fotos enviadas pelo painel e resolve URLs assinadas do bucket privado. */
export async function buscarFotosGaleria(): Promise<FotoGaleria[]> {
  const { data, error } = await supabase
    .from("galeria_fotos")
    .select("id, edicao, caminho, alt, ordem, created_at")
    .order("ordem", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  const linhas = data ?? [];
  if (linhas.length === 0) return [];

  const { data: assinadas } = await supabase.storage
    .from("galeria")
    .createSignedUrls(
      linhas.map((l) => l.caminho),
      VALIDADE_SEGUNDOS,
    );

  const mapa = new Map<string, string>();
  for (const item of assinadas ?? []) {
    if (item.path && item.signedUrl) mapa.set(item.path, item.signedUrl);
  }

  return linhas
    .map((l) => ({
      id: l.id,
      edicao: l.edicao,
      caminho: l.caminho,
      alt: l.alt,
      ordem: l.ordem,
      url: mapa.get(l.caminho) ?? "",
    }))
    .filter((f) => f.url !== "");
}

export const fotosGaleriaQuery = {
  queryKey: ["galeria-fotos"] as const,
  queryFn: buscarFotosGaleria,
  staleTime: 60_000,
};
