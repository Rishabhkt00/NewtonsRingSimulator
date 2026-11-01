// High precision optical physics engine for Newton's Rings Simulation
import { OpticalParameters } from '../types/physics';

/**
 * Converts a monochromatic wavelength (in nm) to RGB values [0..255]
 * Based on Bruton's spectral approximation of CIE standard observer.
 */
export function wavelengthToRGB(wavelengthNm: number): [number, number, number] {
  let r = 0;
  let g = 0;
  let b = 0;

  if (wavelengthNm >= 380 && wavelengthNm < 440) {
    r = -(wavelengthNm - 440) / (440 - 380);
    g = 0.0;
    b = 1.0;
  } else if (wavelengthNm >= 440 && wavelengthNm < 490) {
    r = 0.0;
    g = (wavelengthNm - 440) / (490 - 440);
    b = 1.0;
  } else if (wavelengthNm >= 490 && wavelengthNm < 510) {
    r = 0.0;
    g = 1.0;
    b = -(wavelengthNm - 510) / (510 - 490);
  } else if (wavelengthNm >= 510 && wavelengthNm < 580) {
    r = (wavelengthNm - 510) / (580 - 510);
    g = 1.0;
    b = 0.0;
  } else if (wavelengthNm >= 580 && wavelengthNm < 645) {
    r = 1.0;
    g = -(wavelengthNm - 645) / (645 - 580);
    b = 0.0;
  } else if (wavelengthNm >= 645 && wavelengthNm <= 750) {
    r = 1.0;
    g = 0.0;
    b = 0.0;
  } else if (wavelengthNm < 380) {
    r = 0.5; g = 0.0; b = 0.8;
  } else {
    r = 0.7; g = 0.0; b = 0.0;
  }

  // Intensity falloff at spectrum edges where human vision sensitivity drops
  let factor = 0.0;
  if (wavelengthNm >= 380 && wavelengthNm < 420) {
    factor = 0.3 + 0.7 * (wavelengthNm - 380) / (420 - 380);
  } else if (wavelengthNm >= 420 && wavelengthNm <= 700) {
    factor = 1.0;
  } else if (wavelengthNm > 700 && wavelengthNm <= 750) {
    factor = 0.3 + 0.7 * (750 - wavelengthNm) / (750 - 700);
  } else {
    factor = 0.2;
  }

  const gamma = 0.8;
  return [
    Math.round(255 * Math.pow(r * factor, gamma)),
    Math.round(255 * Math.pow(g * factor, gamma)),
    Math.round(255 * Math.pow(b * factor, gamma)),
  ];
}

/**
 * Calculates film thickness t at radial distance r (in meters)
 * t(r) = r^2 / (2R) + d0 + irregularity(x, y)
 */
export function calculateFilmThickness(
  rMeters: number,
  xMeters: number,
  yMeters: number,
  params: OpticalParameters
): number {
  const baseThickness = (rMeters * rMeters) / (2 * params.radiusCurvature);
  const displacementMeters = params.lensDisplacement * 1e-9;
  let irregularity = 0;

  if (params.hasIrregularity) {
    const mag = params.irregularityMagnitude * 1e-9;
    if (params.irregularityType === 'tilt') {
      // Wedge tilt in x direction
      irregularity = (xMeters / 0.005) * mag;
    } else if (params.irregularityType === 'gaussian_bump') {
      // Localized irregularity at x = 1.2mm, y = 0.8mm
      const dx = xMeters - 0.0012;
      const dy = yMeters - 0.0008;
      const dist2 = dx * dx + dy * dy;
      irregularity = mag * Math.exp(-dist2 / (2 * (0.0008 * 0.0008)));
    } else if (params.irregularityType === 'undulation') {
      // Wavy surface imperfections
      irregularity = mag * 0.5 * (Math.sin(xMeters * 3000) * Math.cos(yMeters * 3000));
    }
  }

  return Math.max(0, baseThickness + displacementMeters + irregularity);
}

/**
 * Calculates interference intensity at a point for monochromatic light
 * Takes into account Stokes' phase reversal on reflection:
 * For reflected light with n_lens > mu and mu < n_plate, reflection at lower surface
 * suffers a phase change of pi.
 * Thus:
 * - Reflected: Path diff Delta = 2 * mu * t. Total phase delta = (2*pi/lambda)*Delta + pi
 *   Intensity I_R = I0 * sin^2(2*pi*mu*t / lambda) -> At t = 0, I = 0 (Dark spot)
 * - Transmitted: Complementary intensity
 *   Intensity I_T = I0 * cos^2(2*pi*mu*t / lambda) -> At t = 0, I = I0 (Bright spot)
 */
export function calculateMonochromaticIntensity(
  tMeters: number,
  wavelengthNm: number,
  mu: number,
  isReflected: boolean,
  contrast: number
): number {
  const lambdaMeters = wavelengthNm * 1e-9;
  const phase = (2 * Math.PI * mu * tMeters) / lambdaMeters;

  let normIntensity: number;
  if (isReflected) {
    // Stokes phase change pi causes sin^2
    normIntensity = Math.sin(phase) * Math.sin(phase);
  } else {
    // Transmitted has no extra pi phase shift
    normIntensity = Math.cos(phase) * Math.cos(phase);
  }

  // Apply contrast adjustment
  if (contrast !== 1.0) {
    normIntensity = Math.max(0, Math.min(1, 0.5 + (normIntensity - 0.5) * contrast));
  }

  return normIntensity;
}

/**
 * Multi-wavelength spectrum synthesis for White Light Interference
 * Evaluates 18 discrete spectral bands across 400 to 700 nm.
 * Due to finite coherence length, higher order rings lose contrast and merge into white light.
 */
const WHITE_SPECTRUM_COMPONENTS: Array<{ lambda: number; r: number; g: number; b: number; weight: number }> = [
  { lambda: 410, r: 80, g: 0, b: 200, weight: 0.3 },
  { lambda: 435, r: 0, g: 20, b: 255, weight: 0.6 },
  { lambda: 460, r: 0, g: 120, b: 255, weight: 0.8 },
  { lambda: 485, r: 0, g: 210, b: 240, weight: 0.9 },
  { lambda: 505, r: 0, g: 255, b: 180, weight: 0.95 },
  { lambda: 525, r: 0, g: 255, b: 50, weight: 1.0 },
  { lambda: 545, r: 80, g: 255, b: 0, weight: 1.0 },
  { lambda: 565, r: 180, g: 255, b: 0, weight: 1.0 },
  { lambda: 585, r: 255, g: 230, b: 0, weight: 0.98 },
  { lambda: 605, r: 255, g: 160, b: 0, weight: 0.9 },
  { lambda: 625, r: 255, g: 80, b: 0, weight: 0.85 },
  { lambda: 650, r: 255, g: 20, b: 0, weight: 0.75 },
  { lambda: 680, r: 210, g: 0, b: 0, weight: 0.5 },
];

export function calculateWhiteLightColor(
  tMeters: number,
  mu: number,
  isReflected: boolean,
  contrast: number
): [number, number, number] {
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let totalWeight = 0;

  // Coherence decay factor: as optical path difference 2*mu*t exceeds ~2.5 um, fringe visibility drops
  const opdMicrons = (2 * mu * tMeters) * 1e6;
  const coherenceDecay = Math.exp(-Math.pow(opdMicrons / 2.8, 2));

  for (const comp of WHITE_SPECTRUM_COMPONENTS) {
    const rawI = calculateMonochromaticIntensity(tMeters, comp.lambda, mu, isReflected, contrast);
    // As coherence drops, intensity decays toward uniform 0.5
    const I = 0.5 + (rawI - 0.5) * coherenceDecay;
    totalR += comp.r * I * comp.weight;
    totalG += comp.g * I * comp.weight;
    totalB += comp.b * I * comp.weight;
    totalWeight += comp.weight;
  }

  const scale = 1.0 / totalWeight;
  return [
    Math.min(255, Math.round(totalR * scale * 1.3)),
    Math.min(255, Math.round(totalG * scale * 1.3)),
    Math.min(255, Math.round(totalB * scale * 1.3)),
  ];
}

/**
 * Sodium D1 and D2 Doublet Superposition (589.0 nm and 589.6 nm)
 * Demonstrates optical beats / contrast modulation with vertical displacement!
 */
export function calculateSodiumDoubletIntensity(
  tMeters: number,
  mu: number,
  isReflected: boolean,
  contrast: number
): number {
  const l1 = 589.0;
  const l2 = 589.6;
  const i1 = calculateMonochromaticIntensity(tMeters, l1, mu, isReflected, 1.0);
  const i2 = calculateMonochromaticIntensity(tMeters, l2, mu, isReflected, 1.0);

  // Equal weight superposition
  let combined = (i1 + i2) / 2.0;
  if (contrast !== 1.0) {
    combined = Math.max(0, Math.min(1, 0.5 + (combined - 0.5) * contrast));
  }
  return combined;
}

/**
 * Calculates theoretical diameter (in mm) for ring order n
 * For reflected dark rings:
 * D_n = 2 * sqrt( n * lambda * R / mu - 2 * R * d0 )
 */
export function getTheoreticalRingDiameterMm(
  n: number,
  params: OpticalParameters,
  isDarkRing = true
): number {
  const lambda = params.wavelength * 1e-9;
  const R = params.radiusCurvature;
  const mu = params.mediumRefractiveIndex;
  const d0 = params.lensDisplacement * 1e-9;

  let effectiveN = n;
  if (params.lightMode === 'reflected') {
    effectiveN = isDarkRing ? n : n - 0.5;
  } else {
    // Transmitted is complementary
    effectiveN = isDarkRing ? n - 0.5 : n;
  }

  const term = (effectiveN * lambda * R) / mu - 2 * R * d0;
  if (term <= 0) return 0;

  const radiusMeters = Math.sqrt(term);
  return 2 * radiusMeters * 1000; // in mm
}
