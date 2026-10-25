export default function SectionHeading({ id, title, description, align = 'left' }) {
  return (
    <div className={`section-heading section-heading--${align}`}>
      <h2 id={id}>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
