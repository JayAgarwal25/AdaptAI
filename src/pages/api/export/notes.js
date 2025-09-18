
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
export default async function handler(req, res) {
  let notes = '';
  if (req.method === 'POST') {
    try {
      const body = req.body;
      if (typeof body === 'string') {
        notes = JSON.parse(body).notes || '';
      } else {
        notes = body.notes || '';
      }
    } catch {
      notes = '';
    }
  } else {
    // fallback: GET returns mock notes
    notes = '- Photosynthesis converts light energy into chemical energy.\n- Plants, algae, and some bacteria perform photosynthesis.\n- Carbon dioxide, sunlight, and water are required.';
  }

  // Load a Unicode font (Noto Sans)
  const fontPath = path.resolve(process.cwd(), 'public', 'fonts', 'NotoSans-Regular.ttf');
  const doc = new PDFDocument({ margin: 50 });
  if (fs.existsSync(fontPath)) {
    doc.registerFont('NotoSans', fontPath);
    doc.font('NotoSans');
  }
  let buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
    const pdfData = Buffer.concat(buffers);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="notes.pdf"');
    res.send(pdfData);
  });

  // Title
  doc.fontSize(22).text('Generated Notes', { align: 'center' });
  doc.moveDown(2);

  // Helper to strip HTML tags
  function stripHtmlTags(str) {
    return str.replace(/<[^>]*>/g, '');
  }

  // Notes (split by lines, render as bullets)
  if (notes) {
    const cleanNotes = stripHtmlTags(notes);
    const lines = cleanNotes.split(/\r?\n|\r|•/).filter(l => l.trim());
    lines.forEach(line => {
      doc.fontSize(14).text(`• ${line.trim()}`);
      doc.moveDown(0.5);
    });
  } else {
    doc.fontSize(14).text('No notes available.');
  }

  doc.end();
}
