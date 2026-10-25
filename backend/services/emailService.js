import nodemailer from 'nodemailer';

let transporter;

const receiver = () => process.env.CONTACT_RECEIVER || 'entropysoft101@gmail.com';

function getTransporter() {
  if (transporter) return transporter;
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_APP_PASSWORD } = process.env;
  if (!EMAIL_USER || !EMAIL_APP_PASSWORD) {
    const err = new Error('Email credentials are not configured.');
    err.code = 'EMAIL_NOT_CONFIGURED';
    throw err;
  }
  const port = Number(EMAIL_PORT) || 465;
  transporter = nodemailer.createTransport({
    host: EMAIL_HOST || 'smtp.gmail.com',
    port,
    secure: EMAIL_SECURE ? EMAIL_SECURE === 'true' : port === 465,
    // Google displays app passwords in groups separated by spaces; strip them.
    auth: { user: EMAIL_USER, pass: EMAIL_APP_PASSWORD.replace(/\s+/g, '') },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 30_000,
  });
  return transporter;
}

/** Logs whether the SMTP login works at startup. Never logs credentials. */
export async function verifyEmailTransport() {
  try {
    await getTransporter().verify();
    console.log('Email transport verified.');
  } catch (err) {
    console.error('Email transport NOT ready:', err.code || err.message);
  }
}

async function deliver(mail) {
  const to = receiver();
  const info = await getTransporter().sendMail({
    from: `"Entropy Soft Website" <${process.env.EMAIL_USER}>`,
    to,
    ...mail,
  });
  // Report success only when the mail server explicitly accepted the recipient.
  const accepted = (info.accepted || []).map((a) => String(a).toLowerCase());
  if (!accepted.includes(to.toLowerCase())) {
    const err = new Error('Recipient was not accepted by the mail server.');
    err.code = 'RECIPIENT_REJECTED';
    throw err;
  }
  return info;
}

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const nl2br = (s) => esc(s).replace(/\n/g, '<br>');

function renderHtml({ heading, rows, blocks }) {
  const rowHtml = rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) => `<tr>
        <td style="padding:8px 16px 8px 0;color:#64748b;font-size:13px;vertical-align:top;white-space:nowrap">${esc(k)}</td>
        <td style="padding:8px 0;color:#0f172a;font-size:15px">${v.html ?? esc(v)}</td></tr>`
    )
    .join('');
  const blockHtml = blocks
    .filter(([, v]) => v)
    .map(
      ([k, v]) => `<h3 style="margin:24px 0 8px;font-size:14px;color:#334155">${esc(k)}</h3>
      <div style="padding:14px 16px;background:#f1f5f9;border-radius:8px;font-size:15px;line-height:1.6;color:#0f172a">${nl2br(v)}</div>`
    )
    .join('');
  return `<!doctype html><html><body style="margin:0;background:#e8edf5;padding:24px;font-family:Segoe UI,Arial,sans-serif">
  <div style="max-width:620px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden">
    <div style="background:#060a13;padding:20px 28px;color:#eaf0fa;font-size:18px;font-weight:600">Entropy Soft</div>
    <div style="padding:28px">
      <h2 style="margin:0 0 16px;font-size:20px;color:#0f172a">${esc(heading)}</h2>
      <table style="border-collapse:collapse;width:100%">${rowHtml}</table>${blockHtml}
    </div></div></body></html>`;
}

function renderText({ heading, rows, blocks }) {
  const r = rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v.text ?? v}`).join('\n');
  const b = blocks.filter(([, v]) => v).map(([k, v]) => `\n${k}\n${'-'.repeat(k.length)}\n${v}`).join('\n');
  return `${heading}\n\n${r}\n${b}\n`;
}

export async function sendContactEmail(v) {
  const content = {
    heading: 'New project inquiry',
    rows: [
      ['Name', v.name],
      ['Email', { html: `<a href="mailto:${esc(v.email)}">${esc(v.email)}</a>`, text: v.email }],
      ['Service', v.service],
      ['Budget', v.budget || 'Not provided'],
      ['Subject', v.subject],
    ],
    blocks: [['Project description', v.message]],
  };
  return deliver({
    replyTo: { name: v.name, address: v.email },
    subject: `[Entropy Soft] New Project Inquiry — ${v.subject}`,
    text: renderText(content),
    html: renderHtml(content),
  });
}

export async function sendApplicationEmail(v, file) {
  const link = (url) => (url ? { html: `<a href="${esc(url)}">${esc(url)}</a>`, text: url } : null);
  const content = {
    heading: `New application: ${v.position}`,
    rows: [
      ['Position', v.position],
      ['Name', v.name],
      ['Email', { html: `<a href="mailto:${esc(v.email)}">${esc(v.email)}</a>`, text: v.email }],
      ['Phone', v.phone],
      ['Portfolio', link(v.portfolioUrl)],
      ['GitHub / LinkedIn', link(v.profileUrl)],
    ],
    blocks: [
      ['Relevant skills', v.skills],
      ['Experience', v.experience],
      ['Cover letter', v.coverLetter],
    ],
  };
  const safeName = v.name.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'Applicant';
  return deliver({
    replyTo: { name: v.name, address: v.email },
    subject: `[Entropy Soft Careers] Application — ${v.position} — ${v.name}`,
    text: renderText(content),
    html: renderHtml(content),
    attachments: [{ filename: `CV_${safeName}.pdf`, path: file.path, contentType: 'application/pdf' }],
  });
}
