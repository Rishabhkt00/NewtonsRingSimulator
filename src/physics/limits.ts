// Single source of truth for every adjustable range in the simulator.
// Used by the setup sliders, the typed-value boxes and the scroll/pinch zoom.

/** Visible band; matches the colour model in wavelengthToRGB (380–750 nm). */
export const WAVELENGTH_NM = { min: 380, max: 750, step: 1 } as const;

/** Gap medium: air (1.000) up to dense liquids such as CS₂ (~1.63). */
export const MEDIUM_INDEX = { min: 1.0, max: 1.7, step: 0.005 } as const;

/** Lens radius of curvature: 0.5 m (short lens) to 5 m (long-focus lens). */
export const RADIUS_M = { min: 0.5, max: 5.0, step: 0.05 } as const;

/**
 * Lens lift d0. 3000 nm = 10+ fringe shifts at 589 nm and is enough for the
 * white-light fringes (coherence length ~3 µm) to wash out completely.
 */
export const LENS_LIFT_NM = { min: 0, max: 3000, step: 5 } as const;

/**
 * Microscope zoom. 1× shows a 14 mm field, which matches the ±6.5 mm
 * travel of the microscope; below 1× fine outer fringes alias into moiré.
 */
export const ZOOM = { min: 1.0, max: 5.0, step: 0.1 } as const;
