from src.graph import graph
import dotenv
import re
import shutil
import textwrap
import uuid
import os

dotenv.load_dotenv()


def strip_markdown(text: str) -> str:
    text = re.sub(r'^#{1,6}\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'^[-*]\s+', '• ', text, flags=re.MULTILINE)
    return text


def print_centered(title: str, text: str, margin: int = 6) -> None:
    terminal_width = shutil.get_terminal_size((80, 20)).columns
    wrap_width = max(20, terminal_width - margin * 2)

    text = strip_markdown(text)

    print()
    print(f' {title} '.center(terminal_width, '─'))
    print()

    for paragraph in text.split('\n'):
        if not paragraph.strip():
            print()
            continue

        for line in textwrap.wrap(paragraph, width=wrap_width):
            print(line.center(terminal_width))

    print()
    print('─' * terminal_width)


def main():
    file_path = input('Caminho do PDF: ').strip()

    initial_state = {
        'file_path': file_path,
        'messages': [],
    }

    config = {'configurable': {'thread_id': str(uuid.uuid4())}}

    for chunk in graph.stream(initial_state, config=config, stream_mode='updates'):
        for node_name, update in chunk.items():
            if node_name == 'summarize':
                print_centered('Resumo', update['summary'])
            elif node_name == 'retrieve_and_answer':
                print_centered('Resposta', update['answer'])

    terminal_width = shutil.get_terminal_size((80, 20)).columns
    print()
    print('Sessão encerrada.'.center(terminal_width))


if __name__ == '__main__':
    main()
