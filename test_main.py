from api.models.gpt_4o.gpt_4o import OpenAI_4o
from api.models.o3_mini.o3_mini import OpenAI_o3_mini
from tests.test_response_size import testFirstMessageLengthManual
from dotenv import load_dotenv
import os

from tests.test_reviews import testOneReview, testReviews


load_dotenv(override=True)
openai_api_key = os.getenv("OPENAI_API_KEY")
if openai_api_key == None:
    print("OPENAI_API_KEY not found, exiting")
    exit(1)

o3 = OpenAI_o3_mini(openai_api_key)
gpt4 = OpenAI_4o(openai_api_key)
gpt4.debug = True

# testFirstMessageLengthManual(model, count=3)

# testOneReview(gpt4, (1, 1))

print("Testing completed with $%5f used." % o3.estimated_cost)
