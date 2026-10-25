import { MessageCircle, Mail } from 'lucide-react';
import ContactForm from '../components/ContactForm.jsx';
import Button from '../components/Button.jsx';
import { SITE, whatsappUrl } from '../data/site.js';

export default function Contact() {
  return (
    <>
      <section className="page-hero" aria-labelledby="contact-title">
        <div className="container">
          <h1 id="contact-title">Let's Talk About Your Project.</h1>
          <p>
            Tell us about your idea, your goals, or the problem you're trying to solve. We'll review your message and
            get back to you.
          </p>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container contact-layout">
          <div className="panel">
            <ContactForm />
          </div>

          <aside className="contact-aside" aria-label="Other ways to reach us">
            <div className="whatsapp-card">
              <h2>Prefer WhatsApp? Let's Talk.</h2>
              <p>Send us a quick message and we'll continue the conversation there.</p>
              <Button href={whatsappUrl()} external icon={<MessageCircle size={18} aria-hidden="true" />}>
                Chat on WhatsApp<span className="sr-only"> (opens in a new tab)</span>
              </Button>
            </div>
            <div className="aside-card">
              <h2>Email</h2>
              <p><a href={`mailto:${SITE.email}`}><Mail size={16} aria-hidden="true" /> {SITE.email}</a></p>
            </div>
            <div className="aside-card">
              <h2>What happens next</h2>
              <p>We read every message, ask follow-up questions if we need them, and reply by email. Sharing a budget is optional.</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
