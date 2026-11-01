// Physics definitions and types for Newton's Rings Virtual Laboratory

export type WavelengthPreset = 
  | 'sodium'          // 589 nm
  | 'sodium_doublet'  // 589.0 & 589.6 nm
  | 'custom'          // 380 - 750 nm
  | 'white'           // Polychromatic visible spectrum
  | 'red_filter'      // 650 nm
  | 'green_filter'    // 532 nm
  | 'blue_filter'     // 450 nm
  | 'violet_filter';  // 405 nm

export type MediumPreset = 'air' | 'water' | 'oil' | 'custom';

export type LightMode = 'reflected' | 'transmitted';

export type IrregularityType = 'none' | 'tilt' | 'gaussian_bump' | 'undulation';

export interface OpticalParameters {
  wavelength: number;              // in nm (e.g. 589)
  wavelengthPreset: WavelengthPreset;
  radiusCurvature: number;         // in meters (e.g. 1.0 m, range 0.5 to 5.0 m; see physics/limits.ts)
  lensDisplacement: number;        // vertical lift d0 in nm (0 to 3000 nm)
  lensRefractiveIndex: number;     // e.g. 1.517 (Crown glass)
  plateRefractiveIndex: number;    // e.g. 1.517
  mediumRefractiveIndex: number;   // e.g. 1.000 for air, 1.333 for water, 1.51 for oil
  mediumPreset: MediumPreset;
  lightMode: LightMode;            // 'reflected' or 'transmitted'
  intensity: number;               // 0.1 to 1.0
  contrast: number;                // 0.5 to 2.0
  magnification: number;           // 1.0 to 5.0x zoom
  hasIrregularity: boolean;        // Optical flatness defect
  irregularityType: IrregularityType;
  irregularityMagnitude: number;   // in nm (e.g. 200 nm)
  showRingMarkers: boolean;        // Label ring numbers
  showCrosshairs: boolean;         // Show microscope crosswire
}

export interface TravellingMicroscopeState {
  positionX: number;     // in mm, relative to center (can be -15 mm to +15 mm)
  leastCount: number;    // in mm, typically 0.01 mm
  zeroError: number;     // in mm
}
