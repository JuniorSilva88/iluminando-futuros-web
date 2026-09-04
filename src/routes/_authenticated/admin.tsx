import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fotosGaleriaQuery } from "@/lib/galeria";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Painel da galeria | Ação Entre Amigos" },
      {
        name: "description",
        content: "Painel interno para enviar e remover fotos das edições da Ação Entre Amigos.",
      },
      { property: "og:title", content: "Painel da galeria | Ação Entre Amigos" },
      { property: "og:description", content: "Área interna de gestão da galeria." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaginaAdmin,
});

function PaginaAdmin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [edicao, setEdicao] = useState("2025");
  const [alt, setAlt] = useState("");
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const admin = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: sess } = await supabase.auth.getUser();
      if (!sess.user) return false;
      // Confirma a permissão; a primeira conta do projeto se torna responsável.
      const { data } = await supabase.rpc("reivindicar_admin");
      return Boolean(data);
    },
  });

  const fotos = useQuery(fotosGaleriaQuery);

  // Atualiza a lista em tempo real quando alguém publica ou remove uma foto.
  useEffect(() => {
    const canal = supabase
      .channel("admin-galeria")
      .on("postgres_changes", { event: "*", schema: "public", table: "galeria_fotos" }, () => {
        queryClient.invalidateQueries({ queryKey: fotosGaleriaQuery.queryKey });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
  }, [queryClient]);

  const enviar = useMutation({
    mutationFn: async () => {
      const { data: sess } = await supabase.auth.getUser();
      if (!sess.user) throw new Error("Sessão expirada.");
      for (const arquivo of arquivos) {
        const ext = arquivo.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const caminho = `${edicao}/${crypto.randomUUID()}.${ext}`;
        const { error: erroUpload } = await supabase.storage
          .from("galeria")
          .upload(caminho, arquivo, { contentType: arquivo.type, upsert: false });
        if (erroUpload) throw erroUpload;
        const { error: erroInsert } = await supabase.from("galeria_fotos").insert({
          edicao,
          caminho,
          alt: alt.trim() || `Registro da Ação Entre Amigos ${edicao}`,
        });
        if (erroInsert) throw erroInsert;
      }
    },
    onSuccess: () => {
      setArquivos([]);
      setAlt("");
      setErro(null);
      setMensagem("Fotos publicadas na galeria.");
      queryClient.invalidateQueries({ queryKey: fotosGaleriaQuery.queryKey });
    },
    onError: (e) => {
      setMensagem(null);
      setErro(e instanceof Error ? e.message : "Falha ao enviar as fotos.");
    },
  });

  const remover = useMutation({
    mutationFn: async ({ id, caminho }: { id: string; caminho: string }) => {
      const { error } = await supabase.from("galeria_fotos").delete().eq("id", id);
      if (error) throw error;
      await supabase.storage.from("galeria").remove([caminho]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fotosGaleriaQuery.queryKey });
    },
  });

  const sair = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate({ to: "/auth" });
  };

  if (admin.isLoading) {
    return <main className="grid min-h-screen place-items-center bg-cream text-ink">Carregando...</main>;
  }

  if (!admin.data) {
    return (
      <main className="grid min-h-screen place-items-center bg-cream px-5 text-ink">
        <div className="max-w-md text-center">
          <h1 className="font-display text-3xl uppercase">Acesso restrito</h1>
          <p className="mt-3 text-sm text-ink/70">
            Sua conta está autenticada, mas ainda não tem permissão de administrador da galeria.
            Peça para a organização liberar seu acesso.
          </p>
          <button onClick={sair} className="mt-6 h-11 rounded-md bg-accent-warm px-6 text-sm font-extrabold uppercase text-white">
            Sair
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream px-5 py-12 text-ink sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link to="/" className="text-sm font-bold uppercase tracking-widest text-accent-warm">
              ← Ver o site
            </Link>
            <h1 className="mt-2 font-display text-4xl uppercase leading-[0.9]">
              Painel da <span className="inline-block -skew-x-6 text-accent-warm">galeria</span>
            </h1>
          </div>
          <button
            onClick={sair}
            className="h-11 rounded-md border-2 border-ink/20 px-5 text-sm font-extrabold uppercase hover:border-accent-warm hover:text-accent-warm"
          >
            Sair
          </button>
        </div>

        <form
          className="mt-8 space-y-4 rounded-xl bg-white p-6 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault();
            if (arquivos.length > 0) enviar.mutate();
          }}
        >
          <h2 className="font-display text-2xl uppercase">Enviar fotos</h2>

          <div>
            <label htmlFor="edicao" className="mb-1 block text-sm font-bold">
              Edição
            </label>
            <select
              id="edicao"
              value={edicao}
              onChange={(e) => setEdicao(e.target.value)}
              className="h-12 w-full rounded-md border-2 border-ink/20 bg-white px-3"
            >
              <option value="2025">Ação 2025</option>
              <option value="2024">Ação 2024</option>
            </select>
          </div>

          <div>
            <label htmlFor="alt" className="mb-1 block text-sm font-bold">
              Descrição da foto (acessibilidade)
            </label>
            <input
              id="alt"
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder={`Registro da Ação Entre Amigos ${edicao}`}
              className="h-12 w-full rounded-md border-2 border-ink/20 bg-white px-4"
            />
          </div>

          <div>
            <label htmlFor="arquivos" className="mb-1 block text-sm font-bold">
              Fotos (JPG ou PNG, até 10 MB cada)
            </label>
            <input
              id="arquivos"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setArquivos(Array.from(e.target.files ?? []))}
              className="w-full rounded-md border-2 border-dashed border-ink/20 bg-white p-3 text-sm"
            />
            {arquivos.length > 0 && (
              <p className="mt-2 text-sm text-ink/70">{arquivos.length} foto(s) selecionada(s)</p>
            )}
          </div>

          {erro && (
            <p role="alert" className="rounded-md bg-accent-warm/10 p-3 text-sm text-accent-warm">
              {erro}
            </p>
          )}
          {mensagem && (
            <p role="status" className="rounded-md bg-ink/5 p-3 text-sm text-ink/80">
              {mensagem}
            </p>
          )}

          <button
            type="submit"
            disabled={enviar.isPending || arquivos.length === 0}
            className="h-12 w-full rounded-md bg-accent-warm text-sm font-extrabold uppercase tracking-wide text-white disabled:opacity-60 sm:w-auto sm:px-8"
          >
            {enviar.isPending ? "Enviando..." : "Publicar na galeria"}
          </button>
        </form>

        <section className="mt-10">
          <h2 className="font-display text-2xl uppercase">Fotos publicadas</h2>
          {fotos.isLoading && <p className="mt-3 text-sm text-ink/70">Carregando fotos...</p>}
          {fotos.data && fotos.data.length === 0 && (
            <p className="mt-3 text-sm text-ink/70">Nenhuma foto enviada pelo painel ainda.</p>
          )}
          <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {(fotos.data ?? []).map((f) => (
              <li key={f.id} className="overflow-hidden rounded-lg bg-white shadow-sm">
                <img src={f.url} alt={f.alt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                <div className="flex items-center justify-between gap-2 p-2">
                  <span className="text-xs font-bold uppercase text-ink/60">Ação {f.edicao}</span>
                  <button
                    type="button"
                    onClick={() => remover.mutate({ id: f.id, caminho: f.caminho })}
                    className="text-xs font-bold uppercase text-accent-warm underline"
                    aria-label={`Remover foto: ${f.alt}`}
                  >
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
