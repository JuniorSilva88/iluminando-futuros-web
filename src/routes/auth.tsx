import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar no painel | Ação Entre Amigos" },
      {
        name: "description",
        content:
          "Área restrita da Ação Entre Amigos para a equipe organizadora atualizar a galeria de fotos das edições.",
      },
      { property: "og:title", content: "Entrar no painel | Ação Entre Amigos" },
      {
        property: "og:description",
        content: "Acesso restrito à equipe da Ação Entre Amigos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaginaAuth,
});

function PaginaAuth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setAviso(null);
    setCarregando(true);
    try {
      if (modo === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        setAviso("Conta criada. Se pedir confirmação, verifique seu e-mail.");
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível continuar.");
    } finally {
      setCarregando(false);
    }
  };

  const entrarComGoogle = async () => {
    setErro(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setErro("Não foi possível entrar com o Google.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/admin" });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-5 py-16 text-ink">
      <div className="w-full max-w-md">
        <Link to="/" className="text-sm font-bold uppercase tracking-widest text-accent-warm">
          ← Voltar ao site
        </Link>
        <h1 className="mt-4 font-display text-4xl uppercase leading-[0.9]">
          Painel da <span className="inline-block -skew-x-6 text-accent-warm">equipe</span>
        </h1>
        <p className="mt-3 text-sm text-ink/70">
          Acesso restrito para publicar fotos das edições na galeria do site.
        </p>

        <form onSubmit={enviar} className="mt-8 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-bold">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-md border-2 border-ink/20 bg-white px-4 text-ink outline-none focus-visible:border-accent-warm"
            />
          </div>
          <div>
            <label htmlFor="senha" className="mb-1 block text-sm font-bold">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              autoComplete={modo === "entrar" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="h-12 w-full rounded-md border-2 border-ink/20 bg-white px-4 text-ink outline-none focus-visible:border-accent-warm"
            />
          </div>

          {erro && (
            <p role="alert" className="rounded-md bg-accent-warm/10 p-3 text-sm text-accent-warm">
              {erro}
            </p>
          )}
          {aviso && (
            <p role="status" className="rounded-md bg-ink/5 p-3 text-sm text-ink/80">
              {aviso}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="h-12 w-full rounded-md bg-accent-warm text-sm font-extrabold uppercase tracking-wide text-white disabled:opacity-60"
          >
            {carregando ? "Aguarde..." : modo === "entrar" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button
          type="button"
          onClick={entrarComGoogle}
          className="mt-3 h-12 w-full rounded-md border-2 border-ink/20 text-sm font-extrabold uppercase tracking-wide text-ink hover:border-accent-warm hover:text-accent-warm"
        >
          Entrar com Google
        </button>

        <button
          type="button"
          onClick={() => setModo(modo === "entrar" ? "criar" : "entrar")}
          className="mt-6 w-full text-sm text-ink/70 underline"
        >
          {modo === "entrar" ? "Ainda não tem conta? Criar conta" : "Já tem conta? Entrar"}
        </button>
      </div>
    </main>
  );
}
