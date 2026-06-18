import { useEffect, useState } from 'react'

const VIDEO_SRC =
  'https://coreprojects.blob.core.windows.net/spetsyian/web/media/video/clouds-and-night-background.mp4'

function shouldSkipVideo(): boolean {
  if (typeof window === 'undefined') return true
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true

  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string }
    }
  ).connection

  if (connection?.saveData) return true
  if (connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') {
    return true
  }

  return false
}

function scheduleVideoLoad(onReady: () => void) {
  if (typeof window === 'undefined') return

  const run = () => {
    if (shouldSkipVideo()) return
    onReady()
  }

  const idle = (
    window as Window & {
      requestIdleCallback?: (
        cb: () => void,
        opts?: { timeout: number }
      ) => number
    }
  ).requestIdleCallback

  if (idle) {
    idle(run, { timeout: 3500 })
    return
  }

  setTimeout(run, 2000)
}

export default function VideoBackground() {
  const [loadVideo, setLoadVideo] = useState(false)

  useEffect(() => {
    scheduleVideoLoad(() => setLoadVideo(true))
  }, [])

  return (
    <div className="video-layer" aria-hidden>
      <div className="video-column">
        {loadVideo ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            disablePictureInPicture
            disableRemotePlayback
          >
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>
        ) : null}
      </div>
      <div className="video-overlay" />
    </div>
  )
}