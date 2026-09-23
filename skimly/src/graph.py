from langgraph.checkpoint import sqlite
from src.nodes.retrieve_and_answer import retrieve_and_answer
from src.nodes.chunk_and_embed import chunk_and_embed
from langgraph.checkpoint.sqlite import SqliteSaver
from src.nodes.ask_question import ask_question
from src.nodes.summarize import summarize
from src.nodes.load_pdf import load_pdf
from src.state import GraphState
from loguru import logger
import sqlite3
import os

from langgraph.graph import (
  StateGraph, 
  END
)

def route_after_question(state: GraphState) -> str:
  question = state['question'].strip().lower()

  if question == 'sair':
    return 'end'

  if question in ('resumo', 'sumário', 'sumario'):
    return 'summarize'

  return 'continue'

def build_graph():
  builder = StateGraph(GraphState)

  builder.add_node('load_pdf', load_pdf)
  builder.add_node('chunk_and_embed', chunk_and_embed)
  builder.add_node('summarize', summarize)
  builder.add_node('ask_question', ask_question)
  builder.add_node('retrieve_and_answer', retrieve_and_answer)

  builder.set_entry_point('load_pdf')
  builder.add_edge('load_pdf', 'chunk_and_embed')
  builder.add_edge('chunk_and_embed', 'ask_question')

  builder.add_conditional_edges(
    'ask_question',
    route_after_question,
    {
      'end': END,
      'summarize': 'summarize',
      'continue': 'retrieve_and_answer'
    }
  )

  builder.add_edge('summarize', 'ask_question')
  builder.add_edge('retrieve_and_answer', 'ask_question')

  conn = sqlite3.connect(
    'data/checkpoints.sqlite',
    check_same_thread=False
  )
  
  checkpointer = SqliteSaver(conn)

  return builder.compile(checkpointer=checkpointer)

graph = build_graph()

if __name__ == '__main__':
  os.system('clear')

  test_state = {
    'file_path': 'data/sample.pdf',
    'messages': []
  }

  config = {'configurable': {'thread_id': 'test-graph'}}

  graph.invoke(test_state, config=config)

  logger.success('Sessão encerrada.')