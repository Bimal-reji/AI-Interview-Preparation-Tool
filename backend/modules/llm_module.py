from groq import Groq

client = Groq(api_key="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")  # Replace with your actual key


def call_llm(prompt, max_tokens=300):
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=max_tokens
    )
    return completion.choices[0].message.content


def generate_questions(role, matched_skills, missing_skills):
    prompt = f"""
Generate 10 MCQ questions for the role {role}.

Rules:
- 5 questions from matched skills: {matched_skills}
- 5 questions from missing skills: {missing_skills}
- Provide 4 options (A, B, C, D)
- Include the correct answer.

Format STRICTLY like this:

1. Question text?
A. Option 1
B. Option 2
C. Option 3
D. Option 4

Answer: A

No explanations.
Only MCQs.
"""
    return call_llm(prompt, max_tokens=1500)


def evaluate_answer(question, answer):
    prompt = f"""
You are a strict technical interviewer evaluating a multiple-choice answer.

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


def calculate_total_score(
    qa_pairs
):

    total_score = 0

    results = []

    for item in qa_pairs:

        result = evaluate_answer(
            item["correct_answer"],
            item["candidate_answer"]
        )

        total_score += result["score"]

        results.append(result)

    accuracy = 0

    if len(qa_pairs) > 0:

        accuracy = round(
            (
                total_score /
                len(qa_pairs)
            ) * 100,
            2
        )

    return {

        "total_score":
        total_score,

        "total_questions":
        len(qa_pairs),

        "accuracy":
        accuracy,

        "results":
        results
    }