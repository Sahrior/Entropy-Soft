import Button from './Button.jsx';

export default function JobCard({ job, onApply }) {
  return (
    <article className="job-card">
      <h3>{job.title}</h3>
      <dl className="job-card__meta">
        <div><dt>Employment</dt><dd>{job.employmentType}</dd></div>
        <div><dt>Work arrangement</dt><dd>{job.arrangement}</dd></div>
      </dl>
      <p>{job.description}</p>

      <h4>Required skills</h4>
      <ul className="chips">{job.skills.map((s) => <li key={s}>{s}</li>)}</ul>

      <details>
        <summary>Responsibilities and preferred qualifications<span className="sr-only"> for {job.title}</span></summary>
        <h4>Responsibilities</h4>
        <ul className="bullets">{job.responsibilities.map((r) => <li key={r}>{r}</li>)}</ul>
        {job.preferred?.length > 0 && (
          <>
            <h4>Preferred</h4>
            <ul className="bullets">{job.preferred.map((p) => <li key={p}>{p}</li>)}</ul>
          </>
        )}
      </details>

      <Button onClick={(e) => onApply(job, e)} aria-label={`Apply now for ${job.title}`}>Apply Now</Button>
    </article>
  );
}
