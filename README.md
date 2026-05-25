# 🎯 GetMePlaced — AI Interview Preparation Tool

> Practice interviews, close skill gaps, and walk in prepared — powered by AI.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

---

## ✨ Features

- **Mock Interviews** — Role-specific questions with real-time AI evaluation
- **Follow-Up Interviews** — AI drills deeper based on your previous answers
- **Resume Parsing** — Upload your resume; the tool extracts skills and gaps automatically
- **Skill Extraction & Gap Analysis** — Know exactly what you're missing for your target role
- **Speech-to-Text** — Answer questions by voice, just like a real interview
- **LLM-Powered Feedback** — Detailed scoring on correctness, communication, and clarity

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, JavaScript |
| Backend | Python, FastAPI, Uvicorn |
| AI / LLM | LLM module (pluggable — OpenAI / local) |
| Resume Parsing | Custom Python parser |
| Speech | `speech_to_text.py` — browser mic → transcript |
| Video | `video_monitor.py` — optional webcam monitoring |

---

## 📁 Project Structure

```
interviewreact/
├── backend/
│   ├── modules/
│   │   ├── llm_module.py          # Core LLM interaction
│   │   ├── llm_practice.py        # Practice question generation
│   │   ├── followup_llm.py        # Follow-up question logic
│   │   ├── resume_parser.py       # PDF resume → structured data
│   │   ├── role_extraction.py     # Extract target role from input
│   │   ├── skill_extraction.py    # Extract skills from resume
│   │   ├── skill_gap.py           # Compare skills vs role requirements
│   │   ├── speech_to_text.py      # Voice input processing
│   │   └── video_monitor.py       # Optional webcam monitoring
│   ├── uploads/                   # Uploaded resumes (gitignored)
│   ├── app.py                     # FastAPI app entry point
│   └── main.py                    # Server bootstrap
├── src/
│   ├── components/                # Reusable React components
│   └── pages/
│       ├── Home.jsx               # Landing page
│       ├── MockInterview.jsx      # Live mock interview UI
│       ├── FollowUpInterview.jsx  # Follow-up session
│       ├── Practice.jsx           # Practice mode
│       ├── DSAPractice.jsx        # DSA-specific practice
│       ├── courses.jsx            # Courses listing
│       ├── LoginPage.jsx          # Auth
│       └── AboutProject.jsx       # About
└── public/
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- pip

### 1. Clone the repository

```bash
git clone https://github.com/your-username/interviewreact.git
cd interviewreact
```

### 2. Set up the backend

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in `/backend`:

```env
OPENAI_API_KEY=your_api_key_here   # or your LLM provider key
```

Start the backend server:

```bash
python -m uvicorn app:app --reload
# Runs on http://127.0.0.1:8000
```

### 3. Set up the frontend

```bash
# From the project root
npm install
npm run dev
# Runs on http://localhost:5173
```

### 4. Open the app

Navigate to `http://localhost:5173` in your browser.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/generate-questions` | Generate interview questions for a role |
| `POST` | `/evaluate-answer` | Evaluate a candidate's answer with AI feedback |
| `POST` | `/parse-resume` | Upload and parse a PDF resume |
| `POST` | `/skill-gap` | Compare extracted skills vs target role |
| `POST` | `/speech-to-text` | Convert audio input to text |

---

## 🧠 How It Works

1. **Upload your resume** — the parser extracts your skills, experience, and target role
2. **Choose a mock interview** — pick company type, role, and difficulty
3. **Answer questions** — type or speak your answers in real time
4. **Get instant feedback** — AI scores your answer on correctness, communication, and edge-case coverage
5. **Follow-up round** — the AI digs into your weak spots with targeted follow-up questions
6. **Review your gaps** — see exactly what to improve before your next session

---

## 📸 Screenshots

> Add screenshots here — mock interview UI, feedback panel, skill gap view

---

## 🗺️ Roadmap

- [ ] Company-specific question banks (FAANG, startups, product companies)
- [ ] Behavioral interview mode (STAR method scoring)
- [ ] System design interview support
- [ ] Progress dashboard across sessions
- [ ] Peer mock interview matching
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
# Open a pull request
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 👤 Author

**Bimal** — [GitHub](https://github.com/your-username) · [LinkedIn](https://linkedin.com/in/your-profile)

---

> Built for the ones who have to earn it.
