import { useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";

interface UploadScreenProps {
  onUpload: (file: File) => void;
  uploading: boolean;
  error: string | null;
}

export default function UploadScreen({ onUpload, uploading, error }: UploadScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file && file.type === "application/pdf") {
      onUpload(file);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="fixed left-16 top-10 flex items-center gap-2.5">
        <BrandMark />
        <span className="font-display text-[21px] font-semibold">Skimly</span>
      </div>

      <div className="fixed right-16 top-10">
        <ThemeToggle />
      </div>

      <div className="flex w-full max-w-[640px] flex-col items-center gap-6 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">
          Resumo + perguntas com citação de página
        </span>

        <h1 className="font-display text-[42px] font-semibold leading-tight">
          Envie um PDF para começar
        </h1>

        <p className="mt-[-10px] mb-[15px] max-w-[520px] text-base leading-relaxed text-[var(--color-muted)]">
          Skimly lê o documento, gera um resumo sob demanda e responde suas perguntas citando a
          página exata de onde tirou a resposta.
        </p>

        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            if (!uploading) setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragActive(false);
            if (!uploading) handleFiles(event.dataTransfer.files);
          }}
          className={`flex h-[250px] w-full flex-col items-center justify-center gap-3.5 rounded-2xl border-2 border-dashed bg-[var(--color-surface)] transition-colors disabled:cursor-not-allowed ${
            dragActive ? "border-[var(--color-accent)]" : "border-[var(--color-border)]"
          }`}
        >
          {uploading ? (
            <>
              <Spinner />
              <span className="text-base font-semibold">Processando PDF…</span>
              <span className="text-[13px] text-[var(--color-muted)]">
                Extraindo texto e gerando embeddings
              </span>
            </>
          ) : (
            <>
              <UploadIcon />
              <span className="text-base font-semibold">Arraste seu PDF aqui</span>
              <span className="text-[13px] text-[var(--color-muted)]">ou</span>
              <span className="rounded-[9px] bg-[var(--color-accent)] px-[22px] py-[11px] text-sm font-semibold text-white">
                Selecionar arquivo
              </span>
              <span className="mt-2.5 text-[12px] text-[var(--color-muted)]">PDF · até 50MB</span>
            </>
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
          onChange={(event) => handleFiles(event.target.files)}
        />

        {error && (
          <span className="text-[13px] font-semibold text-[var(--color-danger)]">{error}</span>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-8 flex justify-center">
        <span className="text-[12.5px] text-[var(--color-muted)]">
          Feito com 💙 por Naomi Lago
        </span>
      </div>
    </div>
  );
}

function BrandMark() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-accent)"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M9 15l2 2 4-4" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-accent)"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin text-[var(--color-accent)]"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeOpacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
