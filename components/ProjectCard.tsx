import type { ProjectEntry } from '../lib/profile'

type Props = {
  project: ProjectEntry
}

function imageStem(image: string): string {
  return image.replace(/\.(png|webp|jpe?g)$/i, '')
}

function fallbackSrc(image: string): string {
  if (/\.(png|webp|jpe?g)$/i.test(image)) return image
  return `${image}.webp`
}

export default function ProjectCard({ project }: Props) {
  const isExternal = project.image.startsWith('http')

  let imageContent

  if (isExternal) {
    imageContent = (
      <img
        src={project.image}
        alt={`${project.name} preview`}
        className="project-card-image"
        width={1280}
        height={720}
        loading="lazy"
        decoding="async"
      />
    )
  } else {
    const stem = imageStem(project.image)
    const src640 = `${stem}-640.webp`
    const src1280 = `${stem}-1280.webp`

    imageContent = (
      <picture>
        <source
          type="image/webp"
          srcSet={`${src640} 640w, ${src1280} 1280w`}
          sizes="(min-width: 768px) 50vw, 100vw"
        />
        <img
          src={fallbackSrc(project.image)}
          alt={`${project.name} preview`}
          className="project-card-image"
          width={1280}
          height={720}
          loading="lazy"
          decoding="async"
        />
      </picture>
    )
  }

  return (
    <a
      href={project.href}
      className="project-card"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="project-card-image-wrap">
        {imageContent}
        <div className="project-card-overlay" aria-hidden />
      </div>
      <div className="project-card-body">
        <h2>{project.name}</h2>
        <p>{project.description}</p>
      </div>
    </a>
  )
}