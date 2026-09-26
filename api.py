import re
import uuid
from pathlib import Path

import dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.nodes.chunk_and_embed import chunk_and_embed
from src.nodes.load_pdf import load_pdf
from src.nodes.retrieve_and_answer import retrieve_and_answer
from src.nodes.summarize import summarize

dotenv.load_dotenv()

UPLOAD_DIR = Path('data/uploads')
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

PAGE_PATTERN = re.compile(r'p[áa]gina\s+(\d+)', re.IGNORECASE)

app = FastAPI(title='Skimly API')

app.add_middleware(
  CORSMiddleware,
  allow_origin_regex=r'http://(localhost|127\.0\.0\.1):\d+',
  allow_methods=['*'],
  allow_headers=['*'],
)

SESSIONS: dict[str, dict] = {}


class AskRequest(BaseModel):
  question: str


def get_session(session_id: str) -> dict:
  session = SESSIONS.get(session_id)

  if session is None:
    raise HTTPException(status_code=404, detail='Sessão não encontrada. Envie o PDF novamente.')

  return session


@app.post('/api/upload')
async def upload(file: UploadFile = File(...)):
  if file.content_type != 'application/pdf':
    raise HTTPException(status_code=400, detail='Envie um arquivo PDF.')

  session_id = str(uuid.uuid4())
  file_path = UPLOAD_DIR / f'{session_id}.pdf'
  file_path.write_bytes(await file.read())

  state: dict = {'file_path': str(file_path)}

  try:
    state.update(load_pdf(state))
    state.update(chunk_and_embed(state))
  except Exception as error:
    file_path.unlink(missing_ok=True)
    raise HTTPException(status_code=422, detail=f'Não consegui processar o PDF: {error}') from error

  state['messages'] = []
  SESSIONS[session_id] = state

  return {
    'session_id': session_id,
    'file_name': file.filename,
    'pages': len(state['raw_text']),
  }


@app.post('/api/sessions/{session_id}/summary')
def get_summary(session_id: str):
  state = get_session(session_id)

  try:
    result = summarize(state)
  except Exception as error:
    raise HTTPException(status_code=502, detail=f'Não consegui gerar o resumo: {error}') from error

  return {'summary': result['summary']}


@app.post('/api/sessions/{session_id}/ask')
def ask(session_id: str, body: AskRequest):
  state = get_session(session_id)
  state['question'] = body.question

  try:
    result = retrieve_and_answer(state)
  except Exception as error:
    raise HTTPException(status_code=502, detail=f'Não consegui responder: {error}') from error

  state['messages'] = state.get('messages', []) + result['messages']

  match = PAGE_PATTERN.search(result['answer'])
  page = int(match.group(1)) if match else None

  return {'answer': result['answer'], 'page': page}


@app.delete('/api/sessions/{session_id}')
def end_session(session_id: str):
  state = SESSIONS.pop(session_id, None)

  if state is not None:
    Path(state['file_path']).unlink(missing_ok=True)

  return {'ok': True}
