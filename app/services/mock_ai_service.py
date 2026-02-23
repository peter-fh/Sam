import random
import time
from typing import Any, override
from collections.abc import Generator

from app.core.types import Mode
from app.services.ai_service import AIService

MOCK_RESPONSE = '''
To find the derivative of the function \\( f(x) = \\sqrt{x}(x^{-1/2} - x^{-3/2})e^{3x} \\), we'll use the product rule, the chain rule, and the power rule.

### Simplifying the Function

First, let's simplify the function:

\\[ f(x) = \\sqrt{x}(x^{-1/2} - x^{-3/2})e^{3x} \\]

Recall that \\( \\sqrt{x} = x^{1/2} \\). We can rewrite the function as:

\\[ f(x) = x^{1/2} (x^{-1/2} - x^{-3/2}) e^{3x} \\]

Let's distribute \\( x^{1/2} \\) inside the parentheses:

\\[ f(x) = x^{1/2} \\cdot x^{-1/2} - x^{1/2} \\cdot x^{-3/2} \\]
\\[ f(x) = x^{(1/2 - 1/2)} - x^{(1/2 - 3/2)} \\]
\\[ f(x) = x^0 - x^{-1} \\]
\\[ f(x) = 1 - x^{-1} \\]

So the function simplifies to:

\\[ f(x) = (1 - x^{-1})e^{3x} \\]

### Applying the Product Rule

The function is now a product of two functions: \\( u(x) = 1 - x^{-1} \\) and \\( v(x) = e^{3x} \\). To find the derivative \\( f'(x) \\), we will use the product rule:

\\[ (uv)' = u'v + uv' \\]

#### Step 1: Find \\( u'(x) \\)

\\[ u(x) = 1 - x^{-1} \\]
\\[ u'(x) = 0 - (-1)x^{-2} \\]
\\[ u'(x) = x^{-2} \\]

#### Step 2: Find \\( v'(x) \\)

\\[ v(x) = e^{3x} \\]
Using the chain rule:
\\[ v'(x) = e^{3x} \\cdot \\frac{d}{dx}(3x) \\]
\\[ v'(x) = 3e^{3x} \\]

#### Step 3: Combine using the Product Rule

Now, using the product rule:

\\[ f'(x) = u'v + uv' \\]
\\[ f'(x) = x^{-2} \\cdot e^{3x} + (1 - x^{-1}) \\cdot 3e^{3x} \\]

#### Step 4: Simplify

\\[ f'(x) = x^{-2}e^{3x} + 3(1 - x^{-1})e^{3x} \\]
\\[ f'(x) = x^{-2}e^{3x} + 3e^{3x} - 3x^{-1}e^{3x} \\]
\\[ f'(x) = e^{3x} \\left( x^{-2} + 3 - 3x^{-1} \\right) \\]

### Final Answer

\\[ f'(x) = e^{3x} \\left( x^{-2} + 3 - 3x^{-1} \\right) \\]

So, the derivative of \\( f(x) = \\sqrt{x}(x^{-1/2} - x^{-3/2})e^{3x} \\) is:

\\[ f'(x) = e^{3x} \\left( x^{-2} + 3 - 3x^{-1} \\right) \\]
'''

MOCK_TRANSCRIPTION = "$$ \\lim_{x \\to -3} \\frac{|x+3|}{x^2+x-6} $$"

MOCK_SUMMARY = '''
    The following is a summary of the previous conversation:

1. The math question that is being asked about **BY THE STUDENT**: The student has not asked a question yet. The current question is from the assistant: "Can you factor the denominator $x^2+x-6$?"

2. All events mentioned in the previous summary: The student indicated they were ready.

3. The events in the most recent messages: The assistant introduced a limit problem involving an absolute value, $\\lim_{x \\to -3} \\frac{|x+3|}{x^2+x-6}$, and asked the student to factor the denominator $x^2+x-6$.
    '''

MOCK_TITLE = "Mock title"

class MockAIService(AIService):
    
    def __init__(self, config: Any, client: Any, async_client: Any, prompt_manager: Any): # pyright: ignore[reportMissingSuperCall]
        pass

    @override
    def getMessage(self, current_conversation: Any, course_code: str, prompt_type: Mode, brevity: str = "Detailed") -> Generator[str]:
        _ = current_conversation
        _ = course_code
        _ = prompt_type
        _ = brevity

        for chunk in MOCK_RESPONSE:
            time.sleep(0.001)
            yield chunk

    @override
    async def getTranscription(self, image: str) -> str:
        _ = image
        time.sleep(2)
        return MOCK_TRANSCRIPTION

    @override
    async def getSummary(self, conversation: Any) -> str:
        _ = conversation
        time.sleep(2)
        return MOCK_SUMMARY

    @override
    async def getTitle(self, question: str) -> str:
        _ = question
        time.sleep(1)
        return MOCK_TITLE

    @override
    async def getMode(self, question: str, type: Mode | None) -> str:
        _ = question
        _ = type
        time.sleep(1)
        return random.choice(list(Mode)).value

