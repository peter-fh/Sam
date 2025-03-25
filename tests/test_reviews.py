import json
import os
from dotenv import load_dotenv
from api.model import ReviewerModel
from api.models.o3_mini.o3_mini import OpenAI_o3_mini
from courses.read_course_prompt import coursePrompt



TESTS_DIR = "tests"
CONVERSATIONS_DIR = TESTS_DIR + os.sep + "conversations"
STRONG_DIR = CONVERSATIONS_DIR + os.sep + "strong"
MEDIUM_DIR = CONVERSATIONS_DIR + os.sep + "medium"
WEAK_DIR = CONVERSATIONS_DIR + os.sep + "weak"

def readJsonFromDir(dir: str):
    objects = []
    for file in os.listdir(dir):
        filename = os.fsdecode(file)
        if filename.endswith(".json"):
            with open(dir + os.sep + filename) as f:
                objects.append(json.load(f))

    return objects


def getConversations():
    conversations = {
        "weak": [],
        "medium": [],
        "strong": [],
    }

    conversations["weak"] += readJsonFromDir(WEAK_DIR)
    conversations["medium"] += readJsonFromDir(MEDIUM_DIR)
    conversations["strong"] += readJsonFromDir(STRONG_DIR)

    return conversations

def formatUserMessages(conversation) -> str:
    formatted_conversation = ""
    for message in conversation[1:]:
        if message["role"] == "user":
            formatted_conversation += message["content"][0]["text"] + "\n"

    return formatted_conversation


def testReview(reviewer, review_type, conversation, course_prompt) -> bool:
    print("=" * 100)
    final_response = ""
    stream = reviewer.review(conversation, course_prompt)
    for line in stream:
        final_response += line

    if final_response == "":
        raise ValueError("Stream didn't return anything!")

    print("TEST CASE (%s): \n%s" % (review_type, formatUserMessages(conversation)))
    print("RESPONSE: %s\n" % final_response)

    valid_input = False
    passed = False
    print()
    print("=" * 100)
    print()
    print("Did this pass? (y/n): ", end="")
    while not valid_input:
        inp = input()
        valid_input = True
        if inp == "y":
            passed = True
        elif inp == "n":
            passed = False
        else:
            valid_input = False

    return passed



def testOneReview(reviewer: ReviewerModel, index: tuple[int, ...]):
    conversations = getConversations()
    course_prompt = coursePrompt("MATH 203")
    passed = False

    conversation = None
    if index[0] == 0:
        conversation = conversations["weak"][index[1]]
    elif index[0] == 1:
        conversation = conversations["medium"][index[1]]
    elif index[0] == 2:
        conversation = conversations["strong"][index[1]]


    if conversation == None:
        raise ValueError("Conversation is None!")

    if testReview(reviewer, "weak", conversation, course_prompt):
        passed = True

    if passed:
        print("Passed test case!")
    else:
        print("Failed test case!")



def testReviews(reviewer: ReviewerModel):
    conversations = getConversations()
    course_prompt = coursePrompt("MATH 203")

    cases = {
        "weak": {
            "passed": 0,
            "failed": 0,
        },
        "medium": {
            "passed": 0,
            "failed": 0,
        },
        "strong": {
            "passed": 0,
            "failed": 0,
        },
    }
    for weak_conversation in conversations["weak"]:
        if testReview(reviewer, "weak", weak_conversation, course_prompt):
            cases["weak"]["passed"] += 1
        else:
            cases["weak"]["failed"] += 1

    for medium_conversation in conversations["medium"]:
        print(medium_conversation)
        if testReview(reviewer, "medium", medium_conversation, course_prompt):
            cases["medium"]["passed"] += 1
        else:
            cases["medium"]["failed"] += 1

    for strong_conversation in conversations["strong"]:
        if testReview(reviewer, "strong", strong_conversation, course_prompt):
            cases["strong"]["passed"] += 1
        else:
            cases["strong"]["failed"] += 1

    print("WEAK: %d/%d" % (cases["weak"]["passed"], cases["weak"]["passed"] + cases["weak"]["failed"]))
    print("MEDIUM: %d/%d" % (cases["medium"]["passed"], cases["medium"]["passed"] + cases["medium"]["failed"]))
    print("STRONG: %d/%d" % (cases["strong"]["passed"], cases["strong"]["passed"] + cases["strong"]["failed"]))

