import { ExternalLink, Github, FolderCode } from 'lucide-react';

export default function ProjectCard({ name, category, description, technologies = [], image, imageAlt, liveUrl, repoUrl }) {
  return (
    <article className="project-card">
      <div className="project-card__media">
        {image ? (
          <img src={image} alt={imageAlt || `Screenshot of ${name}`} loading="lazy" />
        ) : (
          <span className="project-card__placeholder"><FolderCode size={36} aria-hidden="true" /></span>
        )}
      </div>
      <div className="project-card__body">
        <p className="project-card__category">{category}</p>
        <h3>{name}</h3>
        <p>{description}</p>
        {technologies.length > 0 && (
          <ul className="chips" aria-label="Technologies used">
            {technologies.map((t) => <li key={t}>{t}</li>)}
          </ul>
        )}
        {(liveUrl || repoUrl) && (
          <div className="project-card__links">
            {liveUrl && (
              <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} aria-hidden="true" /> Live demo<span className="sr-only"> of {name}</span>
              </a>
            )}
            {repoUrl && (
              <a href={repoUrl} target="_blank" rel="noopener noreferrer">
                <Github size={16} aria-hidden="true" /> Source code<span className="sr-only"> of {name}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
