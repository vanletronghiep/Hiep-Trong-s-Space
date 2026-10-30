export const MOTION_EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];
export const MOTION_EASE_IN: [number, number, number, number] = [0.5, 0, 0.9, 0.4];

export const MOTION_DURATION = {
  instant: 0.1,
  fast: 0.15,
  popoverClose: 0.17,
  drawerClose: 0.18,
  popoverOpen: 0.22,
  base: 0.25,
  layout: 0.28,
  slow: 0.4,
  reveal: 0.7,
  hero: 0.9,
} as const;

export function getBlurFadeVariants(reducedMotion: boolean) {
  if (reducedMotion) {
    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration: MOTION_DURATION.fast },
      },
    };
  }

  return {
    hidden: {
      opacity: 0,
      y: 12,
      filter: 'blur(4px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: MOTION_DURATION.reveal,
        ease: MOTION_EASE,
      },
    },
  };
}
