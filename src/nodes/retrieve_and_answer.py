from langchain_anthropic import ChatAnthropic
from langchain_chroma import Chroma
from langchain_voyageai import VoyageAIEmbeddings
from src.state import GraphState
from loguru import logger
import dotenv
import os
import re

from langchain_core.messages import (
  SystemMessage,
  HumanMessage,
  AIMessage
)

dotenv.load_dotenv()

llm = ChatAnthropic(
  model=os.getenv('MODEL'),
  api_key=os.getenv('ANTHROPIC_API_KEY')
)

embeddings = VoyageAIEmbeddings(
  model='voyage-4',
  api_key=os.getenv('VOYAGE_API_KEY')
)

def retrieve_and_answer(state: GraphState) -> dict:
  collection_name = re.sub(
    r'[^a-zA-Z0-9._-]',
    '_',
    os.path.splitext(os.path.basename(state['file_path']))[0]
  )
  vectorstore = Chroma(
    collection_name=collection_name,
    embedding_function=embeddings,
    persist_directory='data/chroma',
  )

  docs = vectorstore.similarity_search(state['question'], k=4)

  context = '\n\n'.join(
    f'[Página {doc.metadata['page'] + 1}]\n{doc.page_content}\n\n'
    for doc in docs
  )

  messages = [
    SystemMessage(content=(
      'Responda a pergunta com base apenas no contexto fornecido. Cite a página quando relevante. '
      'Ao escrever fórmulas ou notação matemática, sempre use LaTeX delimitado por $ (inline) ou $$ (bloco), nunca texto puro.'
    )),
    *state.get('messages', []),
    HumanMessage(content=f'Contexto:\n{context}\n\nPergunta: {state['question']}')
  ]

  response = llm.invoke(messages)

  return {
    'answer': response.content,
    'messages': [
      HumanMessage(content=state['question']),
      AIMessage(content=response.content)
    ]
  }

if __name__ == '__main__':
  os.system('clear')

  from src.nodes.chunk_and_embed import chunk_and_embed
  from src.nodes.load_pdf import load_pdf

  test_state = {'file_path': 'data/sample.pdf'}
  test_state.update(load_pdf(test_state))
  test_state.update(chunk_and_embed(test_state))
  test_state['question'] = 'Qual o tema principal do documento? E qual a parte mais relevante?'

  result = retrieve_and_answer(test_state)

  logger.success(f'\n{result['answer']}')