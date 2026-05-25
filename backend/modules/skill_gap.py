"""
skill_gap.py  ──  Module 4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Analyses the gap between a candidate's extracted skills and the
skills required for a target role.

Features
  • 20 roles with curated required-skill lists
  • Tiered missing skills  (must-have vs nice-to-have)
  • Readiness level  (Ready / Almost / Developing / Beginner)
  • Learning recommendations per missing skill
  • Full structured output consumed by the FastAPI endpoint
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

from __future__ import annotations

# ─────────────────────────────────────────────────────────────────
# ROLE SKILLS DATABASE
# Each role has:
#   "must"  – non-negotiable skills interviewers will always test
#   "good"  – valuable / commonly expected skills
# ─────────────────────────────────────────────────────────────────
ROLE_SKILLS_DETAILED: dict[str, dict[str, list[str]]] = {

    "software development engineer": {
        "must": [
            "data structures", "algorithms", "object oriented programming",
            "java", "python", "system design", "git",
        ],
        "good": [
            "sql", "rest api", "docker", "multithreading", "design patterns",
            "unit testing", "linux", "agile", "microservices",
        ],
    },

    "frontend developer": {
        "must": [
            "html5", "css3", "javascript", "react", "typescript",
        ],
        "good": [
            "next.js", "redux", "tailwind css", "webpack", "vite",
            "jest", "storybook", "web performance", "accessibility", "figma",
        ],
    },

    "backend developer": {
        "must": [
            "python", "rest api", "sql", "docker", "git",
        ],
        "good": [
            "node.js", "postgresql", "redis", "microservices",
            "spring boot", "kafka", "unit testing", "system design", "linux",
        ],
    },

    "full stack developer": {
        "must": [
            "html5", "css3", "javascript", "react", "node.js",
            "sql", "rest api",
        ],
        "good": [
            "typescript", "postgresql", "mongodb", "docker",
            "ci/cd", "system design", "git", "jest",
        ],
    },

    "data scientist": {
        "must": [
            "python", "machine learning", "statistics", "pandas",
            "numpy", "scikit-learn", "sql",
        ],
        "good": [
            "tensorflow", "pytorch", "data visualization", "feature engineering",
            "model evaluation", "tableau", "spark", "natural language processing",
            "a/b testing",
        ],
    },

    "ai / ml engineer": {
        "must": [
            "python", "deep learning", "pytorch", "tensorflow",
            "machine learning", "natural language processing",
        ],
        "good": [
            "huggingface", "large language models", "mlflow", "docker",
            "kubernetes", "data pipeline", "feature engineering",
            "opencv", "aws sagemaker", "model evaluation",
        ],
    },

    "data engineer": {
        "must": [
            "python", "sql", "spark", "kafka", "etl",
        ],
        "good": [
            "airflow", "dbt", "snowflake", "bigquery", "redshift",
            "data warehouse", "data pipeline", "docker",
            "postgresql", "scala", "data modeling",
        ],
    },

    "data analyst": {
        "must": [
            "sql", "python", "data analysis", "data visualization", "statistics",
        ],
        "good": [
            "pandas", "tableau", "power bi", "excel", "a/b testing",
            "google analytics", "postgresql", "r",
        ],
    },

    "bi / analytics developer": {
        "must": [
            "sql", "tableau", "power bi", "data visualization", "data modeling",
        ],
        "good": [
            "python", "dbt", "snowflake", "bigquery", "statistics",
            "google analytics", "looker", "etl",
        ],
    },

    "devops / cloud engineer": {
        "must": [
            "docker", "kubernetes", "ci/cd", "linux", "aws",
        ],
        "good": [
            "terraform", "ansible", "github actions", "helm",
            "prometheus", "grafana", "python", "nginx", "git",
            "infrastructure as code",
        ],
    },

    "site reliability engineer (sre)": {
        "must": [
            "kubernetes", "linux", "python", "monitoring",
            "incident management",
        ],
        "good": [
            "prometheus", "grafana", "docker", "terraform",
            "chaos engineering", "slo", "ci/cd", "elk stack",
            "load balancing", "go",
        ],
    },

    "cybersecurity engineer": {
        "must": [
            "network security", "penetration testing", "owasp",
            "linux", "python",
        ],
        "good": [
            "cryptography", "siem", "vulnerability assessment",
            "ethical hacking", "cloud security", "incident management",
            "identity management", "ssl", "zero trust",
        ],
    },

    "mobile developer (android/ios)": {
        "must": [
            "kotlin", "swift", "rest api", "git",
        ],
        "good": [
            "react native", "flutter", "firebase", "mvvm",
            "push notifications", "app store deployment",
            "jetpack compose", "unit testing",
        ],
    },

    "blockchain developer": {
        "must": [
            "solidity", "ethereum", "smart contracts", "web3",
        ],
        "good": [
            "rust", "hardhat", "defi", "nft", "ipfs",
            "cryptography", "javascript", "python", "layer 2",
        ],
    },

    "mechanical engineer": {
        "must": [
            "autocad", "solidworks", "thermodynamics", "mechanical design",
        ],
        "good": [
            "ansys", "catia", "fea", "manufacturing processes",
            "quality assurance", "lean manufacturing", "matlab",
        ],
    },

    "civil engineer": {
        "must": [
            "autocad", "structural analysis", "construction management",
        ],
        "good": [
            "staad pro", "etabs", "revit", "site supervision",
            "project planning", "quantity surveying", "gis",
        ],
    },

    "electrical engineer": {
        "must": [
            "circuit design", "power systems", "matlab",
        ],
        "good": [
            "plc", "scada", "embedded systems", "control systems",
            "simulink", "fpga", "arduino", "pcb design",
        ],
    },

    "hr manager": {
        "must": [
            "recruitment", "communication", "leadership",
            "performance management",
        ],
        "good": [
            "employee engagement", "conflict resolution",
            "stakeholder management", "payroll management",
            "time management", "teamwork",
        ],
    },

    "product manager": {
        "must": [
            "product roadmap", "agile", "stakeholder management",
            "okrs", "communication",
        ],
        "good": [
            "sql", "data analysis", "jira", "figma",
            "a/b testing", "user research", "leadership",
        ],
    },

    "project manager": {
        "must": [
            "project management", "agile", "risk management",
            "communication", "stakeholder management",
        ],
        "good": [
            "scrum", "kanban", "jira", "documentation",
            "leadership", "time management", "strategic planning",
        ],
    },
}

# ── Flat ROLE_SKILLS for backward-compat (used by role_extraction) ──
ROLE_SKILLS: dict[str, list[str]] = {
    role: data["must"] + data["good"]
    for role, data in ROLE_SKILLS_DETAILED.items()
}

# ── Learning resource hints per skill (a sample – extend freely) ──
LEARNING_HINTS: dict[str, str] = {
    "data structures"              : "LeetCode Explore · Striver's DSA Sheet",
    "algorithms"                   : "LeetCode Explore · Codeforces",
    "system design"                : "Grokking System Design · ByteByteGo",
    "docker"                       : "Docker Docs · TechWorld with Nana (YouTube)",
    "kubernetes"                   : "Kubernetes Docs · KodeKloud course",
    "machine learning"             : "Andrew Ng ML Specialisation (Coursera)",
    "deep learning"                : "fast.ai · DeepLearning.AI Specialisation",
    "pytorch"                      : "PyTorch official tutorials · fast.ai",
    "tensorflow"                   : "TensorFlow tutorials · DeepLearning.AI",
    "natural language processing"  : "HuggingFace Course · Stanford CS224N",
    "large language models"        : "Andrej Karpathy's makemore · HuggingFace",
    "sql"                          : "SQLZoo · Mode SQL Tutorial",
    "spark"                        : "Databricks Academy · Udemy Spark course",
    "kafka"                        : "Confluent Kafka 101 · Udemy",
    "airflow"                      : "Astronomer Airflow Guides",
    "dbt"                          : "dbt Learn (getdbt.com)",
    "terraform"                    : "HashiCorp Learn · Cloud Guru course",
    "ci/cd"                        : "GitHub Actions Docs · GitLab CI Docs",
    "react"                        : "React Docs (react.dev) · Scrimba",
    "typescript"                   : "TypeScript Handbook · Matt Pocock TS",
    "next.js"                      : "Next.js Docs · Lee Robinson tutorials",
    "solidity"                     : "CryptoZombies · Solidity Docs",
    "penetration testing"          : "TryHackMe · Hack The Box · eJPT cert",
    "network security"             : "CompTIA Security+ · Professor Messer",
}


# ─────────────────────────────────────────────────────────────────
# MAIN FUNCTION
# ─────────────────────────────────────────────────────────────────
def analyze_skill_gap(role: str, extracted_skills: list[str]) -> dict:
    """
    Perform a full skill-gap analysis.

    Args:
        role:             Canonical role key (from ROLE_SKILLS_DETAILED).
        extracted_skills: List of skills found in the resume.

    Returns:
        {
            "role"               : str,
            "skills"             : [all required skills],
            "matched_skills"     : [skills the candidate has],
            "missing_skills"     : [all skills they lack],
            "missing_must_have"  : [critical missing skills],
            "missing_nice_to_have": [nice-to-have missing skills],
            "coverage_percentage": float  0-100,
            "readiness_level"    : str,
            "readiness_label"    : str,
            "learning_tips"      : { skill: hint_string },
            "interview_focus"    : [top skills to target in interviews],
        }
    """
    role_key = role.lower().strip()

    # Fuzzy role key lookup
    if role_key not in ROLE_SKILLS_DETAILED:
        # Try partial match
        for key in ROLE_SKILLS_DETAILED:
            if role_key in key or key in role_key:
                role_key = key
                break
        else:
            role_key = "software development engineer"

    data        = ROLE_SKILLS_DETAILED[role_key]
    must_skills = data["must"]
    good_skills = data["good"]
    all_required = must_skills + good_skills

    skill_set = set(s.lower() for s in extracted_skills)

    matched        = [s for s in all_required if s in skill_set]
    missing_all    = [s for s in all_required if s not in skill_set]
    missing_must   = [s for s in must_skills  if s not in skill_set]
    missing_nice   = [s for s in good_skills  if s not in skill_set]

    coverage = round(len(matched) / len(all_required) * 100, 1) if all_required else 0.0
    must_coverage = round(
        len([s for s in must_skills if s in skill_set]) / len(must_skills) * 100, 1
    ) if must_skills else 0.0

    # Readiness level based on must-have coverage
    if must_coverage >= 85:
        readiness_level, readiness_label = "ready",      "🟢 Interview Ready"
    elif must_coverage >= 60:
        readiness_level, readiness_label = "almost",     "🟡 Almost Ready"
    elif must_coverage >= 35:
        readiness_level, readiness_label = "developing", "🟠 Developing"
    else:
        readiness_level, readiness_label = "beginner",   "🔴 Needs Foundation"

    # Learning tips for missing skills (must-have prioritised)
    learning_tips = {
        s: LEARNING_HINTS[s]
        for s in (missing_must + missing_nice)
        if s in LEARNING_HINTS
    }

    # Interview focus = matched must-have skills + most critical missing must
    interview_focus = [s for s in must_skills if s in skill_set]
    interview_focus += missing_must[:3]   # top 3 gaps interviewers probe

    return {
        "role"                 : role_key,
        "skills"               : all_required,
        "matched_skills"       : matched,
        "missing_skills"       : missing_all,
        "missing_must_have"    : missing_must,
        "missing_nice_to_have" : missing_nice,
        "coverage_percentage"  : coverage,
        "must_coverage"        : must_coverage,
        "readiness_level"      : readiness_level,
        "readiness_label"      : readiness_label,
        "learning_tips"        : learning_tips,
        "interview_focus"      : interview_focus,
    }


# ── CLI test ─────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys

    # Demo
    sample_skills = ["python", "machine learning", "pandas", "numpy", "sql", "docker"]
    role = sys.argv[1] if len(sys.argv) > 1 else "data scientist"

    result = analyze_skill_gap(role, sample_skills)

    print("=" * 55)
    print(f"SKILL GAP ANALYSIS — {result['role'].upper()}")
    print("=" * 55)
    print(f"  Readiness    : {result['readiness_label']}")
    print(f"  Coverage     : {result['coverage_percentage']}%  (all)  |  {result['must_coverage']}%  (must-have)")
    print()
    print(f"  ✅ Matched ({len(result['matched_skills'])})  : {', '.join(result['matched_skills'])}")
    print()
    print(f"  🔴 Missing must-have ({len(result['missing_must_have'])})  : {', '.join(result['missing_must_have'])}")
    print(f"  🟡 Missing nice-to-have ({len(result['missing_nice_to_have'])}) : {', '.join(result['missing_nice_to_have'])}")
    print()
    print("  📚 Learning Tips:")
    for skill, tip in result["learning_tips"].items():
        print(f"    • {skill:35} → {tip}")