import ProjectCard from '../../components/ProjectCard'
import SiteShell from '../../components/SiteShell'
import { PROJECTS } from '../../lib/profile'

export default function ProjectsPage() {
  return (
    <SiteShell
      title="Projects | Slava Saequus"
      description="Products and platforms I've helped build — from AI and fintech to travel and healthcare."
    >
      <header className="links-page-intro">
        <h1>Projects</h1>
        <p className="meta">Last updated: June 2026</p>
        <p>
          A selection of companies and products I&apos;ve contributed to — and
          many others along the way.
        </p>
      </header>

      <div className="project-grid">
        {PROJECTS.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </div>
    </SiteShell>
  )
}