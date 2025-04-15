from api.models.gpt_4o.gpt_4o import OpenAI_4o
from api.models.gpt_4o_mini.gpt_4o_mini import OpenAI_4o_mini
from api.models.o3_mini.o3_mini import OpenAI_o3_mini
from tests.test_response_size import testFirstMessageLengthManual
from dotenv import load_dotenv
import os

from tests.test_titles import testCasualConversationTitles, testConversationTitles


load_dotenv(override=True)
openai_api_key = os.getenv("OPENAI_API_KEY")
if openai_api_key == None:
    print("OPENAI_API_KEY not found, exiting")
    exit(1)

o3 = OpenAI_o3_mini(openai_api_key)
gpt4 = OpenAI_4o(openai_api_key)
gpt4.debug = True
utility_model = OpenAI_4o_mini(openai_api_key)

# testFirstMessageLengthManual(model, count=3)
testConversationTitles(utility_model)
# testCasualConversationTitles(utility_model)


print("Testing completed with $%5f used." % o3.estimated_cost)
