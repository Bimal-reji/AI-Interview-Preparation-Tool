from groq import Groq
from dotenv import load_dotenv
import os
from pathlib import Path

env_path = Path(__file__).resolve().parent.parent / ".env"

load_dotenv(dotenv_path=env_path)

client = Groq(api_key = os.getenv("GROQ_API_KEY"))

MODEL_NAME = "llama-3.1-8b-instant"

# =====================================================
# GENERIC LLM CALL
# =====================================================

def call_llm(prompt: str) -> str:

    try:

        response = client.chat.completions.create(

            model=MODEL_NAME,

            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],

            temperature=0.7,
        )

        print(response)

        return (
            response
            .choices[0]
            .message
            .content
            or ""
        )

    except Exception as e:

        print("LLM ERROR:")
        print(e)

        return "ERROR_GENERATING_QUESTION"
# =====================================================
# FIRST QUESTION
# =====================================================

def generate_first_question(
    role: str
) -> str:

    prompt = f"""
You are a senior technical interviewer.

The candidate is applying for:

{role}

Ask ONE strong opening technical interview question.

Rules:
- Only ask the question
- No explanations
- No bullet points
- Make it role specific
"""

    return call_llm(prompt).strip()

# =====================================================
# FOLLOW-UP QUESTION
# =====================================================

def generate_follow_up(
    role: str,
    previous_question: str,
    answer: str,
    history: list
) -> str:

    history_text = ""

    for item in history[-6:]:

        history_text += (
            f"{item['role']}: "
            f"{item['content']}\n"
        )

    prompt = f"""
You are a strict FAANG-level technical interviewer.

ROLE:
{role}

PREVIOUS QUESTION:
{previous_question}

CANDIDATE ANSWER:
{answer}

INTERVIEW HISTORY:
{history_text}

Your task:

1. Analyze answer quality carefully

2. If answer is STRONG:
- ask deeper technical follow-up
- ask implementation details
- ask optimization/scalability
- continue same topic

3. If answer is WEAK:
Examples:
- "yes"
- "no"
- "idk"
- "don't know"
- vague answer
- poor explanation

THEN:
- switch topic naturally
- ask another important interview question

4. Avoid repeating questions

Rules:
- Ask ONLY ONE question
- No explanations
- No markdown
- Sound like real interviewer
"""

    return call_llm(prompt).strip()