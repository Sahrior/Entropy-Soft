/** Labelled form control with hint and error text wired up for screen readers. */
export default function Field({ id, label, required, optional, error, hint, as: Tag = 'input', inputRef, children, ...props }) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id} className="field__label">
        {label}
        {required && <span className="field__req" aria-hidden="true"> *</span>}
        {optional && <span className="field__opt"> (optional)</span>}
      </label>
      <Tag
        id={id}
        ref={inputRef}
        className="field__control"
        aria-required={required || undefined}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        {...props}
      >
        {children}
      </Tag>
      {hint && <p id={`${id}-hint`} className="field__hint">{hint}</p>}
      {error && <p id={`${id}-error`} className="field__error">{error}</p>}
    </div>
  );
}
