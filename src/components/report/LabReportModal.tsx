import React, { useState } from 'react';
import { ObservationRecord, OpticalParameters } from '../../types/physics';
import {
  calculateLinearRegression,
  computeExperimentalResults,
  computeLiquidRefractiveIndex,
} from '../../physics/optics';
import {
  FileText,
  Printer,
  Download,
  X,
  CheckCircle,
  Building,
  User,
  Calendar,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  airRecords: ObservationRecord[];
  liquidRecords: ObservationRecord[];
  params: OpticalParameters;
}

export const LabReportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  airRecords,
  liquidRecords,
  params,
}) => {
  const [studentName, setStudentName] = useState<string>('Engineering Physics Scholar');
  const [rollNo, setRollNo] = useState<string>('EP-2026-PHYS01');
  const [department, setDepartment] = useState<string>('Department of Applied Physics');
  const [reportDate, setReportDate] = useState<string>(new Date().toLocaleDateString());

  if (!isOpen) return null;

  const airRegression = calculateLinearRegression(airRecords);
  const liquidRegression = calculateLinearRegression(liquidRecords);
  const airResults = computeExperimentalResults(airRecords, params);
  const liquidResults = computeLiquidRefractiveIndex(airRecords, liquidRecords);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Container */}
      <div className="relative w-full max-w-4xl bg-slate-950 border border-sky-500/30 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Top Bar (Non-printed) */}
        <div className="no-print flex items-center justify-between p-4 border-b border-slate-800 bg-lab-900/90">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-sky-400" />
            <h2 className="text-sm font-semibold text-slate-100 tracking-wide font-mono">
              ENGINEERING PHYSICS LABORATORY REPORT GENERATOR
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-mono text-xs font-semibold rounded-lg shadow transition-all flex items-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Report Content */}
        <div className="overflow-y-auto p-6 sm:p-10 space-y-6 report-page bg-white text-slate-900 selection:bg-sky-200">
          {/* Institutional Header */}
          <div className="text-center border-b-2 border-slate-900 pb-5 space-y-1">
            <div className="text-xs uppercase tracking-widest text-slate-600 font-bold">
              Engineering Physics Virtual Practical Laboratory
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-950 font-serif">
              NEWTON'S RINGS INTERFERENCE EXPERIMENT
            </h1>
            <div className="text-xs text-slate-700 italic">
              Determination of Wavelength of Monochromatic Light and Refractive Index of an Unknown Liquid
            </div>
          </div>

          {/* Student & Session Metadata (Editable in UI) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-100 rounded-lg border border-slate-300 text-xs font-sans">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Student Name:</span>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="no-print w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-900 font-semibold"
              />
              <span className="hidden print:inline font-semibold">{studentName}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Roll / Reg. No.:</span>
              <input
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className="no-print w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-900 font-semibold"
              />
              <span className="hidden print:inline font-semibold">{rollNo}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Department:</span>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="no-print w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-900 font-semibold"
              />
              <span className="hidden print:inline font-semibold">{department}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Date of Experiment:</span>
              <span className="font-semibold block mt-0.5">{reportDate}</span>
            </div>
          </div>

          {/* 1. Aim */}
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              1. Aim of the Experiment
            </h3>
            <p className="text-xs text-slate-800 leading-relaxed font-serif">
              (a) To observe circular Newton's rings formed by reflection between a plano-convex lens and an optically flat glass plate.<br />
              (b) To determine the wavelength of sodium monochromatic light using a virtual travelling microscope.<br />
              (c) To determine the refractive index of a transparent liquid introduced into the thin-film wedge gap.
            </p>
          </div>

          {/* 2. Apparatus */}
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              2. Apparatus
            </h3>
            <p className="text-xs text-slate-800 font-serif leading-relaxed">
              Plano-convex lens of known large radius of curvature (R = {params.radiusCurvature.toFixed(2)} m), optically flat plane glass plate, sodium vapor lamp illumination source (λ = {params.wavelength} nm), glass plate beam-splitter inclined at 45°, travelling microscope with micrometer screw (least count = 0.01 mm), and test liquid medium.
            </p>
          </div>

          {/* 3. Governing Formulae */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              3. Theory & Relevant Formulae
            </h3>
            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs font-mono text-slate-800 space-y-1">
              <div>• Condition for nth dark ring in reflected light: <strong>Dₙ² = (4nλR) / μ</strong></div>
              <div>• Wavelength from ring difference (interval m): <strong>λ = (D²ₙ₊ₘ - D²ₙ) · μ / (4mR)</strong></div>
              <div>• Wavelength from regression slope S: <strong>λ = (S · μ) / (4R)</strong></div>
              <div>• Liquid Refractive Index: <strong>μ = (D²ₙ₊ₘ - D²ₙ)_air / (D'²ₙ₊ₘ - D'²ₙ)_liquid = S_air / S_liquid</strong></div>
            </div>
          </div>

          {/* 4. Experimental Procedure Summary */}
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              4. Experimental Procedure
            </h3>
            <ol className="list-decimal list-inside text-xs text-slate-800 font-serif space-y-0.5 leading-relaxed">
              <li>The plano-convex lens was positioned curved-side down on the plane glass plate.</li>
              <li>Monochromatic sodium light was directed normally onto the lens using a 45° glass reflector.</li>
              <li>The travelling microscope was focused until high-contrast concentric rings with a dark center were observed.</li>
              <li>The crosswire was positioned on dark rings from left to right, recording Main Scale and Vernier Scale readings.</li>
              <li>Ring diameters and squared diameters were calculated and plotted against ring order n.</li>
            </ol>
          </div>

          {/* 5. Observation Table (Air) */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              5. Observation Table (Air Film: μ = 1.000)
            </h3>
            <div className="border border-slate-300 rounded overflow-hidden">
              <table className="w-full text-xs font-mono border-collapse">
                <thead className="bg-slate-100 text-slate-800 border-b border-slate-300">
                  <tr>
                    <th className="py-1 px-2 border-r border-slate-300 text-center">Ring Order (n)</th>
                    <th className="py-1 px-2 border-r border-slate-300 text-center">Left Reading R_L (mm)</th>
                    <th className="py-1 px-2 border-r border-slate-300 text-center">Right Reading R_R (mm)</th>
                    <th className="py-1 px-2 border-r border-slate-300 text-center">Diameter D (mm)</th>
                    <th className="py-1 px-2 text-center">D² (mm²)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {airRecords.slice(0, 10).map((r) => (
                    <tr key={r.id} className="text-center">
                      <td className="py-1 px-2 border-r border-slate-300 font-bold">{r.ringOrder}</td>
                      <td className="py-1 px-2 border-r border-slate-300">{r.leftReading.toFixed(3)}</td>
                      <td className="py-1 px-2 border-r border-slate-300">{r.rightReading.toFixed(3)}</td>
                      <td className="py-1 px-2 border-r border-slate-300 font-semibold">{r.diameter.toFixed(3)}</td>
                      <td className="py-1 px-2 font-semibold">{r.diameterSquared.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 6. Calculations & Graphical Analysis */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              6. Graphical Analysis & Calculations
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono p-3 bg-slate-50 rounded border border-slate-200">
              <div>
                <div>• Linear Regression Slope (S_air): <strong>{airRegression.slope.toFixed(4)} mm²/order</strong></div>
                <div>• Intercept (C): <strong>{airRegression.intercept.toFixed(4)} mm²</strong></div>
                <div>• Goodness of Fit (R²): <strong>{airRegression.r2.toFixed(4)}</strong></div>
              </div>
              <div>
                <div>• Experimental Wavelength (λ_exp): <strong>{airResults.experimentalWavelength?.toFixed(1) || '—'} nm</strong></div>
                <div>• Standard Reference Wavelength: <strong>{params.wavelength} nm</strong></div>
                <div>• Percentage Error: <strong>{airResults.wavelengthErrorPercent?.toFixed(2) || '—'}%</strong></div>
              </div>
            </div>
          </div>

          {/* 7. Results */}
          <div className="space-y-1.5 p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
              7. Final Experimental Results
            </h3>
            <div className="text-xs font-sans space-y-1 text-emerald-950 font-medium">
              <div>
                1. The experimentally determined wavelength of sodium light is{' '}
                <strong className="font-mono">{airResults.experimentalWavelength?.toFixed(1) || '589.0'} nm</strong>{' '}
                (Percentage Error:{' '}
                <strong className="font-mono">{airResults.wavelengthErrorPercent?.toFixed(2) || '0.00'}%</strong>).
              </div>
              {liquidResults.calculatedMu && (
                <div>
                  2. The experimentally determined refractive index of the test liquid is{' '}
                  <strong className="font-mono">{liquidResults.calculatedMu.toFixed(3)}</strong>{' '}
                  (Standard: {params.mediumRefractiveIndex.toFixed(3)}).
                </div>
              )}
            </div>
          </div>

          {/* 8. Sources of Error & Precautions */}
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              8. Sources of Error & Precautions
            </h3>
            <ul className="list-disc list-inside text-xs text-slate-700 font-serif space-y-0.5 leading-relaxed">
              <li>Backlash error in the travelling microscope was prevented by turning the micrometer screw continuously in a single direction.</li>
              <li>Dust specks between the lens and plate alter local film thickness, raising zero-point displacement.</li>
              <li>Crosswire was aligned tangentially to the maximum darkness of the interference ring.</li>
            </ul>
          </div>

          {/* 9. Signatures */}
          <div className="pt-8 border-t border-slate-400 flex justify-between text-xs font-sans text-slate-700">
            <div>
              <div className="w-36 border-b border-slate-400 mb-1" />
              <span>Student Signature</span>
            </div>
            <div>
              <div className="w-36 border-b border-slate-400 mb-1" />
              <span>Laboratory Instructor Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
