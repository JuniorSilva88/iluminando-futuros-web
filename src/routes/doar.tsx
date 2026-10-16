import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/doar")({
  head: () => ({
    meta: [
      { title: "Doar — Iluminando Futuros | Ação Entre Amigos" },
      {
        name: "description",
        content:
          "Faça sua doação por Pix para a Ação Entre Amigos: escolha o valor, gere o código Pix copia e cola ou QR Code e envie o comprovante.",
      },
      { property: "og:title", content: "Doe agora — Ação Entre Amigos" },
      {
        property: "og:description",
        content: "Contribua por Pix e ajude a levar brinquedos e alegria a muitas crianças.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DoarPage,
});

const PIX_KEY = "41995756812";
const PIX_NOME = "Alécio Camargo";
const VALORES = [20, 50, 100, 200];

// Gera o "Pix copia e cola" (BR Code / EMV) com valor
function tlv(id: string, v: string) {
  return id + v.length.toString().padStart(2, "0") + v;
}
function crc16(s: string) {
  let crc = 0xffff;
  for (let i = 0; i < s.length; i++) {
    crc ^= s.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    crc &= 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}
function semAcento(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}
function gerarPix(valor: number) {
  const conta = tlv("00", "br.gov.bcb.pix") + tlv("01", "+55" + PIX_KEY);
  const payload =
    tlv("00", "01") +
    tlv("26", conta) +
    tlv("52", "0000") +
    tlv("53", "986") +
    (valor > 0 ? tlv("54", valor.toFixed(2)) : "") +
    tlv("58", "BR") +
    tlv("59", semAcento(PIX_NOME).slice(0, 25)) +
    tlv("60", "BRASIL") +
    tlv("62", tlv("05", "DOACAO")) +
    "6304";
  return payload + crc16(payload);
}

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(100),
  email: z.string().trim().email("E-mail inválido").max(255).or(z.literal("")),
  valor: z.number().min(1, "Valor mínimo de R$ 1,00").max(100000, "Valor muito alto"),
});

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function DoarPage() {
  const [valorSel, setValorSel] = useState<number | "outro">(50);
  const [outro, setOutro] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [erros, setErros] = useState<{ nome?: string; email?: string; valor?: string }>({});
  const [gerado, setGerado] = useState<{ valor: number; nome: string } | null>(null);

  const valor = valorSel === "outro" ? Number(outro.replace(",", ".")) || 0 : valorSel;
  const pixCode = useMemo(() => (gerado ? gerarPix(gerado.valor) : ""), [gerado]);

  const copiar = async (texto: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      toast.success(msg);
    } catch {
      toast.error("Não foi possível copiar. Selecione e copie manualmente.");
    }
  };

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse({ nome, email, valor });
    if (!r.success) {
      const map: Record<string, string> = {};
      r.error.issues.forEach((i) => (map[String(i.path[0])] = i.message));
      setErros(map as typeof erros);
      return;
    }
    setErros({});
    setGerado({ valor: r.data.valor, nome: r.data.nome });
    setTimeout(() => document.getElementById("pagamento")?.focus(), 50);
  };

  const whatsapp = gerado
    ? `https://wa.me/5541995756812?text=${encodeURIComponent(
        `Olá! Sou ${gerado.nome} e fiz uma doação de ${brl(gerado.valor)} via Pix para a Ação Entre Amigos. Segue o comprovante.`,
      )}`
    : "";

  return (
    <div className="min-h-screen bg-cream text-ink font-body">
      <Toaster />
      <header className="bg-muted text-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" className="font-display text-xl  tracking-wide">
            Ação Entre Amigos
          </Link>
          <Link to="/" className="text-sm font-bold underline-offset-4 hover:underline">
            ← Voltar ao início
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <p className="text-xs font-bold  tracking-[0.25em] text-accent-warm">Doe agora</p>
        <h1 className="mt-2 font-display text-5xl  leading-tight text-brand sm:text-6xl">
          Faça sua doação
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Sua contribuição torna possível a organização, o transporte e a entrega dos brinquedos.
          Escolha um valor e pague por Pix.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <form onSubmit={enviar} noValidate className="rounded-lg border border-border bg-card p-6  sm:p-8">
            <fieldset>
              <legend className="font-display text-2xl  text-brand">1. Escolha o valor</legend>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {VALORES.map((v) => (
                  <Button
                    variant="outline"
                    key={v}
                    type="button"
                    aria-pressed={valorSel === v}
                    onClick={() => setValorSel(v)}
                    className={`h-12 rounded-md border font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      valorSel === v ? "border-brand bg-muted text-foreground" : "border-border hover:border-brand"
                    }`}
                  >
                    {brl(v)}
                  </Button>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                aria-pressed={valorSel === "outro"}
                onClick={() => setValorSel("outro")}
                className={`mt-3 h-12 w-full rounded-md border font-bold ${
                  valorSel === "outro" ? "border-brand bg-muted text-foreground" : "border-border hover:border-brand"
                }`}
              >
                Outro valor
              </Button>
              {valorSel === "outro" && (
                <div className="mt-3">
                  <label htmlFor="outro" className="text-sm font-bold">Valor (R$)</label>
                  <input
                    id="outro"
                    inputMode="decimal"
                    value={outro}
                    onChange={(e) => setOutro(e.target.value.replace(/[^\d,.]/g, ""))}
                    placeholder="Ex.: 35,00"
                    className="mt-1 h-12 w-full rounded-md border border-input bg-background px-3"
                  />
                </div>
              )}
              {erros.valor && <p role="alert" className="mt-2 text-sm text-destructive">{erros.valor}</p>}
            </fieldset>

            <fieldset className="mt-8">
              <legend className="font-display text-2xl  text-brand">2. Seus dados</legend>
              <label htmlFor="nome" className="mt-4 block text-sm font-bold">Nome *</label>
              <input
                id="nome"
                value={nome}
                maxLength={100}
                onChange={(e) => setNome(e.target.value)}
                aria-invalid={!!erros.nome}
                className="mt-1 h-12 w-full rounded-md border border-input bg-background px-3"
              />
              {erros.nome && <p role="alert" className="mt-1 text-sm text-destructive">{erros.nome}</p>}
              <label htmlFor="email" className="mt-4 block text-sm font-bold">E-mail (opcional)</label>
              <input
                id="email"
                type="email"
                value={email}
                maxLength={255}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!erros.email}
                className="mt-1 h-12 w-full rounded-md border border-input bg-background px-3"
              />
              {erros.email && <p role="alert" className="mt-1 text-sm text-destructive">{erros.email}</p>}
            </fieldset>

            <Button
              type="submit"
              className="mt-8 inline-flex h-14 w-full  items-center justify-center bg-sun text-base font-extrabold text-ink"
            >
              <span className="">Gerar Pix de {brl(valor)}</span>
            </Button>
          </form>

          <section
            id="pagamento"
            tabIndex={-1}
            aria-live="polite"
            className="rounded-lg border border-border bg-muted p-6 text-foreground outline-none sm:p-8"
          >
            <h2 className="font-display text-2xl  text-foreground">3. Pague com Pix</h2>
            {gerado ? (
              <>
                <p className="mt-2 opacity-85">
                  Valor: <strong>{brl(gerado.valor)}</strong>. Escaneie o QR Code ou use o Pix copia e cola no app do seu banco.
                </p>
                <div className="mt-5 flex justify-center rounded-lg bg-card p-4">
                  <QRCodeSVG value={pixCode} size={240} title={`QR Code Pix para doação de ${brl(gerado.valor)}`} className="max-w-full" />
                </div>
                <label htmlFor="copiaecola" className="mt-5 block text-xs  tracking-widest opacity-70">
                  Pix copia e cola
                </label>
                <textarea
                  id="copiaecola"
                  readOnly
                  value={pixCode}
                  rows={3}
                  className="mt-1 w-full break-all rounded-md bg-muted p-3 text-xs text-foreground"
                />
                <div className="mt-3 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={() => copiar(pixCode, "Código Pix copiado!")}
                    className="inline-flex h-11  items-center bg-sun px-5 text-sm font-extrabold text-ink"
                  >
                    <span className="">Copiar código Pix</span>
                  </Button>
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 rounded-lg bg-primary text-primary-foreground items-center border border-border px-5 text-sm font-bold"
                  >
                    <span className="">Enviar comprovante</span>
                  </a>
                </div>
              </>
            ) : (
              <p className="mt-2 opacity-85">Preencha o formulário para gerar o QR Code e o Pix copia e cola com o valor escolhido.</p>
            )}

            <div className="mt-8 rounded-lg bg-muted p-4">
              <p className="text-xs  tracking-widest opacity-60">Chave Pix</p>
              <p className="font-display text-2xl tracking-wide text-foreground">{PIX_KEY}</p>
              <p className="mt-1 text-sm opacity-70">{PIX_NOME}</p>
              <Button
                type="button"
                onClick={() => copiar(PIX_KEY, "Chave Pix copiada!")}
                className="mt-4 inline-flex h-11  items-center bg-sun px-5 text-sm font-extrabold text-ink"
              >
                <span className="">Copiar chave Pix</span>
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
