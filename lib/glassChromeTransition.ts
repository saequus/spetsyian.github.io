export const CHROME_EXPAND_THRESHOLD = 8
export const CHROME_TRANSITION_ZONE_PX = 320
export const CHROME_TRANSITION_END =
  CHROME_EXPAND_THRESHOLD + CHROME_TRANSITION_ZONE_PX
export const DROP_SIZE_PX = 54
export const CHROME_UNFOLD_ANIM_MULTIPLIER = 4

/** 0 = expanded, 1 = collapsed circle. `distance` is px from the anchor edge (top for nav, bottom for footer). */
export function getChromeTransitionProgress(
  distance: number,
  disabled: boolean
): number {
  if (disabled) return 0
  if (distance <= CHROME_EXPAND_THRESHOLD) return 0
  if (distance >= CHROME_TRANSITION_END) return 1
  return (distance - CHROME_EXPAND_THRESHOLD) / CHROME_TRANSITION_ZONE_PX
}

export function getChromeItemHideThreshold(index: number, itemCount: number) {
  return (itemCount - index) / itemCount
}

export function getChromeTransitionDerived(progress: number) {
  const itemHideProgress = Math.min(1, progress * 2)
  const shellCollapseProgress = Math.max(0, progress * 2 - 1)
  const shellExpandProgress = 1 - shellCollapseProgress
  const linkRevealProgress = Math.max(0, 1 - progress * 2)

  return {
    itemHideProgress,
    shellCollapseProgress,
    shellExpandProgress,
    linkRevealProgress,
  }
}

export function getChromeItemTransitionClass(
  index: number,
  itemCount: number,
  progress: number,
  active: boolean
): string {
  if (!active) return ''
  if (progress <= 0) return ''
  if (progress >= 1) return 'is-chrome-item-unfold-hidden'

  const { itemHideProgress, linkRevealProgress } = getChromeTransitionDerived(progress)
  const hideThreshold = getChromeItemHideThreshold(index, itemCount)

  if (itemHideProgress < hideThreshold) {
    if (progress < 0.5) return ''
    return linkRevealProgress >= index / itemCount
      ? 'is-chrome-item-unfold-revealed'
      : 'is-chrome-item-unfold-hidden'
  }

  return 'is-chrome-item-unfold-hidden'
}