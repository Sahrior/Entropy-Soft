import { Link } from 'react-router-dom';
import { Mail, MessageCircle } from 'lucide-react';
import Logo from './Logo.jsx';
import { SITE, SOCIAL_LINKS, whatsappUrl } from '../data/site.js';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo />
          <p>
            A software development startup founded by two friends. We build websites, web applications and custom
            software, with a focus on clean code and clear communication.
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="footer__title">Pages</h2>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/careers">Careers</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="footer__title">Get in touch</h2>
          <ul>
            <li>
              <a href={`mailto:${SITE.email}`}><Mail size={16} aria-hidden="true" /> {SITE.email}</a>
            </li>
            <li>
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={16} aria-hidden="true" /> WhatsApp
              </a>
            </li>
            {SOCIAL_LINKS.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container footer__bottom">
        <p>© 2026 Entropy Soft. All rights reserved.</p>
      </div>
    </footer>
  );
}
