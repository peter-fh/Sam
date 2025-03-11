from api.models.o3_mini.o3_mini import OpenAI_o3_mini
from tests.test_response_size import testFirstMessageLengthManual
from dotenv import load_dotenv
import os


load_dotenv(override=True)
openai_api_key = os.getenv("OPENAI_API_KEY")
if openai_api_key == None:
    print("OPENAI_API_KEY not found, exiting")
    exit(1)

model = OpenAI_o3_mini(openai_api_key)

testFirstMessageLengthManual(model, count=3)

print("Testing completed with $%5f used." % model.estimated_cost)
