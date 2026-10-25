export default function ServiceCard({ icon: Icon, title, description, items }) {
  return (
    <article className="service-card">
      <span className="icon-box"><Icon size={22} aria-hidden="true" /></span>
      <h3>{title}</h3>
      <p>{description}</p>
      <ul>
        {items.map((i) => <li key={i}>{i}</li>)}
      </ul>
    </article>
  );
}
