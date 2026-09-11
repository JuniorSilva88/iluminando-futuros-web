import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

import { GaleriaEdicoes } from "@/components/GaleriaEdicoes";

import sobreCriancas from "@/assets/sobre-criancas.jpg";
import projetoEntrega from "@/assets/projeto-entrega.jpg";
import projetoColeta from "@/assets/projeto-coleta.jpg";
import logoCg from "@/assets/oficial/cgRefrigeracao.jpeg";
import logoArtec from "@/assets/oficial/arTecRefrigeracao.jpeg";
import logoNei from "@/assets/oficial/neiDoVolei.jpeg";
import logoC2 from "@/assets/oficial/c2ar.jpeg";
import logoCasa from "@/assets/oficial/casaDoFrentista.jpg";
import projetoVoluntarios from "@/assets/projeto-voluntarios.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Iluminando Futuros — Ação Entre Amigos" },
      {
        name: "description",
        content:
          "ONG Iluminando Futuros: doe brinquedos ou contribua por Pix na Ação Entre Amigos e leve alegria a crianças no fim de ano.",
      },
      { property: "og:title", content: "Iluminando Futuros — Ação Entre Amigos" },
      {
        property: "og:description",
        content:
          "Doe brinquedos ou apoie por Pix. Participe da Ação Entre Amigos e ajude a iluminar o futuro de muitas crianças.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const PIX_KEY = "41995756812";
const INSTAGRAM = "https://www.instagram.com/acao_entre_amigos_21/";
const WHATSAPP = "https://wa.me/5541995756812?text=Quero%20fazer%20uma%20doa%C3%A7%C3%A3o";

const navLinks = [
  { href: "#sobre", label: "Sobre" },
  { href: "#doar", label: "Como Doar" },
  { href: "#projetos", label: "Projetos" },
  { href: "#edicoes", label: "Edições" },
  { href: "#transparencia", label: "Transparência" },
];

const faixas = [
  { idade: "0 a 3 anos", exemplos: "brinquedos sensoriais, bonecos, música" },
  { idade: "4 a 7 anos", exemplos: "carrinhos, massinha, blocos" },
  { idade: "8 a 12 anos", exemplos: "jogos de tabuleiro, livros, esportes" },
  { idade: "13+ anos", exemplos: "material esportivo, livros, jogos" },
];

const projetos = [
  {
    tag: "Coleta",
    titulo: "Ponto de Coleta",
    texto: "Recebemos e organizamos os brinquedos doados por faixa etária.",
    img: projetoColeta,
    alt: "Brinquedos e presentes doados empilhados em um salão comunitário",
  },
  {
    tag: "Preparo",
    titulo: "Embalando com Carinho",
    texto: "Cada presente é conferido, limpo e embalado antes da entrega.",
    img: projetoEntrega,
    alt: "Criança embrulhando um presente com fita vermelha sobre a mesa",
  },
  {
    tag: "Ação",
    titulo: "Dia da Entrega",
    texto: "Voluntários levam os brinquedos até as crianças atendidas.",
    img: projetoVoluntarios,
    alt: "Voluntários sorridentes separando brinquedos ao ar livre",
  },
];

const parceiros = [
  { nome: "CG Refrigeração", logo: logoCg },
  { nome: "Artec Refrigeração", logo: logoArtec },
  { nome: "Nei do Vôlei", logo: logoNei },
  { nome: "C2 Ar Condicionado", logo: logoC2 },
  { nome: "Casa do Frentista", logo: logoCasa },
];

function Index() {
  const [enviando, setEnviando] = useState(false);

  const copiarPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      toast.success("Chave Pix copiada!");
    } catch {
      toast.error("Não foi possível copiar. Anote: " + PIX_KEY);
    }
  };

  const enviar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEnviando(true);
    const form = e.currentTarget;
    const dados = new FormData(form);
    const texto = `Olá! Sou ${dados.get("nome")}.\n${dados.get("mensagem")}\nContato: ${dados.get("email")} / ${dados.get("telefone")}`;
    window.open(`https://wa.me/5541995756812?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
    toast.success("Abrimos o WhatsApp para você finalizar o envio.");
    form.reset();
    setEnviando(false);
  };

  return (
    <div className="font-body">
      <Toaster />
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-sun focus:px-4 focus:py-2 focus:text-ink"
      >
        Ir para o conteúdo
      </a>

      {/* NAV */}
      <header className="sticky top-0 z-50 bg-brand text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="#conteudo" className="flex items-center gap-3">
            <span className="grid size-9 -skew-x-12 place-items-center bg-sun font-display text-lg text-ink">
              IF
            </span>
            <span className="font-display text-lg leading-none tracking-wide">
              ILUMINANDO<br className="sm:hidden" /> FUTUROS
            </span>
          </a>
          <nav aria-label="Principal" className="hidden items-center gap-8 text-sm font-semibold text-white/80 lg:flex">
            {navLinks.map((l) => (
              <a key={l.href} className="hover:text-sun" href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="#contato"
              className="hidden h-10 -skew-x-12 items-center border border-white/30 px-4 text-sm font-bold hover:bg-white/10 sm:inline-flex"
            >
              <span className="skew-x-12">Voluntário</span>
            </a>
            <a
              href="#doar"
               className="inline-flex h-10 -skew-x-12 items-center bg-sun px-5 text-sm font-extrabold text-ink"
            >
              <span className="skew-x-12">Doe Agora</span>
            </a>
          </div>
        </div>
      </header>

      <main id="conteudo">
        {/* HERO */}
        <section className="relative overflow-hidden bg-brand text-white">
          <div
            aria-hidden="true"
            className="absolute inset-0 z-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(115deg,#fff 0,#fff 2px,transparent 2px,transparent 26px)",
            }}
          />
          <div className="relative z-10 mx-auto max-w-7xl px-5 pb-28 pt-16 sm:px-8 lg:pb-44 lg:pt-24">
            <div className="max-w-4xl">
              <p className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-sun">
                Ação Entre Amigos
              </p>
              <h1 className="font-display text-[15vw] uppercase leading-[0.82] sm:text-[11vw] lg:text-[9.5rem]">
                <span className="block text-white">Iluminando</span>
                <span className="inline-block -skew-x-6 text-sun">o Futuro</span>
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">
                Doe brinquedos ou contribua pelo Pix e ajude a levar alegria a muitas crianças neste
                fim de ano.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href="#doar"
                  className="inline-flex h-14 -skew-x-12 items-center gap-2 bg-sun px-7 text-base font-extrabold text-ink"
                >
                  <span className="skew-x-12">Doe um brinquedo</span>
                  <span aria-hidden="true" className="skew-x-12 font-display">
                    →
                  </span>
                </a>
                <a
                  href="#contato"
                  className="inline-flex h-14 -skew-x-12 items-center gap-2 border-2 border-white/40 px-7 text-base font-bold text-white hover:bg-white hover:text-brand"
                >
                  <span className="skew-x-12">Ser voluntário</span>
                </a>
              </div>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 right-0 h-16 bg-cream"
            style={{ clipPath: "polygon(0 45%,100% 0,100% 100%,0 100%)" }}
          />
        </section>

        {/* SOBRE */}
        <section id="sobre" className="bg-cream text-ink">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:py-28">
            <div className="lg:col-span-5">
              <img
                src={sobreCriancas}
                alt="Crianças sorrindo e se abraçando em uma ação de doação de brinquedos"
                width={1024}
                height={1280}
                className="aspect-[4/5] w-full rounded-lg object-cover"
              />
            </div>
            <div className="lg:col-span-7">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-accent-warm">
                Sobre a ação
              </p>
              <h2 className="font-display text-4xl uppercase leading-[0.9] sm:text-5xl lg:text-6xl">
                Ação <span className="inline-block -skew-x-6 text-accent-warm">Entre Amigos</span>
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/75">
                A Ação Entre Amigos recolhe brinquedos e doações em dinheiro para distribuir sorrisos
                no final do ano. Os presentes são organizados por
                faixa etária — 0 a 3, 4 a 7, 8 a 12 e 13 anos ou mais — e entregues com carinho.
              </p>
              <ul className="mt-8 flex flex-wrap gap-3">
                <li className="inline-flex h-10 -skew-x-12 items-center bg-celebration px-4 text-sm font-bold text-white">
                  <span className="skew-x-12">Comunidade</span>
                </li>
                <li className="inline-flex h-10 -skew-x-12 items-center bg-accent-warm px-4 text-sm font-bold text-white">
                  <span className="skew-x-12">Acolhimento</span>
                </li>
                <li className="inline-flex h-10 -skew-x-12 items-center bg-sun px-4 text-sm font-bold text-ink">
                  <span className="skew-x-12">Alegria</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* COMO DOAR */}
        <section id="doar" className="relative overflow-hidden bg-ink text-white">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
            <div className="max-w-2xl">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-accent-warm">
                Como doar
              </p>
              <h2 className="font-display text-5xl uppercase leading-[0.9] sm:text-6xl lg:text-7xl">
                Faça a <span className="inline-block -skew-x-6 text-accent-warm">diferença</span>
              </h2>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border-t-8 border-sky-joy bg-brand p-8">
                <span className="font-display text-2xl text-sun">01</span>
                <h3 className="mt-2 font-display text-3xl uppercase">Doação via Pix</h3>
                <p className="mt-3 leading-relaxed text-white/80">
                  Sua contribuição torna possível a organização, o transporte e a entrega dos
                  brinquedos.
                </p>
                <div className="mt-5 rounded-lg bg-ink p-4">
                  <p className="text-xs uppercase tracking-widest text-white/60">Chave Pix</p>
                  <p className="font-display text-2xl tracking-wide text-sun">{PIX_KEY}</p>
                  <p className="mt-1 text-sm text-white/70">Alécio Camargo</p>
                  <button
                    type="button"
                    onClick={copiarPix}
                    className="mt-4 inline-flex h-11 -skew-x-12 items-center bg-sun px-5 text-sm font-extrabold text-ink"
                  >
                    <span className="skew-x-12">Copiar chave Pix</span>
                  </button>
                </div>
              </div>
              <div className="rounded-xl border-t-8 border-sun bg-brand p-8">
                <span className="font-display text-2xl text-sun">02</span>
                <h3 className="mt-2 font-display text-3xl uppercase">Doe um brinquedo</h3>
                <p className="mt-3 leading-relaxed text-white/80">
                  Preferimos brinquedos em bom estado, limpos e sem pilhas. Identifique a faixa etária
                  na embalagem:
                </p>
                <ul className="mt-5 space-y-2 text-sm">
                  {faixas.map((f, i) => (
                    <li
                      key={f.idade}
                      className={`flex flex-wrap justify-between gap-2 ${i < faixas.length - 1 ? "border-b border-white/15 pb-2" : ""}`}
                    >
                      <span className="font-bold text-sun">{f.idade}</span>
                      <span className="text-white/80">{f.exemplos}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-sm text-white/70">
                  Sua empresa quer organizar uma arrecadação? Podemos apoiar na logística e
                  divulgação — fale com a gente.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PROJETOS */}
        <section id="projetos" className="bg-cream text-ink">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-accent-warm">
                  Projetos &amp; ações
                </p>
                <h2 className="font-display text-4xl uppercase leading-[0.9] sm:text-5xl">
                  Onde a <span className="inline-block -skew-x-6 text-accent-warm">alegria</span> chega
                </h2>
              </div>
              <span className="text-sm font-bold text-ink/60">Registros das nossas edições</span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projetos.map((p) => (
                <article
                  key={p.titulo}
                  className="overflow-hidden rounded-lg bg-white outline-1 -outline-offset-1 outline-black/5"
                >
                  <img
                    src={p.img}
                    alt={p.alt}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <div className="p-5">
                    <span className="text-xs font-bold uppercase tracking-widest text-accent-warm">
                      {p.tag}
                    </span>
                    <h3 className="mt-1 font-display text-2xl uppercase">{p.titulo}</h3>
                    <p className="mt-2 text-sm text-ink/70">{p.texto}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <GaleriaEdicoes />

        {/* TRANSPARÊNCIA */}
        <section id="transparencia" className="bg-ink text-white">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:py-24">
            <div className="lg:col-span-7">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-accent-warm">
                Transparência
              </p>
              <h2 className="font-display text-4xl uppercase leading-[0.9] sm:text-5xl">
                Cada gesto, <span className="inline-block -skew-x-6 text-accent-warm">registrado</span>
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
                Acompanhe de perto a coleta, a organização e a entrega dos brinquedos. Ao final de
                cada edição, publicamos as imagens e o relato do que a sua doação tornou possível.
              </p>
            </div>
            <ul className="space-y-4 lg:col-span-5">
              <li className="flex items-center gap-4 rounded-lg border-l-8 border-accent-warm bg-brand p-5">
                <span aria-hidden="true" className="font-display text-2xl text-sun">A</span>
                <p className="text-sm text-white/85">Coleta registrada e organizada por faixa etária</p>
              </li>
              <li className="flex items-center gap-4 rounded-lg border-l-8 border-sun bg-brand p-5">
                <span aria-hidden="true" className="font-display text-2xl text-sun">B</span>
                <p className="text-sm text-white/85">Entrega acompanhada por voluntários e amigos</p>
              </li>
              <li className="flex items-center gap-4 rounded-lg border-l-8 border-sky-joy bg-brand p-5">
                <span aria-hidden="true" className="font-display text-2xl text-sun">C</span>
                <p className="text-sm text-white/85">Registros publicados ao final da edição</p>
              </li>
            </ul>
          </div>
        </section>

        {/* PARCEIROS */}
        <section className="bg-cream text-ink">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
            <h2 className="mb-8 text-center text-xs font-bold uppercase tracking-[0.25em] text-accent-warm">
              Patrocinadores &amp; parceiros
            </h2>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {parceiros.map((p) => (
                <li
                  key={p.nome}
                  className="grid h-28 place-items-center rounded-lg bg-white p-3 text-center outline-1 -outline-offset-1 outline-black/5"
                >
                  <img
                    src={p.logo}
                    alt={`Logo do parceiro ${p.nome}`}
                    loading="lazy"
                    className="max-h-20 w-auto max-w-full object-contain"
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CONTATO */}
        <section id="contato" className="relative overflow-hidden bg-brand text-white">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-28">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-accent-warm">
                Contato
              </p>
              <h2 className="font-display text-5xl uppercase leading-[0.9] sm:text-6xl">
                Vamos <span className="inline-block -skew-x-6 text-accent-warm">juntos</span>
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-white/80">
                Quer doar, ser voluntário, saber os pontos de coleta ou patrocinar? Fale com a gente
                pelo formulário ou direto no WhatsApp.
              </p>
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                 className="mt-8 inline-flex h-14 -skew-x-12 items-center gap-2 bg-sun px-7 text-base font-extrabold text-ink"
              >
                <span className="skew-x-12">Chamar no WhatsApp</span>
              </a>
            </div>
            <form onSubmit={enviar} className="space-y-4 rounded-xl bg-ink p-7">
              <div>
                <label htmlFor="nome" className="text-xs uppercase tracking-widest text-white/70">
                  Nome
                </label>
                <input
                  id="nome"
                  name="nome"
                  required
                  className="mt-1 h-12 w-full rounded-md bg-brand px-4 text-white outline-none ring-accent-warm placeholder:text-white/50 focus:ring-2"
                  placeholder="Seu nome"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="text-xs uppercase tracking-widest text-white/70">
                    E-mail
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="mt-1 h-12 w-full rounded-md bg-brand px-4 text-white outline-none ring-accent-warm placeholder:text-white/50 focus:ring-2"
                    placeholder="voce@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="telefone" className="text-xs uppercase tracking-widest text-white/70">
                    Telefone
                  </label>
                  <input
                    id="telefone"
                    name="telefone"
                    type="tel"
                    className="mt-1 h-12 w-full rounded-md bg-brand px-4 text-white outline-none ring-accent-warm placeholder:text-white/50 focus:ring-2"
                    placeholder="(41) 99999-9999"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="mensagem" className="text-xs uppercase tracking-widest text-white/70">
                  Mensagem
                </label>
                <textarea
                  id="mensagem"
                  name="mensagem"
                  rows={4}
                  required
                  className="mt-1 w-full rounded-md bg-brand px-4 py-3 text-white outline-none ring-accent-warm placeholder:text-white/50 focus:ring-2"
                  placeholder="Como você quer ajudar?"
                />
              </div>
              <button
                type="submit"
                disabled={enviando}
                 className="h-14 w-full -skew-x-12 bg-sun text-base font-extrabold text-ink disabled:opacity-70"
              >
                <span className="inline-block skew-x-12">Enviar mensagem</span>
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="bg-ink py-8 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-5 text-center text-sm text-white/70 sm:px-8 md:flex-row md:justify-between md:text-left">
          <span className="font-display tracking-wide text-white">ILUMINANDO FUTUROS</span>
          <a
            href={INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ação Entre Amigos no Instagram"
            className="inline-flex items-center gap-2 font-bold text-white hover:text-accent-warm"
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-6"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
            <span className="sr-only">@acao_entre_amigos_21 no Instagram</span>
          </a>
          <div className="flex flex-col gap-1">
            <span>© 2026 Ação Entre Amigos — Todos os direitos reservados</span>
            <span>Desenvolvido por Junior Silva</span>
          </div>
        </div>
      </footer>

      {/* AÇÃO FIXA MOBILE */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex gap-2 border-t border-white/10 bg-brand p-3 sm:hidden">
        <a
          href="#doar"
            className="flex-1 -skew-x-12 bg-sun py-3 text-center text-sm font-extrabold text-ink"
        >
          <span className="inline-block skew-x-12">Doar</span>
        </a>
        <a
          href={WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 -skew-x-12 border border-white/40 py-3 text-center text-sm font-bold text-white"
        >
          <span className="inline-block skew-x-12">WhatsApp</span>
        </a>
      </div>
      <div aria-hidden="true" className="h-20 bg-ink sm:hidden" />
    </div>
  );
}
