import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AdminConteudo } from "@/components/AdminConteudo";
import { fotosGaleriaQuery, type FotoGaleria } from "@/lib/galeria";

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
      // Apenas contas autorizadas explicitamente na tabela de papéis são administradoras.
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", sess.user.id)
        .eq("role", "admin")
        .maybeSingle();
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
        // Valida antes de enviar para dar um aviso claro em vez de erro do servidor.
        if (arquivo.size > 10 * 1024 * 1024) {
          throw new Error(`A foto "${arquivo.name}" tem mais de 10 MB. Reduza o tamanho e tente de novo.`);
        }
        if (!arquivo.type.startsWith("image/")) {
          throw new Error(`O arquivo "${arquivo.name}" não é uma imagem.`);
        }
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
        if (erroInsert) {
          await supabase.storage.from("galeria").remove([caminho]);
          throw erroInsert;
        }
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
      const bruto = e instanceof Error ? e.message : "";
      // Traduz as mensagens técnicas mais comuns do servidor.
      const amigavel = /maximum allowed size/i.test(bruto)
        ? "A foto é grande demais (limite de 10 MB). Reduza o tamanho e tente de novo."
        : /row-level security|permission/i.test(bruto)
          ? "Sua conta não tem permissão para publicar fotos."
          : /network|fetch/i.test(bruto)
            ? "Sem conexão com a internet. Verifique a rede e tente de novo."
            : bruto || "Falha ao enviar as fotos.";
      setErro(amigavel);
    },
  });

  const remover = useMutation({
    mutationFn: async ({ id, caminho }: { id: string; caminho: string }) => {
      const { error } = await supabase.from("galeria_fotos").delete().eq("id", id);
      if (error) throw error;
      await supabase.storage.from("galeria").remove([caminho]);
    },
    // Atualização otimista: a foto some da lista na hora, sem esperar o servidor.
    onMutate: async ({ id }) => {
      setErro(null);
      await queryClient.cancelQueries({ queryKey: fotosGaleriaQuery.queryKey });
      const anterior = queryClient.getQueryData<FotoGaleria[]>(fotosGaleriaQuery.queryKey);
      queryClient.setQueryData<FotoGaleria[]>(
        fotosGaleriaQuery.queryKey,
        (atual) => (atual ?? []).filter((f) => f.id !== id),
      );
      return { anterior };
    },
    onError: (e, _vars, ctx) => {
      // Desfaz a remoção otimista se o servidor recusar.
      if (ctx?.anterior) queryClient.setQueryData(fotosGaleriaQuery.queryKey, ctx.anterior);
      setErro(e instanceof Error ? e.message : "Falha ao remover a foto.");
    },
    // Revalida sempre na fonte de dados, tanto no sucesso quanto no erro.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: fotosGaleriaQuery.queryKey });
    },
  });

  const sair = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  if (admin.isLoading) {
    return <main className="grid min-h-screen place-items-center bg-cream text-ink">Carregando...</main>;
  }

  if (!admin.data) {
    return (
      <main className="grid min-h-screen place-items-center bg-cream px-5 text-ink">
        <div className="max-w-md text-center">
          <h1 className="font-display text-3xl ">Acesso restrito</h1>
          <p className="mt-3 text-sm text-ink/70">
            Sua conta está autenticada, mas ainda não tem permissão de administrador da galeria.
            Peça para a organização liberar seu acesso.
          </p>
          <Button variant="neutral" onClick={sair} className="mt-6 h-11 rounded-md bg-foreground px-6 text-sm font-extrabold  text-background">
            Sair
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream px-5 py-12 text-ink sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link to="/" className="text-sm font-bold  tracking-widest text-accent-warm">
              ← Ver o site
            </Link>
            <h1 className="mt-2 font-display text-4xl  leading-tight">
              Painel de conteúdo
            </h1>
          </div>
          <Button variant="outline"
            onClick={sair}
            className="h-11 rounded-md border border-ink/20 px-5 text-sm font-extrabold  hover:border-accent-warm hover:text-accent-warm"
          >
            Sair
          </Button>
        </div>

        <form
          className="mt-8 space-y-4 rounded-lg bg-card p-6 "
          onSubmit={(e) => {
            e.preventDefault();
            if (arquivos.length > 0) enviar.mutate();
          }}
        >
          <h2 className="font-display text-2xl ">Enviar fotos</h2>

          <div>
            <label htmlFor="edicao" className="mb-1 block text-sm font-bold">
              Edição
            </label>
            <select
              id="edicao"
              disabled={enviar.isPending}
              value={edicao}
              onChange={(e) => setEdicao(e.target.value)}
              className="h-12 w-full rounded-md border border-ink/20 bg-card px-3"
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
              disabled={enviar.isPending}
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder={`Registro da Ação Entre Amigos ${edicao}`}
              className="h-12 w-full rounded-md border border-ink/20 bg-card px-4"
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
              disabled={enviar.isPending}
              onChange={(e) => setArquivos(Array.from(e.target.files ?? []))}
              className="w-full rounded-md border border-dashed border-ink/20 bg-card p-3 text-sm"
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

          <Button variant="neutral"
            type="submit"
            disabled={enviar.isPending || arquivos.length === 0}
            className="h-12 w-full rounded-md bg-foreground text-sm font-extrabold  tracking-wide text-background disabled:opacity-60 sm:w-auto sm:px-8"
          >
            {enviar.isPending ? "Enviando..." : "Publicar na galeria"}
          </Button>
        </form>

        <section className="mt-10">
          <h2 className="font-display text-2xl ">Fotos publicadas</h2>
          {fotos.isLoading && <p className="mt-3 text-sm text-ink/70">Carregando fotos...</p>}
          {fotos.data && fotos.data.length === 0 && (
            <p className="mt-3 text-sm text-ink/70">Nenhuma foto enviada pelo painel ainda.</p>
          )}
          <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {(fotos.data ?? []).map((f) => (
              <li key={f.id} className="overflow-hidden rounded-lg bg-card ">
                <img src={f.url} alt={f.alt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                <div className="flex items-center justify-between gap-2 p-2">
                  <span className="text-xs font-bold  text-ink/60">Ação {f.edicao}</span>
                  <Button variant="ghost"
                    type="button"
                    disabled={remover.isPending}
                    onClick={() => remover.mutate({ id: f.id, caminho: f.caminho })}
                    className="min-h-11 text-xs font-bold  text-accent-warm underline disabled:opacity-50"
                    aria-label={`Remover foto: ${f.alt}`}
                  >
                    {remover.isPending ? "Removendo..." : "Remover"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <AdminConteudo />
      </div>
    </main>
  );
}
