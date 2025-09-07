import 'dotenv/config';

// Ensure GOOGLE_APPLICATION_CREDENTIALS is set for local development
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = 'C:\\Users\\Jay Agarwal\\Downloads\\hardy-aleph-471322-n7-17f890309805.json';
}
import textToSpeech from '@google-cloud/text-to-speech';

// Use Vercel env vars for credentials if available, else fallback to local JSON
const isVercel = Boolean(process.env.GCP_SERVICE_ACCOUNT_EMAIL && process.env.GCP_PRIVATE_KEY && process.env.GCP_PROJECT_ID);
const client = new textToSpeech.TextToSpeechClient(
  isVercel
    ? {
        credentials: {
          client_email: process.env.GCP_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        projectId: process.env.GCP_PROJECT_ID,
      }
    : undefined
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { text, languageCode = 'en-IN', voiceName = '', speakingRate = 1.0 } = req.body;

  if (!text) {
    res.status(400).json({ error: 'Text is required' });
    return;
  }

  const request = {
    input: { text },
    voice: { languageCode, name: voiceName },
    audioConfig: { audioEncoding: 'MP3', speakingRate },
  };

  try {
    const [response] = await client.synthesizeSpeech(request);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(response.audioContent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
