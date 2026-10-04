/**
 * The Lens Hut - Optical Engine Types & Constants
 * Defines supported product types, prescription methods, and configuration interfaces.
 */

export const PRODUCT_TYPES = {
  EYEGLASSES: 'eyeglasses',
  CONTACT_LENS: 'contact-lens',
  SUNGLASSES: 'sunglasses',
  ACCESSORIES: 'accessories'
};

export const LENS_TYPES = {
  FRAME_ONLY: 'frame-only',
  SINGLE_VISION: 'single-vision',
  PROGRESSIVE: 'progressive'
};

export const PRESCRIPTION_METHODS = {
  MANUAL: 'manual',
  UPLOAD: 'upload',
  POST_CHECKOUT: 'post-checkout',
  NONE: 'none'
};

export const SUNGLASS_MODES = {
  STANDARD: 'standard',
  POWER: 'power',
  BOTH: 'both'
};

export const CONTACT_LENS_POWER_TYPES = {
  SPHERICAL: 'spherical',
  TORIC: 'toric',
  MULTIFOCAL: 'multifocal'
};
