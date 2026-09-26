const API_URL = "http://localhost:8000";
const CONNECTION_ERROR = "Não consegui conectar ao servidor. Ele está rodando?";
const TIMEOUT_ERROR = "O servidor demorou demais para responder. Tente novamente.";

export interface UploadResponse {
  session_id: string;
  file_name: string;
  pages: number;
}

export interface AskResponse {
  answer: string;
  page: number | null;
}

export interface SummaryResponse {
  summary: string;
}

async function request(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(TIMEOUT_ERROR);
    }
    throw new Error(CONNECTION_ERROR);
  } finally {
    clearTimeout(timer);
  }
}

async function handle<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `Erro ${response.status} ao falar com o servidor.`);
  }
  return response.json();
}

export async function uploadPdf(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);

  const response = await request(`${API_URL}/api/upload`, { method: "POST", body: form }, 120_000);
  return handle<UploadResponse>(response);
}

export async function askQuestion(sessionId: string, question: string): Promise<AskResponse> {
  const response = await request(
    `${API_URL}/api/sessions/${sessionId}/ask`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    },
    60_000
  );
  return handle<AskResponse>(response);
}

export async function getSummary(sessionId: string): Promise<SummaryResponse> {
  const response = await request(`${API_URL}/api/sessions/${sessionId}/summary`, { method: "POST" }, 60_000);
  return handle<SummaryResponse>(response);
}

export async function endSession(sessionId: string): Promise<void> {
  try {
    await request(`${API_URL}/api/sessions/${sessionId}`, { method: "DELETE" }, 10_000);
  } catch {
    // encerrar é best-effort — a sessão local já foi limpa no cliente.
  }
}
