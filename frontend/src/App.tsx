import { useState } from "react";
import * as api from "./api";
import ChatScreen from "./components/ChatScreen";
import UploadScreen from "./components/UploadScreen";
import type { ChatMessage } from "./types";

function makeId() {
  return crypto.randomUUID();
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Erro desconhecido.";
}

interface Session {
  id: string;
  fileName: string;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleUpload(file: File) {
    setUploading(true);
    setUploadError(null);

    try {
      const result = await api.uploadPdf(file);
      setSession({ id: result.session_id, fileName: result.file_name });
      setMessages([
        {
          id: makeId(),
          role: "assistant",
          content:
            'Posso te ajudar a entender esse documento. Pergunte algo ou clique em "Ver resumo" a qualquer momento.',
        },
      ]);
    } catch (error) {
      setUploadError(errorMessage(error));
    } finally {
      setUploading(false);
    }
  }

  function handleEnd() {
    if (session) {
      void api.endSession(session.id);
    }
    setSession(null);
    setMessages([]);
    setPending(false);
  }

  async function handleSummary() {
    if (!session || pending) return;

    setPending(true);
    try {
      const result = await api.getSummary(session.id);
      setMessages((prev) => [...prev, { id: makeId(), role: "assistant", content: result.summary }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { id: makeId(), role: "assistant", content: `Não consegui gerar o resumo: ${errorMessage(error)}` },
      ]);
    } finally {
      setPending(false);
    }
  }

  async function handleAsk(question: string) {
    if (!session || pending) return;

    const normalized = question.trim().toLowerCase();

    if (normalized === "sair") {
      handleEnd();
      return;
    }

    setMessages((prev) => [...prev, { id: makeId(), role: "user", content: question }]);

    if (["resumo", "sumario", "sumário"].includes(normalized)) {
      await handleSummary();
      return;
    }

    setPending(true);
    try {
      const result = await api.askQuestion(session.id, question);
      setMessages((prev) => [
        ...prev,
        { id: makeId(), role: "assistant", content: result.answer, page: result.page ?? undefined },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { id: makeId(), role: "assistant", content: `Não consegui responder: ${errorMessage(error)}` },
      ]);
    } finally {
      setPending(false);
    }
  }

  if (!session) {
    return <UploadScreen onUpload={handleUpload} uploading={uploading} error={uploadError} />;
  }

  return (
    <ChatScreen
      fileName={session.fileName}
      messages={messages}
      pending={pending}
      onAsk={handleAsk}
      onSummary={handleSummary}
      onEnd={handleEnd}
    />
  );
}
