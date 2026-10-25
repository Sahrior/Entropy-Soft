import multer from 'multer';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const MAX_CV_BYTES = 5 * 1024 * 1024; // 5 MB

// Private temp folder. Files get random server-generated names, so the
// applicant-supplied filename never touches the filesystem (no path traversal).
const UPLOAD_DIR = path.join(os.tmpdir(), 'entropysoft-cv-uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true, mode: 0o700 });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}.pdf`),
});

function fileFilter(req, file, cb) {
  const extOk = path.extname(file.originalname || '').toLowerCase() === '.pdf';
  const mimeOk = file.mimetype === 'application/pdf';
  if (extOk && mimeOk) return cb(null, true);
  const err = new Error('Only PDF files are accepted.');
  err.code = 'INVALID_FILE_TYPE';
  return cb(err);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_CV_BYTES, files: 1, fields: 20, fieldSize: 20 * 1024, parts: 25 },
});

/**
 * Checks the real file contents, not just the declared type:
 * PDF header, PDF trailer, and a rough scan for auto-run / launch actions.
 * (A heuristic, not a malware scanner. The CV is only ever emailed as an attachment.)
 */
export async function verifyPdf(filePath) {
  const buf = await fs.promises.readFile(filePath);
  if (buf.length < 100) return { ok: false, reason: 'The CV file looks empty or damaged.' };
  if (buf.subarray(0, 5).toString('latin1') !== '%PDF-') {
    return { ok: false, reason: 'The uploaded file is not a valid PDF.' };
  }
  const tail = buf.subarray(Math.max(0, buf.length - 2048)).toString('latin1');
  if (!tail.includes('%%EOF')) {
    return { ok: false, reason: 'The PDF appears to be incomplete or damaged.' };
  }
  const text = buf.toString('latin1');
  if (/\/(Launch|JavaScript|JS)\b/.test(text) || /\/OpenAction\b/.test(text)) {
    return { ok: false, reason: 'PDFs with embedded scripts or auto-run actions are not accepted. Please export a plain PDF.' };
  }
  return { ok: true };
}
