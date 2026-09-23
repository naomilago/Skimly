from langchain_ollama import ChatOllama

llm = ChatOllama(
    model='qwen3',
    temperature=0.7,
)
resposta = llm.invoke('Diga oi de um jeito engraçado')
print(resposta.content)