import fetch from 'node-fetch';

export const config = {
  api: {
    bodyParser: true,
  },
};

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY; // Set this in Vercel dashboard

async function transcribeWithAssemblyAI(audioUrl) {
  // 1. Start transcription job
  const transcriptRes = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: {
      'authorization': ASSEMBLYAI_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ audio_url: audioUrl }),
  });
  const { id } = await transcriptRes.json();

  // 2. Poll for completion
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

  const { audio_url } = req.body;
  if (!audio_url) {
    res.status(400).json({ error: 'audio_url is required' });
    return;
  }

  if (!ASSEMBLYAI_API_KEY) {
    res.status(500).json({ error: 'AssemblyAI API key not set' });
    return;
  }
  try {
    const transcript = await transcribeWithAssemblyAI(audio_url);
    res.status(200).json({ transcript });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
}
