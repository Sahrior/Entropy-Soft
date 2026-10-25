import { useCallback, useState } from 'react';
import JobCard from '../components/JobCard.jsx';
import ApplicationModal from '../components/ApplicationModal.jsx';
import Button from '../components/Button.jsx';
import { JOBS, GENERAL_APPLICATION } from '../data/jobs.js';

export default function Careers() {
  const [activeTitle, setActiveTitle] = useState(null);
  const close = useCallback(() => setActiveTitle(null), []);

  return (
    <>
      <section className="page-hero" aria-labelledby="careers-title">
        <div className="container">
          <h1 id="careers-title">Build What's Next With Entropy Soft.</h1>
          <p>
            We're interested in connecting with talented, motivated people who enjoy solving problems, learning new
            technologies, and building useful software.
          </p>
        </div>
      </section>

      <section className="section section--tight" aria-labelledby="roles-title">
        <div className="container">
          <h2 id="roles-title" className="careers__title">Roles we're interested in</h2>
          <p className="careers__note">
            These are example positions that show the kind of people we'd like to meet. Employment terms are still
            to be confirmed, and applying doesn't guarantee a role.
          </p>
          <div className="job-grid">
            {JOBS.map((job) => (
              <JobCard key={job.id} job={job} onApply={(j) => setActiveTitle(j.title)} />
            ))}
          </div>

          <div className="general-apply">
            <div>
              <h3>Don't see your role?</h3>
              <p>Tell us how you'd like to contribute and attach your CV.</p>
            </div>
            <Button variant="secondary" onClick={() => setActiveTitle(GENERAL_APPLICATION.title)}>
              Send a general application
            </Button>
          </div>
        </div>
      </section>

      {activeTitle && <ApplicationModal title={activeTitle} onClose={close} />}
    </>
  );
}
