import os

from dotenv import load_dotenv
from api.api import ModelType
from api.types import Mode
from db import Database
import argparse
from supabase import Client, create_client


class PromptEditor:
    db: Database
    def __init__(self, db):
        self.db = db
    def copyPrompt(self, mode, model):
        prompt = ""
        try:
            prompt = self.db.getPrompt(mode, model)
        except:
            pass
        filename = f'{mode}_{model}.md'.replace("/", "+")
        with open(filename, 'w') as f:
            f.write(prompt)

    def updatePrompt(self, mode, model):
        filename = f'{mode}_{model}.md'.replace("/", "+")
        prompt = open(filename, 'r').read()
        self.db.addPrompt(prompt, mode, model)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group()
    group.add_argument(
        "-r",
        "--read",
        dest="read",
        action="store_true",
        help="Pulls the prompt from the database to be edited"
    )
    group.add_argument(
        "-w",
        "--write",
        dest="write",
        action="store_true",
        help="Takes the content of the file that was previously pulled from the database and edited and writes to the db"
    )
    parser.add_argument(
        "-ml",
        "--model",
        dest="model",
        help="Model for prompt being edited",
        required=True,
    )
    parser.add_argument(
        "-md",
        "--mode",
        dest="mode",
        help="Mode for prompt being edited",
        required=True,
    )

    load_dotenv(override=True)

    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
    if not supabase_url or not supabase_key:
        raise ValueError("Supabase url or key not found")

    supabase: Client = create_client(
        supabase_url, supabase_key
    )
    db = Database(supabase)
    editor = PromptEditor(db)
    args = parser.parse_args()

    try:
        model = ModelType(args.model)
    except Exception as e:
        print("Unknown model name: ", args.model)
        print("Exception: ", e)
        exit(1)

    try:
        mode = Mode(args.mode)
    except:
        print("Unknown mode: ", args.mode)
        exit(1)


    if args.write:
        editor.updatePrompt(args.mode, args.model)
    else:
        editor.copyPrompt(args.mode, args.model)


