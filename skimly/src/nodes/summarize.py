from langchain_anthropic import ChatAnthropic
from src.state import GraphState
from loguru import logger
import dotenv
import os

from langchain_core.messages import (
    SystemMessage,
    HumanMessage
)

dotenv.load_dotenv()

llm = ChatAnthropic(
    model=os.getenv('MODEL'),
    api_key=os.getenv('ANTHROPIC_API_KEY')
)

def summarize(state: GraphState) -> dict:
    text = '\n\n'.join(doc.page_content for doc in state['raw_text'])

    messages = [
        SystemMessage(content='Você resume documentos de forma clara e objetiva, em português.'),
        HumanMessage(content=f'Resuma o seguinte texto:\n\n{text}')
    ]

    response = llm.invoke(messages)

    return {'summary': response.content}

if __name__ == '__main__':
    from src.nodes.load_pdf import load_pdf

    os.system('clear')
    
    test_state = {'file_path': 'data/sample.pdf'}
    test_state.update(load_pdf(test_state))

    result = summarize(test_state)

    logger.success(f'\n{result['summary']}')