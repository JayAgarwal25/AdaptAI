import PDFDocument from 'pdfkit';

export default async function handler(req, res) {
  // Get quizId from query (for now, ignore and use mock data)
  // In future, fetch quiz data from DB or file
  const quizId = req.query.quizId || 'mock';

  let quizArray = [];
  if (req.method === 'POST') {
    try {
      const body = req.body;
      if (typeof body === 'string') {
        // Next.js parses JSON automatically, but fallback for raw string
        quizArray = JSON.parse(body).quiz || [];
      } else {
        quizArray = body.quiz || [];
      }
    } catch {
      quizArray = [];
    }
  } else {
    // fallback: GET returns mock data
    quizArray = [
      {
        type: "mcq",
        question: "What is the primary purpose of photosynthesis?",
        options: [
          "To release carbon dioxide",
          "To absorb oxygen",
          "To convert light energy into chemical energy",
          "To produce water"
        ],
        answer: "To convert light energy into chemical energy",
        explanation: "Photosynthesis converts light energy into chemical energy to create food."
      },
      {
        type: "brief",
        question: "Name three types of organisms that perform photosynthesis.",
        answer: "Plants, algae, and some bacteria.",
        explanation: "The content states plants, algae, and some bacteria perform photosynthesis."
      },
      {
        type: "truefalse",
        question: "Photosynthesis absorbs oxygen and releases carbon dioxide.",
        answer: "False",
        explanation: "Photosynthesis uses carbon dioxide and releases oxygen."
      },
      {
        type: "fillblank",
        question: "Photosynthesis uses sunlight, water, and ______ to produce glucose and oxygen.",
        answer: "carbon dioxide",
        explanation: "Carbon dioxide is one of the key inputs for photosynthesis, along with sunlight and water."
      }
    ];
  }

  // Create PDF document
  const doc = new PDFDocument({ margin: 50 });
  let buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
    const pdfData = Buffer.concat(buffers);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="quiz.pdf"');
    res.send(pdfData);
  });

  // Title
  doc.fontSize(22).text('Generated Quiz', { align: 'center' });
  doc.moveDown(2);

  // Questions
  quizArray.forEach((q, idx) => {
    doc.fontSize(14).text(`${idx + 1}. ${q.question}`);
    if (q.type === 'mcq' && Array.isArray(q.options)) {
      q.options.forEach((opt, i) => {
        const label = String.fromCharCode(65 + i); // A, B, C...
        doc.text(`   ${label}. ${opt}`);
      });
    } else if (q.type === 'truefalse') {
      doc.text('   True');
      doc.text('   False');
    } else if (q.type === 'fillblank') {
      doc.text('   (Fill in the blank)');
    } else if (q.type === 'brief') {
      doc.text('   (Brief answer)');
    }
    doc.moveDown();
  });

  // Answers & Explanations
  doc.moveDown(2);
  doc.fontSize(16).text('Answers & Explanations', { underline: true });
  quizArray.forEach((q, idx) => {
    doc.fontSize(12).text(`${idx + 1}. ${q.answer}`);
    if (q.explanation) {
      doc.fontSize(10).text(`   Explanation: ${q.explanation}`);
    }
    doc.moveDown(0.5);
  });

  doc.end();
}
