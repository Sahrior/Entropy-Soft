import { validateContact, clean } from '../utils/validators.js';
import { sendContactEmail } from '../services/emailService.js';

export async function submitContact(req, res) {
  const body = req.body || {};

  // Honeypot: real visitors never see or fill this field. Bots get a quiet "ok" and nothing is sent.
  if (clean(body.company_website)) {
    return res.json({ success: true, message: 'Your submission has been received.' });
  }

  const { values, errors } = validateContact(body);
  if (Object.keys(errors).length) {
    return res.status(400).json({ success: false, message: 'Please fix the highlighted fields.', errors });
  }

  try {
    await sendContactEmail(values);
    return res.json({
      success: true,
      message: "Thanks! Your message has been received. We'll review it and get back to you.",
    });
  } catch (err) {
    console.error('[contact] email failed:', err.code || err.name);
    return res
      .status(502)
      .json({ success: false, message: 'We could not send your submission. Please try again later.' });
  }
}
