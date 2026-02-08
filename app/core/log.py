import textwrap
from typing import Any

def wrap(text: str, indent: int=0):
    scentences = text.split("\n")
    wrapped_paragraphs = [textwrap.fill(scentence) for scentence in scentences]
    lines: list[str] = []
    for paragraph in wrapped_paragraphs:
        for line in paragraph.split("\n"):
            lines.append(("    " * indent) + line)

    return lines

def displayConversation(conversation: Any):
    print("\n\n")
    print("Sending the following query to ChatGPT:")
    print("=" * 74)
    for message in conversation:
        print(f'{message["role"]}: ')
        for line in wrap(message["content"][0]["text"], indent=1):
            print(line)
    print("=" * 74)
