import { useEffect, useRef, useState, type FormEvent } from "react";
import type { ChatMessage } from "../types";
import ChatBubble, { TypingIndicator } from "./ChatBubble";
import ThemeToggle from "./ThemeToggle";

interface ChatScreenProps {
  fileName: string;
  messages: ChatMessage[];
  pending: boolean;
  onAsk: (question: string) => void;
  onSummary: () => void;
  onEnd: () => void;
}

export default function ChatScreen({
  fileName,
  messages,
  pending,
  onAsk,
  onSummary,
  onEnd,
}: ChatScreenProps) {
  const [draft, setDraft] = useState("");
  const [confirmingEnd, setConfirmingEnd] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const question = draft.trim();
    if (!question || pending) return;
    onAsk(question);
    setDraft("");
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-10">
        <div className="flex items-center gap-3">
          <FileIcon />
          <span className="text-[15px] font-semibold">{fileName}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <button
            type="button"
            onClick={onSummary}
            disabled={pending}
            className="h-[38px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-[13.5px] font-semibold text-[var(--color-ink)] transition-colors hover:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Ver resumo
          </button>
          <button
            type="button"
            onClick={() => setConfirmingEnd(true)}
            className="h-[38px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-[13.5px] font-semibold text-[var(--color-danger)] transition-colors hover:border-[var(--color-danger)]"
          >
            Encerrar
          </button>
        </div>
      </header>

      {confirmingEnd && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-[380px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl">
            <h2 className="text-[16px] font-semibold">Encerrar esta sessão?</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-muted)]">
              O documento e o histórico da conversa serão perdidos.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmingEnd(false)}
                className="h-[38px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-[13.5px] font-semibold text-[var(--color-ink)] transition-colors hover:border-[var(--color-accent)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmingEnd(false);
                  onEnd();
                }}
                className="h-[38px] rounded-lg bg-[var(--color-danger)] px-4 text-[13.5px] font-semibold text-white"
              >
                Encerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-auto py-9">
        <div className="mx-auto flex max-w-[720px] flex-col gap-4.5 px-6">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          {pending && <TypingIndicator />}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-surface)] py-4.5"
      >
        <div className="mx-auto flex max-w-[720px] items-center gap-3 px-6">
          <label htmlFor="skimly-question" className="sr-only">
            Pergunta sobre o documento
          </label>
          <input
            id="skimly-question"
            value={draft}
            disabled={pending}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Pergunte algo sobre o documento…"
            className="h-[46px] flex-1 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-[14.5px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={pending}
            aria-label="Enviar pergunta"
            className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[10px] bg-[var(--color-accent)] text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <SendIcon />
          </button>
        </div>
      </form>
    </div>
  );
}

function FileIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-accent)"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
