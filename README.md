# AdaptAI

AdaptAI is a Next.js web application for repurposing educational content. It allows users to upload documents, images, audio, or video, and generate:

- Summaries
- Notes
- Quizzes (MCQ, True/False, Brief, Fill in the Blank)
- Video scripts
- Text-to-speech (TTS) in multiple Indian languages

## Features
- File upload and extraction (PDF, DOCX, TXT, images, audio, video)
- AI-powered content adaptation (summary, notes, quiz, video script)
- Quiz UI with instant feedback and explanations
- TTS playback for generated content in various languages
- History of adapted content

## Setup
1. Clone the repository.
2. Install dependencies:
	```bash
	npm install
	```
3. Add your API keys and Google Cloud credentials to `.env.local` or Vercel environment variables.
4. Run the development server:
	```bash
	npm run dev
	```

## Deployment
Deploy to Vercel and set environment variables for AssemblyAI, Gemini, and Google Cloud (see code for required keys).

## Usage
1. Paste or upload your content.
2. Select desired output type and language.
3. Generate and interact with adapted content.

---
Made with ❤️ for upGrad Hack.
