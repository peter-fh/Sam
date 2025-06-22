import os

from dotenv import load_dotenv
from db import Database
import argparse
from supabase import Client, create_client


class OutlineEditor:
    db: Database
    def __init__(self, db):
        self.db = db
    def copyOutline(self, course):
        outline = ""
        try:
            outline = self.db.getOutline(course)
        except:
            pass
        print(outline)
        filename = f'{course}.md'
        with open(filename, 'w') as f:
            f.write(outline)

    def updateOutline(self, course):
        filename = f'{course}.md'
        outline = open(filename, 'r').read()
        self.db.addOutline(outline, course)


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
        "-c",
        "--course",
        dest="course",
        help="Course that is being edited",
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
    editor = OutlineEditor(db)
    args = parser.parse_args()
    if args.write:
        editor.updateOutline(args.course)
    else:
        editor.copyOutline(args.course)


