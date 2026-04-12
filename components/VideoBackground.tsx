const VIDEO_SRC =
  'https://coreprojects.blob.core.windows.net/spetsyian/web/media/video/clouds-and-night-background.mp4'

export default function VideoBackground() {
  return (
    <div className="video-layer" aria-hidden>
      <div className="video-column">
        <video autoPlay muted loop playsInline preload="auto">
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      </div>
      <div className="video-overlay" />
    </div>
  )
}
