from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_voyageai import VoyageAIEmbeddings
from langchain_chroma import Chroma
from src.state import GraphState
import dotenv
import os
import re

dotenv.load_dotenv()

embeddings = VoyageAIEmbeddings(
    model='voyage-4',
    batch_size=7,
    api_key=os.getenv('VOYAGE_API_KEY')
)

def chunk_and_embed(state: GraphState) -> dict:
    collection_name = re.sub(
        r'[^a-zA-Z0-9._-]',
        '_',
        os.path.splitext(os.path.basename(state['file_path']))[0]
    )

    vectorstore = Chroma(
        collection_name=collection_name,
        embedding_function=embeddings,
        persist_directory='data/chroma'
    )

    if vectorstore.get()['ids']:
        return {}

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    chunks = splitter.split_documents(state['raw_text'])
    vectorstore.add_documents(chunks)

    return {
        'chunks': chunks,
    }

if __name__ == '__main__':
    from loguru import logger

    os.system('clear')

    from src.nodes.load_pdf import load_pdf

    test_state = {'file_path': 'data/sample.pdf'}
    test_state.update(load_pdf(test_state))

    result = chunk_and_embed(test_state)

    logger.info(f"Chunks gerados: {len(result.get('chunks', []))}")