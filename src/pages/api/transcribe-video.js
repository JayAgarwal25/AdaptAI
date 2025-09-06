import formidable from 'formidable';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import fetch from 'node-fetch';

export const config = {
  api: {
    bodyParser: false,
  },
};

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY; // Set this in Vercel dashboard

async function transcribeWithAssemblyAI(filePath) {
  // 1. Upload file to AssemblyAI
  const uploadRes = await fetch('https://api.assemblyai.com/v2/upload', {
    method: 'POST',
    headers: { 'authorization': ASSEMBLYAI_API_KEY },
    body: fs.createReadStream(filePath),
  });
  const { upload_url } = await uploadRes.json();

  // 2. Start transcription job
  const transcriptRes = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: {
      'authorization': ASSEMBLYAI_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ audio_url: upload_url }),
  });
  const { id } = await transcriptRes.json();

  // 3. Poll for completion
  let transcriptText = '';
  for (let i = 0; i < 60; i++) { // up to 60 seconds
    await new Promise(r => setTimeout(r, 2000));
    const statusRes = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
      headers: { 'authorization': ASSEMBLYAI_API_KEY },
    });
    const statusJson = await statusRes.json();
    if (statusJson.status === 'completed') {
      transcriptText = statusJson.text;
      break;
    }
    if (statusJson.status === 'error') {
      throw new Error('AssemblyAI transcription error: ' + statusJson.error);
    }
  }
  if (!transcriptText) throw new Error('Transcription timed out');
  return transcriptText;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const form = formidable({
    uploadDir: path.join(process.cwd(), 'uploads'),
    keepExtensions: true,
  });
  fs.mkdirSync(form.uploadDir, { recursive: true });

  await new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(500).json({ error: 'File upload error', details: err.message });
        return reject();
      }
      const videoFile = files.video;
      if (!videoFile) {
        res.status(400).json({ error: 'No video file uploaded' });
        return reject();
      }
      const videoPath = Array.isArray(videoFile) ? videoFile[0].filepath : videoFile.filepath;

      // Choose method: AssemblyAI if enabled, else local Python
      const useAssemblyAI = fields.useAssemblyAI === 'true' || process.env.USE_ASSEMBLYAI === 'true';

      try {
        let transcript = '';
        if (useAssemblyAI && ASSEMBLYAI_API_KEY) {
          transcript = await transcribeWithAssemblyAI(videoPath);
        } else {
          // Local Python fallback
          const transcriptPath = path.join(process.cwd(), 'uploads', `${Date.now()}_transcript.txt`);
          const pythonScript = path.join(process.cwd(), 'scripts', 'transcribe.py');
          const pythonArgs = [pythonScript, videoPath, transcriptPath];
          const pythonProcess = spawn('python', pythonArgs);

          await new Promise((resolvePython, rejectPython) => {
            pythonProcess.on('close', (code) => {
              if (code !== 0) return rejectPython(new Error('Python script failed'));
              fs.readFile(transcriptPath, 'utf8', (err, data) => {
                if (err) return rejectPython(err);
                transcript = data;
                // Clean up files
                try { fs.unlinkSync(videoPath); } catch {}
                try { fs.unlinkSync(transcriptPath); } catch {}
                resolvePython();
              });
            });
          });
        }
        res.status(200).json({ transcript });
        // Clean up video file
        try { fs.unlinkSync(videoPath); } catch {}
        resolve();
      } catch (error) {
        res.status(500).json({ error: error.message });
        try { fs.unlinkSync(videoPath); } catch {}
        reject();
      }
    });
  });
}
