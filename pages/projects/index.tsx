import ProjectCard from '../../components/ProjectCard'
import SiteShell from '../../components/SiteShell'
import { PROJECTS } from '../../lib/profile'
import { breadcrumbSchema } from '../../lib/schema'

export default function ProjectsPage() {
  return (
    <SiteShell
      title="Projects — Viachaslau Spetsyian, AI Engineer"
      description="Products and platforms Viachaslau Spetsyian has built or contributed to — AI ventures at Serpentaria Capital, ZAGENO, Zenhotels and more."
      path="/projects/"
      jsonLd={[
        breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Projects', path: '/projects/' },
        ]),
      ]}
    >
      <header className="links-page-intro">
        <h1>Projects</h1>
        <p className="meta">Last updated: November 2026</p>
        <p>
          A selection of companies and products I&apos;ve contributed to — and
          many others along the way.
        </p>
      </header>

      <div className="card-grid">
        {PROJECTS.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </div>
    </SiteShell>
  )
}