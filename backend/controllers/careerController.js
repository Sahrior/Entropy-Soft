import fs from 'node:fs';
import { validateApplication, clean } from '../utils/validators.js';
import { verifyPdf } from '../middleware/uploadMiddleware.js';
import { sendApplicationEmail } from '../services/emailService.js';

export async function submitApplication(req, res) {
  const file = req.file;
  try {
    const body = req.body || {};

    if (clean(body.company_website)) {
      return res.json({ success: true, message: 'Your application has been received.' });
    }

    const { values, errors } = validateApplication(body);
    if (!file) {
      errors.cv = 'Please attach your CV as a PDF.';
    } else {
      const check = await verifyPdf(file.path);
      if (!check.ok) errors.cv = check.reason;
    }
    if (Object.keys(errors).length) {
      return res.status(400).json({ success: false, message: 'Please fix the highlighted fields.', errors });
    }

    await sendApplicationEmail(values, file);
    return res.json({
      success: true,
      message: 'Thank you for applying. Your application has been received and we will review it.',
    });
  } catch (err) {
    console.error('[careers] application failed:', err.code || err.name);
    return res
      .status(502)
      .json({ success: false, message: 'We could not send your application. Please try again later.' });
  } finally {
    // Always remove the temporary CV: success, validation failure or email failure.
    if (file) await fs.promises.unlink(file.path).catch(() => {});
  }
}
