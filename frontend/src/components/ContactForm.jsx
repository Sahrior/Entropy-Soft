import { useState } from 'react';
import { Send } from 'lucide-react';
import Field from './Field.jsx';
import Button from './Button.jsx';
import LoadingState from './LoadingState.jsx';
import StatusMessage from './StatusMessage.jsx';
import { SERVICE_OPTIONS, BUDGET_OPTIONS } from '../data/site.js';
import { validateContact } from '../utils/validation.js';
import { submitContact } from '../services/api.js';

const INITIAL = { name: '', email: '', service: '', budget: '', subject: '', message: '', company_website: '' };

export default function ContactForm() {
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [message, setMessage] = useState('');

  const submitting = status === 'submitting';
  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    if (submitting) return; // blocks repeat submissions while a request is running

    const found = validateContact(values);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      setStatus('idle');
      setMessage('');
      document.getElementById(`contact-${first}`)?.focus();
      return;
    }

    setStatus('submitting');
    setMessage('');
    try {
      const res = await submitContact(values);
      setStatus('success');
      setMessage(res.message);
      setValues(INITIAL);
    } catch (err) {
      setStatus('error');
      setMessage(err.message);
      if (err.fieldErrors) setErrors(err.fieldErrors);
    }
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate aria-busy={submitting}>
      {/* Honeypot: hidden from people and assistive tech, bots tend to fill it. */}
      <div className="hp" aria-hidden="true">
        <label>Leave this field empty
          <input type="text" name="company_website" tabIndex={-1} autoComplete="off" value={values.company_website} onChange={onChange} />
        </label>
      </div>

      <div className="form__grid">
        <Field id="contact-name" name="name" label="Full name" required autoComplete="name" value={values.name} onChange={onChange} error={errors.name} />
        <Field id="contact-email" name="email" type="email" label="Email address" required autoComplete="email" value={values.email} onChange={onChange} error={errors.email} />
        <Field id="contact-service" name="service" as="select" label="Project or service type" required value={values.service} onChange={onChange} error={errors.service}>
          <option value="">Select a service</option>
          {SERVICE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </Field>
        <Field id="contact-budget" name="budget" as="select" label="Estimated budget" optional value={values.budget} onChange={onChange} error={errors.budget} hint="You don't have to share a budget.">
          <option value="">Prefer not to say</option>
          {BUDGET_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </Field>
      </div>
      <Field id="contact-subject" name="subject" label="Project subject" required maxLength={150} value={values.subject} onChange={onChange} error={errors.subject} />
      <Field id="contact-message" name="message" as="textarea" rows={7} label="Project description" required maxLength={5000} value={values.message} onChange={onChange} error={errors.message}
        hint="What do you want to build, who is it for, and what problem should it solve?" />

      <p className="form__privacy">
        We use your name, email and message only to respond to your inquiry.
      </p>

      <div aria-live="polite">
        <StatusMessage type={status === 'error' ? 'error' : 'success'}>
          {status === 'success' || status === 'error' ? message : ''}
        </StatusMessage>
      </div>

      <Button type="submit" size="lg" disabled={submitting} icon={!submitting && <Send size={18} aria-hidden="true" />}>
        {submitting ? <LoadingState label="Sending…" /> : 'Send message'}
      </Button>
    </form>
  );
}
