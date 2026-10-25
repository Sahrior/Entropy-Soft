// Server-side validation and sanitisation. Never trust the frontend.

export const SERVICE_OPTIONS = [
  'Website Development',
  'Web Application',
  'Custom Software',
  'UI/UX Design',
  'Frontend Development',
  'Backend / API Development',
  'Other',
];

export const BUDGET_OPTIONS = [
  'Under $500',
  '$500 – $1,000',
  '$1,000 – $3,000',
  '$3,000 – $10,000',
  '$10,000+',
  'Not sure yet',
];

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Strips control characters. Single-line values also lose every line break (prevents header injection). */
export function clean(value, { multiline = false } = {}) {
  if (typeof value !== 'string') return '';
  let s = value.normalize('NFC').replace(CONTROL_CHARS, '');
  s = multiline
    ? s.replace(/\r\n?|\u2028|\u2029/g, '\n').replace(/\n{4,}/g, '\n\n\n')
    : s.replace(/[\r\n\t\u2028\u2029]+/g, ' ').replace(/ {2,}/g, ' ');
  return s.trim();
}

// Names also lose characters that could confuse address headers.
const cleanName = (v) => clean(v).replace(/[<>"\\]/g, '');

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
const isEmail = (v) => v.length <= 254 && EMAIL_RE.test(v);
const PHONE_RE = /^[+\d][\d\s().-]{5,24}$/;

/** Returns a normalised http(s) URL or null. Adds https:// when the scheme is missing. */
function normaliseUrl(v) {
  if (!v || v.length > 300) return null;
  const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const u = new URL(withScheme);
    if (!['http:', 'https:'].includes(u.protocol) || !u.hostname.includes('.')) return null;
    return u.toString();
  } catch {
    return null;
  }
}

function lengthError(value, label, min, max) {
  if (!value) return `${label} is required.`;
  if (value.length < min) return `${label} must be at least ${min} characters.`;
  if (value.length > max) return `${label} must be ${max} characters or fewer.`;
  return null;
}

export function validateContact(body = {}) {
  const values = {
    name: cleanName(body.name),
    email: clean(body.email).toLowerCase(),
    service: clean(body.service),
    budget: clean(body.budget),
    subject: clean(body.subject),
    message: clean(body.message, { multiline: true }),
  };
  const errors = {};

  const nameErr = lengthError(values.name, 'Full name', 2, 100);
  if (nameErr) errors.name = nameErr;
  if (!values.email) errors.email = 'Email address is required.';
  else if (!isEmail(values.email)) errors.email = 'Enter a valid email address.';
  if (!SERVICE_OPTIONS.includes(values.service)) errors.service = 'Choose a service type.';
  if (values.budget && !BUDGET_OPTIONS.includes(values.budget)) errors.budget = 'Choose a valid budget range.';
  const subjectErr = lengthError(values.subject, 'Project subject', 3, 150);
  if (subjectErr) errors.subject = subjectErr;
  const messageErr = lengthError(values.message, 'Project description', 20, 5000);
  if (messageErr) errors.message = messageErr;

  return { values, errors };
}

export function validateApplication(body = {}) {
  const values = {
    name: cleanName(body.name),
    email: clean(body.email).toLowerCase(),
    phone: clean(body.phone),
    position: clean(body.position),
    skills: clean(body.skills, { multiline: true }),
    experience: clean(body.experience, { multiline: true }),
    portfolioUrl: clean(body.portfolioUrl),
    profileUrl: clean(body.profileUrl),
    coverLetter: clean(body.coverLetter, { multiline: true }),
  };
  const errors = {};

  const nameErr = lengthError(values.name, 'Full name', 2, 100);
  if (nameErr) errors.name = nameErr;
  if (!values.email) errors.email = 'Email address is required.';
  else if (!isEmail(values.email)) errors.email = 'Enter a valid email address.';
  if (values.phone && !PHONE_RE.test(values.phone)) errors.phone = 'Enter a valid phone number.';
  const posErr = lengthError(values.position, 'Position', 2, 120);
  if (posErr) errors.position = posErr;
  const skillsErr = lengthError(values.skills, 'Relevant skills', 2, 600);
  if (skillsErr) errors.skills = skillsErr;
  const expErr = lengthError(values.experience, 'Experience summary', 10, 1500);
  if (expErr) errors.experience = expErr;
  const coverErr = lengthError(values.coverLetter, 'Cover letter', 30, 4000);
  if (coverErr) errors.coverLetter = coverErr;

  for (const [key, label] of [['portfolioUrl', 'Portfolio URL'], ['profileUrl', 'GitHub or LinkedIn URL']]) {
    if (values[key]) {
      const normalised = normaliseUrl(values[key]);
      if (!normalised) errors[key] = `${label} must be a valid web address.`;
      else values[key] = normalised;
    }
  }

  return { values, errors };
}
