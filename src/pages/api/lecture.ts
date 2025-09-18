import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // For MVP, just return a static mock lecture JSON
  res.status(200).json({
    lectureId: '12345',
    steps: [
      { stepType: 'speak', content: 'Hello, welcome to this lecture.' },
      { stepType: 'write', content: 'Here is some text on the whiteboard.' },
      { stepType: 'speak', content: 'Let\'s continue our discussion.' },
      { stepType: 'animate', content: 'wave' }
    ]
  });
}
