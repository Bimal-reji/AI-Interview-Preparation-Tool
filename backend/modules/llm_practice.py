from groq import Groq
import json, re

client = Groq(api_key="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")


def call_llm(prompt, max_tokens=300):
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=max_tokens,
    )
    return completion.choices[0].message.content


def generate_practice(role: str, matched_skills: list, missing_skills: list) -> str:
    """
    Generate 10 MCQ questions and return them as a JSON string.
    Frontend expects: [{ "question": str, "options": [str x4], "correct": int 0-3 }]
    """
    matched = ", ".join(matched_skills) if matched_skills else "general programming"
    missing = ", ".join(missing_skills) if missing_skills else "none specified"

    prompt = f"""You are an expert technical interviewer for the role of "{role}".

Generate exactly 10 multiple-choice questions.
- 5 questions based on skills the candidate HAS: {matched}
- 5 questions based on skills the candidate is WEAK in: {missing}

STRICT OUTPUT RULES:
- Return ONLY a valid JSON array — no markdown, no explanation, no extra text before or after.
- Each element must have exactly these keys:
    "question" : string — the question text
    "options"  : array of exactly 4 strings labelled "A. ...", "B. ...", "C. ...", "D. ..."
    "correct"  : integer 0-3 — the 0-based index of the correct option

Example of the EXACT format required:
[
  {{
    "question": "Which data structure gives O(1) average lookup?",
    "options": ["A. Array", "B. Linked List", "C. Hash Map", "D. Binary Tree"],
    "correct": 2
  }}
]

Output the JSON array now:"""

    raw = call_llm(prompt, max_tokens=2000)
    clean = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.IGNORECASE)
    clean = re.sub(r"\s*```$", "", clean).strip()

    try:
        parsed = json.loads(clean)
        if isinstance(parsed, list) and len(parsed) > 0:
            return json.dumps(parsed)
    except json.JSONDecodeError:
        pass

    print("LLM ERROR: generate_practice did not return valid JSON. Using fallback.")
    fallback = [{
        "question": f"What is a core responsibility of a {role}?",
        "options": [
            "A. Writing SQL queries only",
            "B. Designing and implementing scalable systems",
            "C. Managing HR processes",
            "D. Handling accounting tasks",
        ],
        "correct": 1,
    }]
    return json.dumps(fallback)


def evaluate_practice(question: str, answer: str) -> str:
    prompt = f"""You are a strict technical interviewer evaluating a multiple-choice answer.

Question:
{question}

Candidate Answer:
{answer}

Evaluation Rules:
- If the candidate's answer matches the correct answer: Score = 1
- If the candidate's answer does NOT match the correct answer: Score = 0
- No partial marks under any circumstances

Return EXACTLY in this format (no extra text):

Score: 1 or 0
Correct Answer: (the correct option letter and text)
Result: Correct or Incorrect
Explanation: (1-2 lines max)
"""
    return call_llm(prompt, max_tokens=300)


def calculate_total(qa_pairs: list) -> tuple:
    """
    qa_pairs: list of (question_str, answer_str)
    Returns (total_score, results_list)
    Uses evaluate_practice (local function) — NOT evaluate_answer from llm_module.
    """
    total_score = 0
    results = []

    for question, answer in qa_pairs:
        result = evaluate_practice(question, answer)   # fixed: was calling wrong function
        results.append(result)

        for line in result.splitlines():
            if line.strip().startswith("Score:"):
                try:
                    score_val = line.split(":")[1].strip()
                    score = int(score_val.split()[0])
                    score = max(0, min(1, score))
                    total_score += score
                except (ValueError, IndexError):
                    pass
                break

    print(f"\nFinal Score: {total_score}/{len(qa_pairs)}")
    return total_score, results