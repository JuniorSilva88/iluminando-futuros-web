import { useRef, useState } from "react";

import img1 from "@/assets/oficial/img1-1200.jpg";
import img2 from "@/assets/oficial/img2-1200.jpg";
import img3 from "@/assets/oficial/img3-1200.jpg";
import img4 from "@/assets/oficial/img4-1200.jpg";
import img5 from "@/assets/oficial/img5-1200.jpg";
import img6 from "@/assets/oficial/img6-1024.jpg";
import img7 from "@/assets/oficial/img7-1200.jpg";
import img8 from "@/assets/oficial/img8-1024.jpg";
import img9 from "@/assets/oficial/img9-1200.jpg";

type Edicao = { id: string; rotulo: string; fotos: { src: string; alt: string }[] };

const edicoes: Edicao[] = [
  {
    id: "2024",
    rotulo: "Ação 2024",
    fotos: [
      { src: img1, alt: "Registro da Ação Entre Amigos 2024: voluntários reunidos durante a arrecadação" },
      { src: img2, alt: "Registro da Ação Entre Amigos 2024: brinquedos organizados para a entrega" },
      { src: img3, alt: "Registro da Ação Entre Amigos 2024: momento de confraternização com a comunidade" },
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
];

export function GaleriaEdicoes() {
  const [ativa, setAtiva] = useState(edicoes[0].id);
  const trilhoRef = useRef<HTMLUListElement>(null);

  const edicao = edicoes.find((e) => e.id === ativa) ?? edicoes[0];

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
            {edicao.fotos.map((f) => (
              <li
                key={f.src}
                className="w-[85%] shrink-0 snap-start sm:w-[48%] lg:w-[32%]"
              >
                <img
                  src={f.src}
                  alt={f.alt}
                  loading="lazy"
                  className="aspect-[4/3] w-full rounded-lg bg-white object-cover outline-1 -outline-offset-1 outline-black/5"
                />
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-sm text-ink/60">
              Arraste para o lado ou use os botões para ver mais fotos.
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
    </section>
  );
}
