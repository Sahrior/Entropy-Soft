import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FaqList({ items }) {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <div className="faq">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div className={`faq__item ${open ? 'is-open' : ''}`} key={item.q}>
            <h3>
              <button
                type="button"
                id={`faq-btn-${i}`}
                aria-expanded={open}
                aria-controls={`faq-panel-${i}`}
                onClick={() => setOpenIndex(open ? -1 : i)}
              >
                <span>{item.q}</span>
                <ChevronDown size={20} aria-hidden="true" />
              </button>
            </h3>
            <div id={`faq-panel-${i}`} role="region" aria-labelledby={`faq-btn-${i}`} hidden={!open}>
              <p>{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
