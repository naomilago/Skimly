from langchain_community.document_loaders import PyPDFLoader
from src.state import GraphState

def load_pdf(state: GraphState) -> dict:
    loader = PyPDFLoader(state['file_path'])
    documents = loader.load()

    return {'raw_text': documents}

if __name__ == '__main__':
    from loguru import logger
    import os

    os.system('clear')

    test_state = {'file_path': 'data/sample.pdf'}
    result = load_pdf(test_state)

    logger.info(result['raw_text'][0])
    logger.info(f'Total pages: {len(result['raw_text'])}')