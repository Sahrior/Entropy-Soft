export default function ProcessStep({ number, title, text }) {
  return (
    <li className="process-step">
      <span className="process-step__num" aria-hidden="true">{number}</span>
      <h3><span className="sr-only">Step {Number(number)}: </span>{title}</h3>
      <p>{text}</p>
    </li>
  );
}
