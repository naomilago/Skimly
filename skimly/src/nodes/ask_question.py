from src.state import GraphState

def ask_question(state: GraphState) -> dict:
  question = input("Faça uma pergunta ('resumo' para ver o resumo, 'sair' para encerrar): ")
  return {'question': question}