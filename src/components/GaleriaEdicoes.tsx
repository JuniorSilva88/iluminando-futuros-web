import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { fotosGaleriaQuery } from "@/lib/galeria";

import img1 from "@/assets/oficial/img1-1200.jpg";
import img1_480 from "@/assets/oficial/img1-480.jpg";
import img1_768 from "@/assets/oficial/img1-768.jpg";
import img2 from "@/assets/oficial/img2-1200.jpg";
import img2_480 from "@/assets/oficial/img2-480.jpg";
import img2_768 from "@/assets/oficial/img2-768.jpg";
import img4 from "@/assets/oficial/img4-1200.jpg";
import img4_480 from "@/assets/oficial/img4-480.jpg";
import img4_768 from "@/assets/oficial/img4-768.jpg";
import img5 from "@/assets/oficial/img5-1200.jpg";
import img5_480 from "@/assets/oficial/img5-480.jpg";
import img5_768 from "@/assets/oficial/img5-768.jpg";
import img6 from "@/assets/oficial/img6-1024.jpg";
import img6_480 from "@/assets/oficial/img6-480.jpg";
import img6_768 from "@/assets/oficial/img6-768.jpg";
import img7 from "@/assets/oficial/img7-1200.jpg";
import img7_480 from "@/assets/oficial/img7-480.jpg";
import img7_768 from "@/assets/oficial/img7-768.jpg";
import img8 from "@/assets/oficial/img8-1024.jpg";
import img8_480 from "@/assets/oficial/img8-480.jpg";
import img8_768 from "@/assets/oficial/img8-768.jpg";
import img9 from "@/assets/oficial/img9-1200.jpg";
import img9_480 from "@/assets/oficial/img9-480.jpg";
import img9_768 from "@/assets/oficial/img9-768.jpg";

type Foto = {
  src: string;
  srcSet?: string;
  largura: number;
  alt: string;
};

function criaFoto(
  grande: string,
  pequena: string,
  media: string,
  largura: number,
  alt: string,
): Foto {
  return {
    src: grande,
    srcSet: `${pequena} 480w, ${media} 768w, ${grande} ${largura}w`,
    largura,
    alt,
  };
}

const edicoes = [
  {
    id: "2024",
    rotulo: "Ação 2024",
    fotos: [
      criaFoto(img1, img1_480, img1_768, 1200, "Registro da Ação Entre Amigos 2024: voluntários reunidos durante a arrecadação"),
      criaFoto(img2, img2_480, img2_768, 1200, "Registro da Ação Entre Amigos 2024: brinquedos organizados para a entrega"),
      criaFoto(img4, img4_480, img4_768, 1200, "Registro da Ação Entre Amigos 2024: entrega de presentes às crianças"),
      criaFoto(img5, img5_480, img5_768, 1200, "Registro da Ação Entre Amigos 2024: equipe preparando as doações"),
    ],
  },
  {
    id: "2025",
    rotulo: "Ação 2025",
    fotos: [
      criaFoto(img6, img6_480, img6_768, 1024, "Registro da Ação Entre Amigos 2025: voluntários durante a ação"),
      criaFoto(img7, img7_480, img7_768, 1200, "Registro da Ação Entre Amigos 2025: crianças recebendo brinquedos"),
      criaFoto(img8, img8_480, img8_768, 1024, "Registro da Ação Entre Amigos 2025: doações reunidas no ponto de coleta"),
      criaFoto(img9, img9_480, img9_768, 1200, "Registro da Ação Entre Amigos 2025: amigos e apoiadores no dia da entrega"),
    ],
  },
] as const;

type Edicao = { id: string; rotulo: string; fotos: Foto[] };

/** Larguras ocupadas por cada card do carrossel conforme o viewport. */
const SIZES_CARROSSEL = "(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 85vw";

export function GaleriaEdicoes() {
  const [ativa, setAtiva] = useState<string>(edicoes[0].id);
  const [modalAberta, setModalAberta] = useState(false);
  const [indiceModal, setIndiceModal] = useState(0);
  const trilhoRef = useRef<HTMLUListElement>(null);
  const botaoFecharRef = useRef<HTMLButtonElement>(null);
  const dialogoRef = useRef<HTMLDivElement>(null);
  const ultimoFocoRef = useRef<HTMLElement | null>(null);
  const queryClient = useQueryClient();

  // Fotos publicadas pelo painel administrativo.
  const { data: enviadas } = useQuery(fotosGaleriaQuery);

  // Atualiza a galeria em tempo real, sem recarregar a página.
  useEffect(() => {
    const canal = supabase
      .channel("galeria-publica")
      .on("postgres_changes", { event: "*", schema: "public", table: "galeria_fotos" }, () => {
        queryClient.invalidateQueries({ queryKey: fotosGaleriaQuery.queryKey });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
  }, [queryClient]);

  const listaEdicoes: Edicao[] = useMemo(
    () =>
      edicoes.map((e) => ({
        id: e.id,
        rotulo: e.rotulo,
        fotos: [
          ...(enviadas ?? [])
            .filter((f) => f.edicao === e.id)
            .map((f): Foto => ({ src: f.url, largura: 1200, alt: f.alt })),
          ...e.fotos,
        ],
      })),
    [enviadas],
  );

  const edicao: Edicao = listaEdicoes.find((e) => e.id === ativa) ?? listaEdicoes[0] ?? { id: ativa, rotulo: `Ação ${ativa}`, fotos: [] };

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

  // Pré-carrega a foto seguinte do lightbox para navegação instantânea.
  useEffect(() => {
    if (!modalAberta) return;
    const proxima = edicao.fotos[(indiceModal + 1) % edicao.fotos.length];
    if (proxima) {
      const img = new Image();
      img.src = proxima.src;
    }
  }, [modalAberta, indiceModal, edicao]);

  useEffect(() => {
    if (!modalAberta) return;
    botaoFecharRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        fecharModal();
        return;
      }
      if (e.key === "ArrowRight") mudarFoto(1);
      if (e.key === "ArrowLeft") mudarFoto(-1);
      if (e.key === "Tab") {
        // Focus trap: mantém o foco dentro da janela ampliada.
        const container = dialogoRef.current;
        if (!container) return;
        const focaveis = Array.from(
          container.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => !el.hasAttribute("disabled"));
        if (focaveis.length === 0) return;
        const primeiro = focaveis[0];
        const ultimo = focaveis[focaveis.length - 1];
        if (!primeiro || !ultimo) return;
        const ativo = document.activeElement as HTMLElement | null;
        if (e.shiftKey && (ativo === primeiro || !container.contains(ativo))) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && (ativo === ultimo || !container.contains(ativo))) {
          e.preventDefault();
          primeiro.focus();
        }
      }
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
    <section id="edicoes" className="overflow-x-clip bg-cream text-ink">
      <div className="site-container site-section">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="section-label">
              Memórias
            </p>
            <h2 className="section-title">
              Imagens de <span className="inline-block  text-accent-warm">edições anteriores</span>
            </h2>
          </div>
          <div
            role="tablist"
            aria-label="Escolher edição"
            className="flex flex-wrap gap-2"
          >
            {edicoes.map((e) => (
              <Button variant="ghost"
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
                className={`inline-flex h-11  items-center px-5 text-sm font-extrabold  transition ${
                  ativa === e.id
                    ? "bg-muted text-foreground"
                    : "border border-ink/20 text-ink/70 hover:border-accent-warm hover:text-accent-warm"
                }`}
              >
                <span className="">{e.rotulo}</span>
              </Button>
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
            tabIndex={0}
            aria-label={`Fotos da ${edicao.rotulo}. Use as setas do teclado para percorrer.`}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") {
                e.preventDefault();
                mover(1);
              }
              if (e.key === "ArrowLeft") {
                e.preventDefault();
                mover(-1);
              }
            }}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth pb-4 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-warm"
          >
            {edicao.fotos.map((f, i) => (
              <li
                key={f.src}
                className="w-[85%] max-w-full shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]"
              >
                <Button variant="ghost"
                  type="button"
                  onClick={() => abrirModal(i)}
                  className="group relative block h-auto w-full overflow-hidden rounded-lg bg-background p-0 text-left outline-1 -outline-offset-1 outline-border focus-visible:outline-2 focus-visible:outline-accent-warm"
                  aria-label={`Ampliar foto ${i + 1} de ${edicao.fotos.length}: ${f.alt}`}
                >
                  <img
                    src={f.src}
                    srcSet={f.srcSet}
                    sizes={SIZES_CARROSSEL}
                    width={f.largura}
                    height={Math.round((f.largura * 3) / 4)}
                    alt={f.alt}
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-ink/0 transition duration-300 group-hover:bg-ink/20">
                    <span className="grid size-12 place-items-center rounded-full bg-background text-ink opacity-0  transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                        <path d="M11 8v6M8 11h6" />
                      </svg>
                    </span>
                  </span>
                </Button>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-sm text-ink/60">
              {edicao.fotos.length} registros
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost"
                type="button"
                onClick={() => mover(-1)}
                aria-label="Ver fotos anteriores"
                className="grid size-11 place-items-center rounded-full border border-ink/20 text-ink hover:border-accent-warm hover:text-accent-warm"
              >
                <span aria-hidden="true">←</span>
              </Button>
              <Button variant="ghost"
                type="button"
                onClick={() => mover(1)}
                aria-label="Ver próximas fotos"
                className="grid size-11 place-items-center rounded-full border border-ink/20 text-ink hover:border-accent-warm hover:text-accent-warm"
              >
                <span aria-hidden="true">→</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {modalAberta && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-4"
          onClick={fecharModal}
        >
          <div
            ref={dialogoRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lightbox-titulo"
            aria-describedby="lightbox-instrucoes"
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="lightbox-titulo" className="sr-only">
              {`${edicao.rotulo} — foto ${indiceModal + 1} de ${edicao.fotos.length}`}
            </h2>
            <p id="lightbox-instrucoes" className="sr-only">
              Use as setas esquerda e direita para navegar entre as fotos e a tecla Escape para fechar.
            </p>
            <Button variant="ghost"
              ref={botaoFecharRef}
              type="button"
              onClick={fecharModal}
              aria-label="Fechar galeria"
              className="absolute -top-12 right-0 grid size-11 place-items-center rounded-full bg-background/10 text-background transition hover:bg-background/20 focus-visible:outline-2 focus-visible:outline-accent-warm"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </Button>

            <div className="relative flex items-center justify-center">
              <Button variant="ghost"
                type="button"
                onClick={() => mudarFoto(-1)}
                aria-label="Foto anterior"
                className="absolute left-1 z-10 grid size-11 place-items-center rounded-full bg-ink/60 text-background transition hover:bg-ink/80 focus-visible:outline-2 focus-visible:outline-accent-warm lg:-left-14 lg:bg-background/10 lg:hover:bg-background/20"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </Button>

              {(() => {
                const foto = edicao.fotos[indiceModal];
                if (!foto) return null;
                return (
                  <img
                    key={foto.src}
                    src={foto.src}
                    srcSet={foto.srcSet}
                    sizes="(min-width: 1024px) 80vw, 100vw"
                    alt={foto.alt}
                    decoding="async"
                    className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain "
                  />
                );
              })()}

              <Button variant="ghost"
                type="button"
                onClick={() => mudarFoto(1)}
                aria-label="Próxima foto"
                className="absolute right-1 z-10 grid size-11 place-items-center rounded-full bg-ink/60 text-background transition hover:bg-ink/80 focus-visible:outline-2 focus-visible:outline-accent-warm lg:-right-14 lg:bg-background/10 lg:hover:bg-background/20"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Button>
            </div>

            <p
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="mt-4 text-center text-sm text-background/80"
            >
              <span aria-hidden="true">
                {indiceModal + 1} / {edicao.fotos.length}
              </span>
              <span className="sr-only">
                {`Foto ${indiceModal + 1} de ${edicao.fotos.length}: ${edicao.fotos[indiceModal]?.alt ?? ""}`}
              </span>
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
