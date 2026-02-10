import os
from flask import json
from tests.fixture import Fixture


test_dir = "tests"
problem_file = test_dir + os.sep + "problems.json"

questions= [
    "hi",
    "hello",
    "hi, how are you?"
]

async def testConversationTitles(fixture: Fixture):
    with open(problem_file) as f:
        test_cases = json.load(f)
        problems = test_cases["problems"]
        count = len(problems)

        for problem_obj in problems[0:count]:
            problem = problem_obj["problem"]
            title = await fixture.api.getTitle(problem)
            print("=" * 50)
            print("Question: ", problem)
            print("Title: ", title)
            print("=" * 50)
            print()


async def testCasualConversationTitles(fixture: Fixture):
    for question in questions:
        title = await fixture.api.getTitle(question)
        print("=" * 50)
        print("Question: ", question)
        print("Title: ", title)
        print("=" * 50)
        print()
