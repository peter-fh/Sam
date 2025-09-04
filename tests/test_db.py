from db import Database

class DatabaseTestWrapper():
    def __init__(self, db):
        self.db = db


def testConversations(db: Database):
    conversations = db.getConversations()
    print(conversations)

def testGetMode(db: Database, mode: str):
    print(db.getMode(mode))
