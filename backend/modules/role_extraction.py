"""
role_extraction.py  ──  Module 3
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Identifies the most likely job role from resume text.

Strategy  (in order of confidence)
  1. Exact phrase match against a 40+ role database
  2. If no exact match, score each role by how many of its
     required skills appear in the resume  (skill-voting)
  3. Returns top-1 role + a ranked list of all candidates

No ML / spaCy required — pure regex + heuristics.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

import re
try:
    from .skill_gap import ROLE_SKILLS   # when used as part of a package (modules/)
except ImportError:
    from skill_gap import ROLE_SKILLS    # when run directly / standalone


# ─────────────────────────────────────────────────────────────────
# ROLE PHRASE DATABASE  (ordered: most specific first)
# ─────────────────────────────────────────────────────────────────
ROLE_PHRASES: list[tuple[str, str]] = [
    # phrase in resume text  →  canonical role key (must match ROLE_SKILLS)

    # AI / ML / Data
    ("machine learning engineer",       "ai / ml engineer"),
    ("ml engineer",                     "ai / ml engineer"),
    ("ai engineer",                     "ai / ml engineer"),
    ("ai/ml engineer",                  "ai / ml engineer"),
    ("deep learning engineer",          "ai / ml engineer"),
    ("data scientist",                  "data scientist"),
    ("data science",                    "data scientist"),
    ("data engineer",                   "data engineer"),
    ("data engineering",                "data engineer"),
    ("data analyst",                    "data analyst"),
    ("business analyst",                "business analyst"),
    ("bi developer",                    "bi / analytics developer"),
    ("analytics engineer",              "bi / analytics developer"),

    # Software Engineering
    ("software development engineer",   "software development engineer"),
    ("software developer",              "software development engineer"),
    ("software engineer",               "software development engineer"),
    ("sde",                             "software development engineer"),
    ("swe",                             "software development engineer"),

    # Full Stack / Frontend / Backend
    ("full stack developer",            "full stack developer"),
    ("full-stack developer",            "full stack developer"),
    ("fullstack developer",             "full stack developer"),
    ("frontend developer",              "frontend developer"),
    ("front-end developer",             "frontend developer"),
    ("front end developer",             "frontend developer"),
    ("ui developer",                    "frontend developer"),
    ("react developer",                 "frontend developer"),
    ("backend developer",               "backend developer"),
    ("back-end developer",              "backend developer"),
    ("back end developer",              "backend developer"),
    ("api developer",                   "backend developer"),

    # DevOps / Cloud / SRE
    ("devops engineer",                 "devops / cloud engineer"),
    ("cloud engineer",                  "devops / cloud engineer"),
    ("platform engineer",               "devops / cloud engineer"),
    ("infrastructure engineer",         "devops / cloud engineer"),
    ("site reliability engineer",       "site reliability engineer (sre)"),
    ("sre",                             "site reliability engineer (sre)"),

    # Security
    ("cybersecurity engineer",          "cybersecurity engineer"),
    ("security engineer",               "cybersecurity engineer"),
    ("information security",            "cybersecurity engineer"),
    ("penetration tester",              "cybersecurity engineer"),

    # Mobile
    ("mobile developer",                "mobile developer (android/ios)"),
    ("android developer",               "mobile developer (android/ios)"),
    ("ios developer",                   "mobile developer (android/ios)"),
    ("flutter developer",               "mobile developer (android/ios)"),
    ("react native developer",          "mobile developer (android/ios)"),

    # Blockchain
    ("blockchain developer",            "blockchain developer"),
    ("smart contract developer",        "blockchain developer"),
    ("web3 developer",                  "blockchain developer"),
    ("solidity developer",              "blockchain developer"),

    # Others
    ("mechanical engineer",             "mechanical engineer"),
    ("civil engineer",                  "civil engineer"),
    ("electrical engineer",             "electrical engineer"),
    ("hr manager",                      "hr manager"),
    ("human resources",                 "hr manager"),
    ("product manager",                 "product manager"),
    ("project manager",                 "project manager"),
]

# Pre-compile patterns (longest phrases first)
_COMPILED: list[tuple[re.Pattern, str]] = []
for phrase, role in sorted(ROLE_PHRASES, key=lambda x: -len(x[0])):
    pat = re.compile(r"(?<![a-z])" + re.escape(phrase) + r"(?![a-z])", re.IGNORECASE)
    _COMPILED.append((pat, role))


def _phrase_match(text: str) -> str | None:
    """Return the first role found by phrase scan."""
    text_lower = text.lower()
    for pattern, role in _COMPILED:
        if pattern.search(text_lower):
            return role
    return None


def _skill_vote(extracted_skills: list[str]) -> list[tuple[str, float]]:
    """
    Score every role by the fraction of its required skills present
    in the resume.  Returns list sorted by score descending.
    """
    skill_set = set(extracted_skills)
    scores: list[tuple[str, float]] = []

    for role, required in ROLE_SKILLS.items():
        if not required:
            continue
        matched = len(skill_set.intersection(required))
        score   = matched / len(required)
        scores.append((role, round(score, 3)))

    return sorted(scores, key=lambda x: -x[1])


def extract_role(text: str, extracted_skills: list[str] | None = None) -> dict:
    """
    Identify the candidate's job role.

    Args:
        text:             Full resume text.
        extracted_skills: Optional pre-extracted skill list (from
                          skill_extraction.extract_skills). If omitted,
                          skill-voting is skipped.

    Returns:
        {
            "role"         : str   – best matched role canonical key,
            "confidence"   : str   – "high" | "medium" | "low",
            "method"       : str   – "phrase_match" | "skill_vote" | "fallback",
            "all_candidates": [(role, score), ...]  – top 5 by skill vote
        }
    """
    # ── Step 1: phrase match ──────────────────────────────────────
    phrase_role = _phrase_match(text)

    # ── Step 2: skill vote ────────────────────────────────────────
    all_candidates: list[tuple[str, float]] = []
    if extracted_skills:
        all_candidates = _skill_vote(extracted_skills)

    top_vote_role  = all_candidates[0][0] if all_candidates else None
    top_vote_score = all_candidates[0][1] if all_candidates else 0.0

    # ── Decide final role ─────────────────────────────────────────
    if phrase_role:
        final_role  = phrase_role
        method      = "phrase_match"
        confidence  = "high"
    elif top_vote_score >= 0.4:
        final_role  = top_vote_role
        method      = "skill_vote"
        confidence  = "medium" if top_vote_score >= 0.6 else "low"
    else:
        final_role  = "software development engineer"  # safe default
        method      = "fallback"
        confidence  = "low"

    return {
        "role"          : final_role,
        "confidence"    : confidence,
        "method"        : method,
        "all_candidates": all_candidates[:5],
    }


# ── CLI test ─────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys
    try:
        from .resume_parser    import extract_text_from_pdf
        from .skill_extraction import extract_skills
    except ImportError:
        from resume_parser    import extract_text_from_pdf
        from skill_extraction import extract_skills

    path = sys.argv[1] if len(sys.argv) > 1 else "sample_resume.pdf"
    text = extract_text_from_pdf(path)

    if text is None:
        print("Could not read PDF.")
        sys.exit(1)

    skills  = extract_skills(text)["all_skills"]
    result  = extract_role(text, skills)

    print("=" * 50)
    print("ROLE DETECTION RESULT")
    print("=" * 50)
    print(f"  Role       : {result['role']}")
    print(f"  Confidence : {result['confidence']}")
    print(f"  Method     : {result['method']}")
    print()
    print("  Top candidates by skill vote:")
    for role, score in result["all_candidates"]:
        bar = "█" * int(score * 20)
        print(f"    {role:<45} {score*100:5.1f}%  {bar}")