import SiteShell from '../../components/SiteShell'
import { EDUCATION, PROFILE, SKILL_GROUPS, WORK_HISTORY } from '../../lib/profile'
import { breadcrumbSchema } from '../../lib/schema'

export default function WorkPage() {
  return (
    <SiteShell
      title="Experience & Skills — Viachaslau Spetsyian, AI Engineer"
      description="Experience of Viachaslau Spetsyian: AI Engineer at Serpentaria Capital, Senior Software Engineer at Razor Labs and ZAGENO. Skills in LLMs, RAG, LLMOps."
      path="/work/"
      jsonLd={[
        breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Experience', path: '/work/' },
        ]),
      ]}
    >
      <header className="links-page-intro">
        <h1>Experience &amp; skills</h1>
        <p className="meta">Last updated: November 2026</p>
        <p>
          {PROFILE.title} based in {PROFILE.location}. I build LLM applications — agents, RAG and
          evaluation pipelines — on top of production Python backends, ML model serving and cloud
          infrastructure, and I have led engineering teams. Languages: {PROFILE.languages.join(', ')}.
        </p>
        <p>
          <a href={PROFILE.linkedIn} target="_blank" rel="noopener noreferrer">
            Full profile on LinkedIn
          </a>
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
              <p className="work-entry-meta">
                <time dateTime={entry.start}>{entry.period.split(' — ')[0]}</time> —{' '}
                {entry.end ? <time dateTime={entry.end}>{entry.period.split(' — ')[1]}</time> : 'Present'}
              </p>
            </div>
            <p className="work-entry-role">{entry.role}</p>
            {entry.stack ? <p className="work-entry-stack">{entry.stack}</p> : null}
            <p>{entry.summary}</p>
            {entry.ventures?.length ? (
              <div className="work-ventures">
                <h3>Projects</h3>
                <ul className="work-ventures-list">
                  {entry.ventures.map((venture) => (
                    <li key={venture.name} className="work-venture-item">
                      <a href={venture.href} target="_blank" rel="noopener noreferrer">
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
        <h2>Skills</h2>
        <dl className="skill-groups">
          {SKILL_GROUPS.map((group) => (
            <div key={group.label} className="skill-group">
              <dt>{group.label}</dt>
              <dd>
                <ul className="skill-list">
                  {group.items.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </article>

      <article className="liquid-glass liquid-glass--tint glass-block">
        <h2>Education</h2>
        <p className="work-entry-role">{EDUCATION.degree}</p>
        <p className="work-entry-meta">
          {EDUCATION.school}, {EDUCATION.department} · {EDUCATION.period} · {EDUCATION.note}
        </p>
      </article>
    </SiteShell>
  )
}
