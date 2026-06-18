import SiteShell from '../../components/SiteShell'
import { EDUCATION, PROFILE, SKILLS, WORK_HISTORY } from '../../lib/profile'

export default function WorkPage() {
  return (
    <SiteShell
      title="Work | Slava Saequus"
      description="Experience across AI platforms, fintech, life-science marketplaces, and travel tech."
    >
      <header className="links-page-intro">
        <h1>Work</h1>
        <p className="meta">Last updated: June 2026</p>
        <p>
          {PROFILE.title} based in {PROFILE.location}. Background in full-stack
          engineering, platform integration, and growth — with production
          experience across Python, JavaScript, cloud, and Kubernetes.
        </p>
      </header>

      <div className="work-timeline">
        {WORK_HISTORY.map((entry) => (
          <article
            key={`${entry.company}-${entry.period}`}
            className="liquid-glass liquid-glass--tint glass-block work-entry"
          >
            <div className="work-entry-header">
              <h2>
                {entry.href ? (
                  <a href={entry.href} target="_blank" rel="noopener noreferrer">
                    {entry.company}
                  </a>
                ) : (
                  entry.company
                )}
              </h2>
              <p className="work-entry-meta">{entry.period}</p>
            </div>
            <p className="work-entry-role">{entry.role}</p>
            {entry.stack ? (
              <p className="work-entry-stack">{entry.stack}</p>
            ) : null}
            <p>{entry.summary}</p>
            {entry.ventures?.length ? (
              <div className="work-ventures">
                <h3>Projects</h3>
                <ul className="work-ventures-list">
                  {entry.ventures.map((venture) => (
                    <li key={venture.name} className="work-venture-item">
                      <a
                        href={venture.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {venture.name}
                      </a>
                      <p>{venture.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <article className="liquid-glass liquid-glass--tint glass-block">
        <h2>Education</h2>
        <p className="work-entry-role">{EDUCATION.degree}</p>
        <p className="work-entry-meta">
          {EDUCATION.school} · {EDUCATION.period} · {EDUCATION.note}
        </p>
      </article>

      <article className="liquid-glass liquid-glass--tint glass-block">
        <h2>Skills</h2>
        <ul className="skill-list">
          {SKILLS.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </article>
    </SiteShell>
  )
}