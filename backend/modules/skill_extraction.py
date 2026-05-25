"""
skill_extraction.py  ──  Module 2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Extracts skills from resume text using a comprehensive keyword
database + regex phrase matching (no spaCy / ML required).

Features
  • 300+ skills across 20 technology categories
  • Handles multi-word skills  (e.g. "spring boot", "react native")
  • Boundary-aware matching  – won't match "c" inside "catch"
  • Alias resolution  (e.g. "js" → "javascript")
  • Returns skills with their category tags
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

import re
from typing import NamedTuple

# ─────────────────────────────────────────────────────────────────
# SKILL DATABASE  {category: [canonical_name, ...]}
# ─────────────────────────────────────────────────────────────────
SKILL_DB: dict[str, list[str]] = {

    "Programming Languages": [
        "python", "java", "c++", "c#", "c", "javascript", "typescript",
        "go", "golang", "rust", "kotlin", "swift", "ruby", "php",
        "scala", "r", "matlab", "perl", "bash", "shell scripting",
        "powershell", "dart", "elixir", "haskell",
    ],

    "Web Frontend": [
        "html", "html5", "css", "css3", "javascript", "typescript",
        "react", "react.js", "next.js", "vue", "vue.js", "nuxt.js",
        "angular", "svelte", "tailwind css", "bootstrap", "sass", "less",
        "webpack", "vite", "redux", "zustand", "react query",
        "styled components", "storybook", "figma", "web performance",
        "web vitals", "accessibility", "wcag",
    ],

    "Web Backend": [
        "node.js", "express", "express.js", "django", "flask", "fastapi",
        "spring boot", "spring", "laravel", "ruby on rails", "asp.net",
        "nestjs", "hapi", "koa", "gin", "fiber", "actix",
        "rest api", "graphql", "grpc", "websockets", "oauth", "jwt",
    ],

    "Databases": [
        "sql", "mysql", "postgresql", "sqlite", "oracle", "mssql",
        "mongodb", "redis", "elasticsearch", "cassandra", "dynamodb",
        "firebase", "supabase", "neo4j", "couchdb",
        "database design", "data modeling", "orm", "prisma", "hibernate",
    ],

    "Data Science & ML": [
        "machine learning", "deep learning", "data science", "data analysis",
        "statistics", "probability", "linear algebra", "calculus",
        "supervised learning", "unsupervised learning", "reinforcement learning",
        "feature engineering", "model evaluation", "cross validation",
        "a/b testing", "time series", "forecasting", "anomaly detection",
        "recommendation systems",
    ],

    "ML Frameworks & Libraries": [
        "tensorflow", "pytorch", "keras", "scikit-learn", "xgboost",
        "lightgbm", "catboost", "huggingface", "transformers",
        "pandas", "numpy", "scipy", "matplotlib", "seaborn",
        "plotly", "bokeh", "opencv", "pillow",
    ],

    "NLP & LLMs": [
        "nlp", "natural language processing", "text classification",
        "named entity recognition", "sentiment analysis", "bert",
        "gpt", "llm", "large language models", "langchain", "llamaindex",
        "rag", "retrieval augmented generation", "tokenization",
        "word embeddings", "word2vec", "glove", "spacy", "nltk",
    ],

    "MLOps & Data Engineering": [
        "mlflow", "dvc", "airflow", "apache airflow", "prefect",
        "spark", "apache spark", "hadoop", "hive", "kafka",
        "apache kafka", "dbt", "snowflake", "redshift", "bigquery",
        "data pipeline", "etl", "elt", "data warehouse", "data lake",
        "feature store",
    ],

    "DevOps & Cloud": [
        "docker", "kubernetes", "k8s", "helm", "terraform", "ansible",
        "jenkins", "github actions", "gitlab ci", "circleci",
        "ci/cd", "continuous integration", "continuous deployment",
        "aws", "azure", "gcp", "google cloud", "heroku", "vercel",
        "netlify", "linux", "nginx", "apache", "load balancing",
        "infrastructure as code",
    ],

    "Cloud Services": [
        "aws lambda", "aws ec2", "aws s3", "aws rds", "aws sagemaker",
        "aws eks", "azure devops", "azure functions", "gcp bigquery",
        "gcp cloud run", "cloudflare", "cdn",
    ],

    "Monitoring & Reliability": [
        "prometheus", "grafana", "datadog", "new relic", "elk stack",
        "elasticsearch", "logstash", "kibana", "pagerduty",
        "slo", "sla", "sre", "chaos engineering", "incident management",
    ],

    "Security & Networking": [
        "cybersecurity", "network security", "penetration testing",
        "owasp", "cryptography", "ssl", "tls", "vpn", "firewalls",
        "siem", "vulnerability assessment", "ethical hacking",
        "linux security", "cloud security", "identity management",
        "zero trust",
    ],

    "Mobile Development": [
        "android", "ios", "react native", "flutter", "swift",
        "kotlin", "objective-c", "mobile development",
        "app store deployment", "push notifications",
        "mvvm", "mvp", "jetpack compose",
    ],

    "Blockchain & Web3": [
        "solidity", "ethereum", "web3", "web3.js", "smart contracts",
        "defi", "nft", "ipfs", "hardhat", "truffle", "rust",
        "layer 2", "blockchain", "cryptocurrency",
    ],

    "Software Engineering": [
        "data structures", "algorithms", "dsa", "oop",
        "object oriented programming", "design patterns", "solid principles",
        "system design", "microservices", "event driven architecture",
        "message queues", "multithreading", "concurrency",
        "unit testing", "integration testing", "tdd", "bdd",
        "code review", "agile", "scrum", "kanban", "jira",
        "git", "github", "gitlab", "bitbucket",
        "rest", "soap", "api design",
    ],

    "Testing": [
        "unit testing", "integration testing", "end to end testing",
        "tdd", "bdd", "jest", "mocha", "pytest", "junit",
        "selenium", "playwright", "cypress", "postman",
        "load testing", "performance testing", "jmeter",
    ],

    "Data Visualization & BI": [
        "tableau", "power bi", "looker", "metabase", "qlik",
        "google analytics", "mixpanel", "amplitude",
        "data visualization", "dashboard",
    ],

    "Mechanical Engineering": [
        "autocad", "solidworks", "catia", "ansys", "fusion 360",
        "thermodynamics", "fluid mechanics", "mechanical design",
        "cad modeling", "fea", "finite element analysis",
        "manufacturing processes", "quality assurance", "six sigma",
        "lean manufacturing",
    ],

    "Civil Engineering": [
        "autocad", "staad pro", "etabs", "revit",
        "structural analysis", "construction management",
        "site supervision", "project planning", "quantity surveying",
        "surveying", "building materials", "gis",
    ],

    "Electrical Engineering": [
        "circuit design", "power systems", "electrical machines",
        "control systems", "plc", "scada", "matlab", "simulink",
        "embedded systems", "arduino", "raspberry pi",
        "pcb design", "altium", "vhdl", "fpga",
    ],

    "Business & Management": [
        "project management", "agile", "scrum", "kanban",
        "business analysis", "requirement gathering",
        "stakeholder management", "risk management",
        "strategic planning", "product management",
        "product roadmap", "okrs",
    ],

    "Soft Skills": [
        "communication", "teamwork", "problem solving", "leadership",
        "time management", "critical thinking", "adaptability",
        "collaboration", "presentation",
    ],
}

# ── Aliases: alternate spellings → canonical skill name ──────────
ALIASES: dict[str, str] = {
    "js"             : "javascript",
    "ts"             : "typescript",
    "py"             : "python",
    "node"           : "node.js",
    "react js"       : "react",
    "reactjs"        : "react",
    "nextjs"         : "next.js",
    "vuejs"          : "vue",
    "angularjs"      : "angular",
    "postgres"       : "postgresql",
    "mongo"          : "mongodb",
    "k8s"            : "kubernetes",
    "tf"             : "tensorflow",
    "sklearn"        : "scikit-learn",
    "scikit learn"   : "scikit-learn",
    "hf"             : "huggingface",
    "gcp"            : "google cloud",
    "nlp"            : "natural language processing",
    "oop"            : "object oriented programming",
    "ci cd"          : "ci/cd",
    "rest"           : "rest api",
    "spring"         : "spring boot",
    "dsa"            : "data structures",
    "ml"             : "machine learning",
    "dl"             : "deep learning",
    "ai"             : "machine learning",
    "llms"           : "large language models",
}

# ── Build a flat list of (pattern_text, canonical, category) ─────
def _build_lookup() -> list[tuple[re.Pattern, str, str]]:
    entries = []
    seen = set()

    def add(raw: str, canonical: str, category: str):
        key = raw.lower()
        if key in seen:
            return
        seen.add(key)
        # Build a word-boundary-aware pattern
        # For terms ending/starting with non-word chars (c++, c#, .net)
        # we use a lookahead/lookbehind on word chars only where applicable
        escaped = re.escape(raw)
        pattern = re.compile(
            r"(?<![a-z0-9\-\+#])(" + escaped + r")(?![a-z0-9\-\+#])",
            re.IGNORECASE,
        )
        entries.append((pattern, canonical, category))

    # Primary skills
    for category, skills in SKILL_DB.items():
        for skill in skills:
            add(skill, skill, category)

    # Aliases
    for alias, canonical in ALIASES.items():
        # Find category of canonical
        cat = next(
            (c for c, lst in SKILL_DB.items() if canonical in lst),
            "Other",
        )
        add(alias, canonical, cat)

    # Sort: longest patterns first so "spring boot" matches before "spring"
    entries.sort(key=lambda x: -len(x[1]))
    return entries


_LOOKUP = _build_lookup()


def extract_skills(text: str) -> dict[str, list[str]]:
    """
    Extract skills from resume text.

    Returns:
        {
            "all_skills"  : [list of all unique canonical skill names],
            "by_category" : { category: [skill, ...], ... }
        }
    """
    text_lower = text.lower()
    found: dict[str, str] = {}   # canonical → category

    for pattern, canonical, category in _LOOKUP:
        if canonical in found:
            continue
        if pattern.search(text_lower):
            found[canonical] = category

    by_category: dict[str, list[str]] = {}
    for skill, cat in sorted(found.items()):
        by_category.setdefault(cat, []).append(skill)

    return {
        "all_skills"  : sorted(found.keys()),
        "by_category" : by_category,
    }


# ── CLI test ─────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys
    try:
        from .resume_parser import extract_text_from_pdf
    except ImportError:
        from resume_parser import extract_text_from_pdf

    path = sys.argv[1] if len(sys.argv) > 1 else "sample_resume.pdf"
    text = extract_text_from_pdf(path)

    if text is None:
        print("Could not read PDF.")
        sys.exit(1)

    result = extract_skills(text)

    print("=" * 50)
    print(f"SKILLS FOUND: {len(result['all_skills'])}")
    print("=" * 50)
    for cat, skills in result["by_category"].items():
        print(f"\n  [{cat}]")
        for s in skills:
            print(f"    • {s}")