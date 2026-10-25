// Frontend validation gives fast feedback. The backend re-validates everything.
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
const PHONE_RE = /^[+\d][\d\s().-]{5,24}$/;
export const MAX_CV_BYTES = 5 * 1024 * 1024;

const isUrl = (v) => {
  try {
    const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    return ['http:', 'https:'].includes(u.protocol) && u.hostname.includes('.');
  } catch {
    return false;
  }
};

function len(value, label, min, max) {
  const v = value.trim();
  if (!v) return `${label} is required.`;
  if (v.length < min) return `${label} must be at least ${min} characters.`;
  if (v.length > max) return `${label} must be ${max} characters or fewer.`;
  return null;
}

export function validateContact(v) {
  const e = {};
  const set = (k, msg) => msg && (e[k] = msg);
  set('name', len(v.name, 'Full name', 2, 100));
  if (!v.email.trim()) e.email = 'Email address is required.';
  else if (!EMAIL_RE.test(v.email.trim())) e.email = 'Enter a valid email address.';
  if (!v.service) e.service = 'Choose a service type.';
  set('subject', len(v.subject, 'Project subject', 3, 150));
  set('message', len(v.message, 'Project description', 20, 5000));
  return e;
}

export function validateApplication(v, file) {
  const e = {};
  const set = (k, msg) => msg && (e[k] = msg);
  set('name', len(v.name, 'Full name', 2, 100));
  if (!v.email.trim()) e.email = 'Email address is required.';
  else if (!EMAIL_RE.test(v.email.trim())) e.email = 'Enter a valid email address.';
  if (v.phone.trim() && !PHONE_RE.test(v.phone.trim())) e.phone = 'Enter a valid phone number.';
  set('skills', len(v.skills, 'Relevant skills', 2, 600));
  set('experience', len(v.experience, 'Experience summary', 10, 1500));
  set('coverLetter', len(v.coverLetter, 'Cover letter', 30, 4000));
  if (v.portfolioUrl.trim() && !isUrl(v.portfolioUrl.trim())) e.portfolioUrl = 'Enter a valid web address.';
  if (v.profileUrl.trim() && !isUrl(v.profileUrl.trim())) e.profileUrl = 'Enter a valid web address.';
  if (!file) e.cv = 'Attach your CV as a PDF.';
  else if (!/\.pdf$/i.test(file.name) || (file.type && file.type !== 'application/pdf')) e.cv = 'Only PDF files are accepted.';
  else if (file.size > MAX_CV_BYTES) e.cv = 'Your CV is larger than 5 MB. Please upload a smaller PDF.';
  return e;
}
