from modules.resume_parser import extract_text_from_pdf
from modules.skill_extraction import extract_skills
from modules.role_extraction import extract_role
from modules.skill_gap import analyze_skill_gap
from modules.llm_module import generate_questions, evaluate_answer
from modules.followup_llm import generate_follow_up
from modules.llm_practice import generate_practice,evaluate_practice

if __name__ == "__main__":
    resume_text = extract_text_from_pdf("sample_resume.pdf")

    print("\n===== EXTRACTED RESUME TEXT =====")
    print(resume_text)

    # FIX: extract_skills returns a dict; unwrap all_skills to a plain list
    skills_result = extract_skills(resume_text)
    all_skills    = skills_result["all_skills"]

    print("\n===== EXTRACTED RESUME SKILLS =====")
    print(all_skills)

    # FIX: pass all_skills list for skill-voting
    role_result = extract_role(resume_text, all_skills)
    role_name   = role_result["role"]   # FIX: extract_role returns a dict

    print("\n===== IDENTIFIED ROLE =====")
    print(role_result)

    # FIX: pass role string and skills list (not the raw dicts)
    gap_result = analyze_skill_gap(role_name, all_skills)

    print("\n===== SKILL GAP ANALYSIS =====")
    print("Matched Skills:", gap_result["matched_skills"])
    print("Missing Skills:", gap_result["missing_skills"])
    print("Coverage %:", gap_result["coverage_percentage"])

    print("\n===== GENERATED INTERVIEW QUESTIONS =====")
    questions = generate_questions(role_name, gap_result["matched_skills"], gap_result["missing_skills"])
    print(questions)

    # Pick the first question for the interview loop
    first_question = questions.split("\n")[0].strip()

    current_question = first_question
    rounds = 3  # how many follow-up rounds to run

    for i in range(rounds):
        print(f"\n===== QUESTION (Round {i + 1}) =====")
        print(current_question)

        user_answer = input("\nYour answer:\n> ")

        print("\n===== AI FEEDBACK =====")
        feedback = evaluate_answer(current_question, user_answer)
        print(feedback)

        print("\n===== FOLLOW-UP QUESTION =====")
        follow_up = generate_follow_up(current_question, user_answer)
        print(follow_up)

        current_question = follow_up  # next round uses the follow-up as the new question