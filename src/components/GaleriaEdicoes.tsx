import { useCallback, useEffect, useRef, useState } from "react";

import img1 from "@/assets/oficial/img1-1200.jpg";
import img2 from "@/assets/oficial/img2-1200.jpg";
import img4 from "@/assets/oficial/img4-1200.jpg";
import img5 from "@/assets/oficial/img5-1200.jpg";
import img6 from "@/assets/oficial/img6-1024.jpg";
import img7 from "@/assets/oficial/img7-1200.jpg";
import img8 from "@/assets/oficial/img8-1024.jpg";
import img9 from "@/assets/oficial/img9-1200.jpg";

const edicoes = [
  {
    id: "2024",
    rotulo: "Ação 2024",
    fotos: [
      { src: img1, alt: "Registro da Ação Entre Amigos 2024: voluntários reunidos durante a arrecadação" },
      { src: img2, alt: "Registro da Ação Entre Amigos 2024: brinquedos organizados para a entrega" },
      { src: img4, alt: "Registro da Ação Entre Amigos 2024: entrega de presentes às crianças" },
      { src: img5, alt: "Registro da Ação Entre Amigos 2024: equipe preparando as doações" },
    ],
  },
  {
    id: "2025",
    rotulo: "Ação 2025",
    fotos: [
      { src: img6, alt: "Registro da Ação Entre Amigos 2025: voluntários durante a ação" },
      { src: img7, alt: "Registro da Ação Entre Amigos 2025: crianças recebendo brinquedos" },
      { src: img8, alt: "Registro da Ação Entre Amigos 2025: doações reunidas no ponto de coleta" },
      { src: img9, alt: "Registro da Ação Entre Amigos 2025: amigos e apoiadores no dia da entrega" },
    ],
  },
] as const;

type Edicao = (typeof edicoes)[number];

export function GaleriaEdicoes() {
  const [ativa, setAtiva] = useState<string>(edicoes[0].id);
  const [modalAberta, setModalAberta] = useState(false);
  const [indiceModal, setIndiceModal] = useState(0);
  const trilhoRef = useRef<HTMLUListElement>(null);
  const botaoFecharRef = useRef<HTMLButtonElement>(null);
  const ultimoFocoRef = useRef<HTMLElement | null>(null);

  const edicao: Edicao = edicoes.find((e) => e.id === ativa) ?? edicoes[0];

  const abrirModal = useCallback((indice: number) => {
    ultimoFocoRef.current = document.activeElement as HTMLElement;
    setIndiceModal(indice);
    setModalAberta(true);
  }, []);

  const fecharModal = useCallback(() => {
    setModalAberta(false);
    ultimoFocoRef.current?.focus();
  }, []);

  const mudarFoto = useCallback((direcao: 1 | -1) => {
    setIndiceModal((atual) => {
      const proximo = atual + direcao;
      if (proximo < 0) return edicao.fotos.length - 1;
      if (proximo >= edicao.fotos.length) return 0;
      return proximo;
    });
  }, [edicao.fotos.length]);

  useEffect(() => {
    if (!modalAberta) return;
    botaoFecharRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") fecharModal();
      if (e.key === "ArrowRight") mudarFoto(1);
      if (e.key === "ArrowLeft") mudarFoto(-1);
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [modalAberta, fecharModal, mudarFoto]);

  const mover = (dir: 1 | -1) => {
    const el = trilhoRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section id="edicoes" className="bg-cream text-ink">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-accent-warm">
              Memórias
            </p>
            <h2 className="font-display text-4xl uppercase leading-[0.9] sm:text-5xl">
              Imagens de <span className="inline-block -skew-x-6 text-accent-warm">edições anteriores</span>
            </h2>
          </div>
          <div
            role="tablist"
            aria-label="Escolher edição"
            className="flex gap-2"
          >
            {edicoes.map((e) => (
              <button
                key={e.id}
                role="tab"
                type="button"
                aria-selected={ativa === e.id}
                aria-controls={`painel-${e.id}`}
                id={`aba-${e.id}`}
                onClick={() => {
                  setAtiva(e.id);
                  trilhoRef.current?.scrollTo({ left: 0 });
                }}
                className={`inline-flex h-11 -skew-x-12 items-center px-5 text-sm font-extrabold uppercase transition ${
                  ativa === e.id
                    ? "bg-accent-warm text-white"
                    : "border-2 border-ink/20 text-ink/70 hover:border-accent-warm hover:text-accent-warm"
                }`}
              >
                <span className="skew-x-12">{e.rotulo}</span>
              </button>
            ))}
          </div>
        </div>

        <div
          id={`painel-${edicao.id}`}
          role="tabpanel"
          aria-labelledby={`aba-${edicao.id}`}
          className="relative"
        >
          <ul
            ref={trilhoRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:thin]"
          >
            {edicao.fotos.map((f, i) => (
              <li
                key={f.src}
                className="w-[85%] shrink-0 snap-start sm:w-[48%] lg:w-[32%]"
              >
                <button
                  type="button"
                  onClick={() => abrirModal(i)}
                  className="group relative block w-full overflow-hidden rounded-lg bg-white text-left outline-1 -outline-offset-1 outline-black/5 focus-visible:outline-2 focus-visible:outline-accent-warm"
                  aria-label={`Ampliar foto ${i + 1} de ${edicao.fotos.length}: ${f.alt}`}
                >
                  <img
                    src={f.src}
                    alt={f.alt}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-ink/0 transition duration-300 group-hover:bg-ink/20">
                    <span className="grid size-12 place-items-center rounded-full bg-white/90 text-ink opacity-0 shadow-lg transition duration-300 group-hover:opacity-100">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                        <path d="M11 8v6M8 11h6" />
                      </svg>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-sm text-ink/60">
              Arraste para o lado ou use os botões para ver mais fotos. Toque em uma imagem para ampliar.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => mover(-1)}
                aria-label="Ver fotos anteriores"
                className="grid size-11 place-items-center rounded-full border-2 border-ink/20 text-ink hover:border-accent-warm hover:text-accent-warm"
              >
                <span aria-hidden="true">←</span>
              </button>
              <button
                type="button"
                onClick={() => mover(1)}
                aria-label="Ver próximas fotos"
                className="grid size-11 place-items-center rounded-full border-2 border-ink/20 text-ink hover:border-accent-warm hover:text-accent-warm"
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {modalAberta && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Foto ${indiceModal + 1} de ${edicao.fotos.length}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-4"
          onClick={fecharModal}
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={botaoFecharRef}
              type="button"
              onClick={fecharModal}
              aria-label="Fechar galeria"
              className="absolute -top-12 right-0 grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-accent-warm"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="relative flex items-center justify-center">
              <button
                type="button"
                onClick={() => mudarFoto(-1)}
                aria-label="Foto anterior"
                className="absolute left-0 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-accent-warm sm:-left-14"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>

              <img
                src={edicao.fotos[indiceModal].src}
                alt={edicao.fotos[indiceModal].alt}
                className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
              />

              <button
                type="button"
                onClick={() => mudarFoto(1)}
                aria-label="Próxima foto"
                className="absolute right-0 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-accent-warm sm:-right-14"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>

            <p className="mt-4 text-center text-sm text-white/80">
              {indiceModal + 1} / {edicao.fotos.length}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
