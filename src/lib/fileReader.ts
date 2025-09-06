// General file reader utility for browser
// Reads any file type and extracts text (where possible)
// Usage: import { readFileAsText } from '@/lib/fileReader'

export async function readFileAsText(file: File): Promise<string> {
  try {
    // For plain text
    if (file.type.startsWith('text/')) {
      return await file.text();
    }

    // For PDF
    if (file.type === 'application/pdf') {
      // Use PDF.js (must be installed: npm install pdfjs-dist)
      // @ts-ignore
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf');
      // @ts-ignore
      const workerSrc = window.location.origin + '/pdf.worker.js';
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(' ');
      }
      return text;
    }

    // For DOCX
    if (file.name.endsWith('.docx')) {
      // Use mammoth (must be installed: npm install mammoth)
      // @ts-ignore
      const mammoth = await import('mammoth/mammoth.browser');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }

    // For images (OCR)
    if (file.type.startsWith('image/')) {
      // Use Tesseract.js (must be installed: npm install tesseract.js)
      // @ts-ignore
      const Tesseract = await import('tesseract.js');
      const result = await Tesseract.recognize(file, 'eng');
      return result.data.text;
    }

    // For unsupported types, fallback to filename
    return `[Unsupported file type: ${file.name}]`;
  } catch (err) {
    return `Error reading file: ${file.name}`;
  }
}
