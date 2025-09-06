# Optional: Batch transcription utility
# You only need this if you want to transcribe multiple files at once, not for single video uploads from the app.
# The API route only needs transcribe.py for single file transcription.

import os
from transcribe import WhisperTranscriber
import asyncio

def find_audio_files(root_dir):
    audio_files = []
    for dirpath, _, filenames in os.walk(root_dir):
        for fname in filenames:
            if fname.lower().endswith(('.mp3', '.mp4')):
                audio_files.append(os.path.join(dirpath, fname))
    return audio_files

async def transcribe_and_save(audio_path, transcriber, transcripts_dir):
    transcript = await transcriber.transcribe(audio_path)
    base = os.path.splitext(os.path.basename(audio_path))[0]
    out_path = os.path.join(transcripts_dir, f"{base}_transcript.txt")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(transcript)

async def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    transcripts_dir = os.path.join(root_dir, "transcripts")
    os.makedirs(transcripts_dir, exist_ok=True)
    audio_files = find_audio_files(root_dir)
    if not audio_files:
        print("No mp3 or mp4 files found.")
        return
    transcriber = WhisperTranscriber()
    for audio_path in audio_files:
        await transcribe_and_save(audio_path, transcriber, transcripts_dir)

if __name__ == "__main__":
    asyncio.run(main())
