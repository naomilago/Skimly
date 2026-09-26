import "katex/dist/katex.min.css";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import ReactMarkdown, { type Components } from "react-markdown";
import type { ChatMessage } from "../types";

const markdownComponents: Components = {
  p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
  strong: ({ ...props }) => <strong className="font-semibold" {...props} />,
  ul: ({ ...props }) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0" {...props} />,
  ol: ({ ...props }) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0" {...props} />,
  h1: ({ ...props }) => (
    <p className="mb-1.5 mt-1 text-[15px] font-semibold first:mt-0" {...props} />
  ),
  h2: ({ ...props }) => (
    <p className="mb-1.5 mt-1 text-[15px] font-semibold first:mt-0" {...props} />
  ),
  h3: ({ ...props }) => (
    <p className="mb-1 mt-1 text-[14.5px] font-semibold first:mt-0" {...props} />
  ),
  code: ({ ...props }) => (
    <code className="rounded bg-[var(--color-paper)] px-1 py-0.5 font-mono text-[13px]" {...props} />
  ),
  a: ({ ...props }) => (
    <a className="underline" target="_blank" rel="noreferrer" {...props} />
  ),
};

export function RobotIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 64 64" fill="none">
      <rect x="29" y="19" width="6" height="9" fill="#1B2159" />
      <circle cx="32" cy="14" r="10" fill="#1B2159" />
      <circle cx="32" cy="14" r="6.5" fill="#E9394E" />
      <circle cx="29.5" cy="11.3" r="2" fill="#FF8D97" />

      <rect x="2" y="34" width="12" height="24" rx="5" fill="#1B2159" />
      <rect x="5" y="37" width="3" height="18" fill="#9AA0BC" />
      <rect x="8" y="37" width="3" height="18" fill="#666D8C" />

      <rect x="50" y="34" width="12" height="24" rx="5" fill="#1B2159" />
      <rect x="53" y="37" width="3" height="18" fill="#9AA0BC" />
      <rect x="56" y="37" width="3" height="18" fill="#666D8C" />

      <rect x="10" y="26" width="44" height="34" rx="12" fill="#1B2159" />
      <rect x="14" y="30" width="36" height="26" rx="9" fill="#EAF0FB" />
      <rect x="14" y="47" width="36" height="9" rx="3" fill="#D3E1F6" />

      <circle cx="25" cy="40" r="4.2" fill="#1B2159" />
      <circle cx="25" cy="40" r="2.4" fill="#A7ACC4" />
      <circle cx="39" cy="40" r="4.2" fill="#1B2159" />
      <circle cx="39" cy="40" r="2.4" fill="#A7ACC4" />

      <path
        d="M24 48q8 5 16 0"
        stroke="#1B2159"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function AssistantAvatar() {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]">
      <RobotIcon />
    </div>
  );
}

export default function ChatBubble({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return (
      <div className="max-w-[480px] self-end rounded-[14px_4px_14px_14px] bg-[var(--color-accent)] px-4 py-3.5 text-[14.5px] leading-relaxed text-white">
        {message.content}
      </div>
    );
  }

  return (
    <div className="flex max-w-[560px] min-w-0 items-start gap-2.5">
      <AssistantAvatar />
      <div className="flex min-w-0 flex-col gap-2">
        <div className="min-w-0 overflow-x-auto break-words rounded-[4px_14px_14px_14px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5 text-[14.5px] leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={markdownComponents}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        {message.page !== undefined && (
          <span className="self-start rounded-full bg-[var(--color-citation-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--color-citation-text)]">
            p. {message.page}
          </span>
        )}
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2.5">
      <AssistantAvatar />
      <div className="flex items-center gap-1.5 rounded-[4px_14px_14px_14px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-muted)] [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-muted)] [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-muted)]" />
      </div>
    </div>
  );
}
