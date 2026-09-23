# 📄 Briefing — Skimly (PDF Summarizer & Q&A Assistant)

## 🎯 Objetivo
Construir um agente que recebe um PDF, gera um resumo e depois responde perguntas sobre o conteúdo — praticando **state**, **tool calling** e **RAG básico** no LangGraph.

---

## 🏗️ Arquitetura do grafo

| Node | Função |
|---|---|
| `load_pdf` | Extrai texto do PDF |
| `chunk_and_embed` | Divide texto em chunks + gera embeddings (vector store) |
| `summarize` | Gera resumo (map-reduce se o doc for longo) |
| `ask_question` | Recebe pergunta do usuário |
| `retrieve_and_answer` | Busca chunks relevantes + responde |

**Fluxo:**
```
load_pdf → chunk_and_embed → ask_question
                                  │
                    ┌─────────────┼──────────────┐
                    │             │              │
               "resumo"      pergunta          "sair"
                    │             │              │
               summarize  retrieve_and_answer   END
                    │             │
                    └──────┬──────┘
                            ↓
                     volta pro ask_question
```
A edge condicional em `ask_question` decide a rota: `"resumo"`/`"sumário"` → `summarize`; `"sair"` → `END`; qualquer outra coisa → `retrieve_and_answer`. O resumo não roda mais automaticamente — só quando pedido.

---

## 🧰 Stack
- **LangGraph** + **LangChain** (loaders, text splitter)
- **PyPDFLoader** (extração de PDF)
- **Chroma** (vector store local, sem custo)
- **SqliteSaver** (checkpointer do LangGraph, persiste sessão/histórico em disco)
- **Claude (Anthropic API)** como LLM
- **uv** como gerenciador de pacotes/ambiente
- **CLI simples** pra começar (Streamlit é stretch goal)

---

## 🗂️ Estrutura do projeto

```
main.py               ← entrypoint CLI
src/
├── state.py             ← GraphState
├── graph.py              ← montagem do grafo
└── nodes/
    ├── load_pdf.py
    ├── chunk_and_embed.py
    ├── summarize.py
    ├── ask_question.py
    └── retrieve_and_answer.py
data/                  ← PDFs de teste + checkpoints.sqlite (ignorado no git)
.env.example            ← ANTHROPIC_API_KEY
pyproject.toml
```

## 🗂️ State schema (esqueleto)

```python
from typing import Annotated, TypedDict

from langchain_core.documents import Document
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class GraphState(TypedDict):
    file_path: str
    raw_text: list[Document]
    chunks: list[Document]
    summary: str
    question: str
    answer: str
    messages: Annotated[list[BaseMessage], add_messages]
```

**Nota:** o `vectorstore` (Chroma) não fica no `state` — ele não é serializável pelo checkpointer do SQLite. Cada node que precisa dele (`chunk_and_embed`, `retrieve_and_answer`) reabre a coleção na hora, usando `file_path` pra derivar o `collection_name` (já que o Chroma persiste em disco sozinho, reabrir é barato).

---

## ✅ Passo a passo

1. **Setup**: já feito — projeto `uv init --no-package`, deps instaladas
2. Definir `GraphState` em `state.py`
3. `nodes/load_pdf.py` → extrair texto puro do PDF
4. `nodes/chunk_and_embed.py` → `RecursiveCharacterTextSplitter` + embeddings → Chroma
5. `nodes/summarize.py` → prompt simples (se doc grande, resumir por chunk e depois combinar)
6. `nodes/ask_question.py` → captura input do usuário (CLI `input()`)
7. `nodes/retrieve_and_answer.py` → busca top-k chunks similares + gera resposta com contexto
8. `graph.py` → monta o `StateGraph`, adiciona nodes, edge condicional em `ask_question` (`"resumo"` → `summarize`, `"sair"` → `END`, senão → `retrieve_and_answer`) e compila com `SqliteSaver` como checkpointer
9. `main.py` → carrega `.env`, roda o grafo passando `thread_id` no config
10. Testar com 2-3 PDFs reais (um curto, um longo)
11. README com print/gif do terminal rodando

---

## 🚀 Stretch goals (opcional, depois do MVP)
- Trocar CLI por interface Streamlit
- Suportar múltiplos PDFs na mesma sessão

---

## 📦 Entregável final
Repo no GitHub com:
- Código organizado (`nodes/`, `graph.py`, `main.py`)
- README explicando arquitetura + como rodar
- 1 exemplo de PDF + prints do uso
