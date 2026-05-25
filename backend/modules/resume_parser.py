"""
resume_parser.py  ──  Module 1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Extracts clean, structured text from a PDF resume.

Features
  • Multi-page PDF support
  • Cleans pdfplumber artefacts  (cid:NNN), ligatures, stray bullets
  • Normalises whitespace while preserving paragraph structure
  • Detects major section headings
  • Returns both raw text and a structured dict  {name, email,
    phone, linkedin, github, sections}

Dependency: pdfplumber  (pip install pdfplumber)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

import re
import pdfplumber

# ── known section headings ───────────────────────────────────────
SECTION_HEADINGS = [
    "summary", "objective", "profile",
    "experience", "work experience", "employment",
    "education", "academic",
    "skills", "technical skills", "core competencies",
    "projects", "personal projects",
    "certifications", "certificates", "achievements",
    "awards", "publications", "research",
    "languages", "interests", "hobbies",
    "references",
]
_HEADING_RE = re.compile(
    r"^(" + "|".join(re.escape(h) for h in SECTION_HEADINGS) + r")\s*[:\-–—]?\s*$",
    re.IGNORECASE,
)


def _clean_text(raw: str) -> str:
    """Remove PDF artefacts and normalise whitespace."""
    # Remove (cid:NNN) substitution characters from pdfplumber
    text = re.sub(r"\(cid:\d+\)", " ", raw)
    # Replace common ligature artefacts
    replacements = {
        "ﬁ": "fi", "ﬂ": "fl", "ﬀ": "ff", "ﬃ": "ffi", "ﬄ": "ffl",
        "\u2019": "'", "\u2018": "'", "\u201c": '"', "\u201d": '"',
        "\u2013": "-", "\u2014": "-", "\u00b7": "·",
    }
    for bad, good in replacements.items():
        text = text.replace(bad, good)
    # Collapse multiple spaces / tabs to single space per line
    lines = []
    for line in text.splitlines():
        line = re.sub(r"[ \t]+", " ", line).strip()
        lines.append(line)
    # Remove runs of 3+ blank lines → 2 blank lines max
    cleaned = re.sub(r"\n{3,}", "\n\n", "\n".join(lines))
    return cleaned.strip()


def _extract_contact(text: str) -> dict:
    """Pull name, email, phone, linkedin, github from first ~10 lines."""
    head = "\n".join(text.splitlines()[:10])

    email_match   = re.search(r"[\w.+-]+@[\w.-]+\.[a-z]{2,}", head, re.IGNORECASE)
    phone_match   = re.search(r"(\+?\d[\d\s\-().]{7,}\d)", head)
    linkedin_match= re.search(r"linkedin\.com/in/[\w\-]+", head, re.IGNORECASE)
    github_match  = re.search(r"github\.com/[\w\-]+", head, re.IGNORECASE)

    # Name heuristic: first non-empty line that is NOT an email / phone / URL
    name = ""
    for line in text.splitlines():
        line = line.strip()
        if line and not re.search(r"[@/\d]", line) and len(line.split()) <= 5:
            name = line
            break

    return {
        "name"    : name,
        "email"   : email_match.group()    if email_match    else "",
        "phone"   : phone_match.group(1)   if phone_match    else "",
        "linkedin": linkedin_match.group() if linkedin_match else "",
        "github"  : github_match.group()   if github_match   else "",
    }


def _split_sections(text: str) -> dict:
    """
    Split resume text into named sections.
    Returns {section_name: section_text, ...}
    """
    sections   = {}
    current    = "header"
    buffer     = []

    for line in text.splitlines():
        stripped = line.strip()
        if _HEADING_RE.match(stripped):
            sections[current] = "\n".join(buffer).strip()
            current = stripped.lower().rstrip(":–—-").strip()
            buffer  = []
        else:
            buffer.append(line)

    sections[current] = "\n".join(buffer).strip()
    return {k: v for k, v in sections.items() if v}


def extract_text_from_pdf(file_path: str) -> str | None:
    """
    Extract and clean all text from a PDF resume.

    Args:
        file_path: Path to the PDF file.

    Returns:
        Cleaned plain-text string, or None on failure.
    """
    raw_pages = []
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    raw_pages.append(page_text)
    except FileNotFoundError:
        print(f"[resume_parser] File not found: {file_path}")
        return None
    except Exception as e:
        print(f"[resume_parser] Error reading PDF: {e}")
        return None

    if not raw_pages:
        print("[resume_parser] No text could be extracted from PDF.")
        return None

    return _clean_text("\n".join(raw_pages))


def parse_resume(file_path: str) -> dict | None:
    """
    Full resume parse — returns a structured dict:
    {
        "raw_text": str,
        "contact" : { name, email, phone, linkedin, github },
        "sections": { section_name: section_text, ... }
    }
    Returns None if the PDF could not be read.
    """
    text = extract_text_from_pdf(file_path)
    if text is None:
        return None

    return {
        "raw_text": text,
        "contact" : _extract_contact(text),
        "sections": _split_sections(text),
    }


# ── CLI test ─────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys
    path = sys.argv[1] if len(sys.argv) > 1 else "sample_resume.pdf"
    result = parse_resume(path)

    if result is None:
        print("Failed to parse resume.")
    else:
        print("=" * 50)
        print("CONTACT INFO")
        print("=" * 50)
        for k, v in result["contact"].items():
            print(f"  {k:10}: {v}")
        print()
        print("=" * 50)
        print("SECTIONS DETECTED")
        print("=" * 50)
        for sec, body in result["sections"].items():
            preview = body[:120].replace("\n", " ")
            print(f"  [{sec}]  {preview}...")
        print()
        print("=" * 50)
        print("RAW TEXT (first 500 chars)")
        print("=" * 50)
        print(result["raw_text"][:500])