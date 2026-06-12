# JBDH – About the Service

JBDH is under active development and this page is almost certainly not up to date with how things work. Read with a large pinch of salt.

---

## How JBDH works

### CV handling

When you upload a CV (PDF, DOCX, MD, RTF, TXT), the text is automatically extracted locally in the browser. You are then asked to anonymise the text. (Our scripts handle most phone numbers, personal ID numbers and email addresses, but struggle with names and addresses.) The anonymised text can then be sent to an AI model (various models are currently used in different parts of the service) for analysis. The analysis produces a structured result:

- Up to 10 suitable job titles for you
- Technical skills (hard skills)
- Soft skills
- Experiences with titles and estimated duration
- Education and certifications

The result is stored in the database linked to your account and used as the basis for matching.

### Incoming jobs

Job listings are fetched from external sources (including Platsbanken/JobTech) and stored with title, company, location, description, skill requirements and application deadline. Each listing is semantically vectorised using the MiniLM model — a mathematical representation of the listing's meaning that enables fast similarity search.

### The matching process

Matching happens in two steps:

**Step 1 – Vector search:** Your CV response is vectorised and compared against all job vectors via cosine similarity. The most relevant jobs are selected quickly without AI needing to analyse every listing.

**Step 2 – AI deep analysis:** For each selected job, the AI performs a detailed comparison and produces:
- Matching points (what you have that fits)
- Non-matching points (gaps)
- Areas for improvement
- Concrete coaching tips

There is also a real-time analysis (CV against any job listing) via Server-Sent Events — the result streams in progressively with a percentage indicator and a summary of strengths, weaknesses and relevant experience.

The final score weights professional direction at 70% and competencies at 30%. The system strongly penalises matches outside one's area of expertise (e.g. an IT profile against a healthcare job).

### Who benefits from JBDH?

- **Job seekers** — Upload a CV, receive an AI analysis of their profile and automatic job recommendations with an explanation of why each job is a good fit.
- **Job brokers / recruiters** — Can own and manage candidate profiles, match against specific listings and view detailed fit reports per candidate/job combination.
- **Consulting firms** — Can match consultants against assignments and identify skill gaps ahead of upcoming projects.


---

## For you who are looking for a job

Hey! Tired of sending the same CV to fifty jobs and never hearing back?

JBDH does the work for you. You upload your CV — it takes thirty seconds — and the system reads it with AI and understands what you actually know, not just what happens to be written with the right keywords. Then it matches you against real job listings and explains *why* each job suits you — and what might be missing.

It's like having a career coach who worked through the night and laid out the ten best jobs on the breakfast table. No more scrolling through hundreds of irrelevant listings.

You can also paste any job listing and get a real-time analysis — spot a job on LinkedIn or Blocket, paste the text and find out within a minute how well you match and what to highlight in your cover letter.

Free to try. No BS.

---

## For you who want to make money from job listings

Do you have a network of candidates, or do you work at a staffing agency, recruitment firm, or run something similar on the side?

Then you know the problem isn't finding jobs — there are as many listings as you could ever want. The problem is matching the right person to the right listing without spending ten hours on it manually.

JBDH solves exactly that. You add your candidates' CVs, the system analyses them with AI and you can then match them against specific assignments in seconds. You immediately see who fits best, why they fit, and what's missing — without reading a single document yourself.

The result: you can handle more candidates, respond faster to enquiries and appear more professional to clients. What used to take half a day now takes five minutes.

The more candidates you have in the system, the more value you get out of it.

## Contact

Have questions or want to know more? Get in touch with us.
