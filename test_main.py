from tests.test_response_size import testFirstMessageLength, testFirstMessageLengthManual
from dotenv import load_dotenv
from api.gpt import GPT
import os


load_dotenv(override=True)
openai_api_key = os.getenv("OPENAI_API_KEY")
if openai_api_key == None:
    print("OPENAI_API_KEY not found, exiting")
    exit(1)

gpt = GPT(openai_api_key)
gpt.debug = False

# testFirstMessageLength(gpt, failing_size=500, count=3, show_all=True)
testFirstMessageLengthManual(gpt, count=3)

print("Testing completed with $%5f used." % gpt.estimated_cost)
