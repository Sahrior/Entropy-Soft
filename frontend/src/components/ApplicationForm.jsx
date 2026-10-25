import { useRef, useState } from 'react';
import { Send } from 'lucide-react';
import Field from './Field.jsx';
import Button from './Button.jsx';
import LoadingState from './LoadingState.jsx';
import StatusMessage from './StatusMessage.jsx';
import { validateApplication } from '../utils/validation.js';
import { submitApplication } from '../services/api.js';

const initial = (position) => ({
  name: '', email: '', phone: '', position, skills: '', experience: '',
  portfolioUrl: '', profileUrl: '', coverLetter: '', company_website: '',
});

const formatSize = (b) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

/** onSuccess(message) is called only after the backend confirms the email was accepted. */
export default function ApplicationForm({ position, onSuccess }) {
  const [values, setValues] = useState(() => initial(position));
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const fileRef = useRef(null);
  const submitting = status === 'submitting';

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };
  const onFile = (e) => {
    setFile(e.target.files?.[0] || null);
    if (errors.cv) setErrors((er) => ({ ...er, cv: undefined }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    const found = validateApplication(values, file);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      setStatus('idle');
      setMessage('');
      document.getElementById(`apply-${first}`)?.focus();
      return;
    }

    const data = new FormData();
    Object.entries(values).forEach(([k, v]) => data.append(k, v));
    data.append('cv', file);

    setStatus('submitting');
    setMessage('');
    try {
      const res = await submitApplication(data);
      onSuccess(res.message);
    } catch (err) {
      setStatus('error');
      setMessage(err.message);
      if (err.fieldErrors) setErrors(err.fieldErrors);
      if (err.fieldErrors?.cv) {
        setFile(null);
        if (fileRef.current) fileRef.current.value = '';
      }
    }
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate aria-busy={submitting}>
      <div className="hp" aria-hidden="true">
        <label>Leave this field empty
          <input type="text" name="company_website" tabIndex={-1} autoComplete="off" value={values.company_website} onChange={onChange} />
        </label>
      </div>

      <Field id="apply-position" name="position" label="Position applied for" required readOnly value={values.position} error={errors.position} />
      <div className="form__grid">
        <Field id="apply-name" name="name" label="Full name" required autoComplete="name" value={values.name} onChange={onChange} error={errors.name} />
        <Field id="apply-email" name="email" type="email" label="Email address" required autoComplete="email" value={values.email} onChange={onChange} error={errors.email} />
        <Field id="apply-phone" name="phone" type="tel" label="Phone number" optional autoComplete="tel" value={values.phone} onChange={onChange} error={errors.phone} />
        <Field id="apply-portfolioUrl" name="portfolioUrl" type="url" label="Portfolio URL" optional placeholder="https://" value={values.portfolioUrl} onChange={onChange} error={errors.portfolioUrl} />
      </div>
      <Field id="apply-profileUrl" name="profileUrl" type="url" label="GitHub or LinkedIn profile URL" optional placeholder="https://" value={values.profileUrl} onChange={onChange} error={errors.profileUrl} />
      <Field id="apply-skills" name="skills" as="textarea" rows={3} label="Relevant skills" required maxLength={600} value={values.skills} onChange={onChange} error={errors.skills} hint="For example: React, Node.js, Figma, Git." />
      <Field id="apply-experience" name="experience" as="textarea" rows={4} label="Experience summary" required maxLength={1500} value={values.experience} onChange={onChange} error={errors.experience} hint="Your experience level and the work or projects that best show it." />
      <Field id="apply-coverLetter" name="coverLetter" as="textarea" rows={6} label="Cover letter or motivation" required maxLength={4000} value={values.coverLetter} onChange={onChange} error={errors.coverLetter} />
      <Field id="apply-cv" name="cv" type="file" accept="application/pdf,.pdf" label="CV (PDF, up to 5 MB)" required inputRef={fileRef} onChange={onFile} error={errors.cv}
        hint={file ? `Selected: ${file.name} (${formatSize(file.size)})` : 'PDF files only.'} />

      <p className="form__privacy">
        We process your details and CV only to evaluate your application. Your CV is emailed to the team and is not kept on our server.
      </p>

      <div aria-live="polite">
        <StatusMessage type="error">{status === 'error' ? message : ''}</StatusMessage>
      </div>

      <Button type="submit" size="lg" disabled={submitting} icon={!submitting && <Send size={18} aria-hidden="true" />}>
        {submitting ? <LoadingState label="Sending application…" /> : 'Submit application'}
      </Button>
    </form>
  );
}
