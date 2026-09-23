# Skimly

Agente em LangGraph que recebe um PDF, gera um resumo sob demanda e responde perguntas sobre o conteúdo com citação de página.

<div align="center">
  <img src="./data/screenshot.png" alt="Skimly rodando no terminal" width="600" style="display: block; margin-left: auto; margin-right: auto;">
</div>

## Como rodar

```bash
uv sync
uv run main.py
```

Informe o caminho do PDF, depois converse livremente. Digite `resumo` a qualquer momento para ver o resumo do documento, ou `sair` para encerrar.

## Stack

LangGraph, LangChain, Claude (Anthropic), Voyage AI (embeddings) e Chroma (vector store local).
