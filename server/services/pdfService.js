import multer from 'multer';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

// Multer memory storage configured with 10MB limit and PDF mime filter
const storage = multer.memoryStorage();

export const uploadPdf = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only PDF (.pdf) documents are supported.'));
    }
  },
});

export async function extractTextFromPdfBuffer(buffer) {
  try {
    const data = await pdfParse(buffer);
    const cleanedText = (data.text || '')
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .trim();

    if (!cleanedText || cleanedText.length < 20) {
      throw new Error('Could not extract readable text from PDF. The document may be an image scan or password protected.');
    }

    return cleanedText;
  } catch (error) {
    console.error('Error parsing PDF buffer:', error);
    throw new Error(`PDF Parsing Failed: ${error.message}`);
  }
}
