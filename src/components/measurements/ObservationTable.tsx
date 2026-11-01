import React, { useState } from 'react';
import { ObservationRecord, OpticalParameters } from '../../types/physics';
import { getTheoreticalRingDiameterMm } from '../../physics/optics';
import {
  Table,
  Plus,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  FileSpreadsheet,
  Droplet,
  Wind,
  Check,
  AlertCircle,
} from 'lucide-react';

interface Props {
  airRecords: ObservationRecord[];
  liquidRecords: ObservationRecord[];
  activeTable: 'air' | 'liquid';
  params: OpticalParameters;
  onSelectTable: (table: 'air' | 'liquid') => void;
  onUpdateRecord: (table: 'air' | 'liquid', updatedRecord: ObservationRecord) => void;
  onAddRecord: (table: 'air' | 'liquid', ringOrder: number) => void;
  onDeleteRecord: (table: 'air' | 'liquid', id: string) => void;
  onLoadSampleData: (table: 'air' | 'liquid') => void;
  onClearTable: (table: 'air' | 'liquid') => void;
}

export const ObservationTable: React.FC<Props> = ({
  airRecords,
  liquidRecords,
  activeTable,
  params,
  onSelectTable,
  onUpdateRecord,
  onAddRecord,
  onDeleteRecord,
  onLoadSampleData,
  onClearTable,
}) => {
  const currentRecords = activeTable === 'air' ? airRecords : liquidRecords;
  const [newRingN, setNewRingN] = useState<number>(10);

  // Helper to handle manual edit of readings
  const handleEditReading = (
    rec: ObservationRecord,
    field: 'leftReading' | 'rightReading',
    val: number
  ) => {
    const updated = { ...rec, [field]: val };
    const diam = Math.abs(updated.leftReading - updated.rightReading);
    updated.diameter = Number(diam.toFixed(3));
    updated.diameterSquared = Number((diam * diam).toFixed(4));
    onUpdateRecord(activeTable, updated);
  };

  // CSV Export
  const exportToCSV = () => {
    const headers = ['Ring Order (n)', 'Left Reading (mm)', 'Right Reading (mm)', 'Diameter D (mm)', 'D^2 (mm^2)'];
    const rows = currentRecords.map((r) => [
      r.ringOrder,
      r.leftReading.toFixed(3),
      r.rightReading.toFixed(3),
      r.diameter.toFixed(3),
      r.diameterSquared.toFixed(4),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [`# Newton's Rings Virtual Laboratory Observation Table (${activeTable.toUpperCase()})`,
       `# Wavelength: ${params.wavelength} nm, Radius: ${params.radiusCurvature} m, Medium Refractive Index: ${params.mediumRefractiveIndex}`,
       headers.join(','),
       ...rows.map((e) => e.join(',')),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `newtons_rings_observations_${activeTable}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Header & Table Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-lab-900/90 border border-slate-800">
        <div className="flex items-center space-x-2">
          <Table className="w-5 h-5 text-sky-400" />
          <h3 className="font-semibold text-slate-100 text-sm tracking-wide">
            EXPERIMENTAL OBSERVATION DATA TABLES
          </h3>
        </div>

        {/* Air vs Liquid Toggle Tabs */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSelectTable('air')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center space-x-1.5 transition-all ${
              activeTable === 'air'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 shadow-md'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Air Film (μ = 1.000)</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-900 text-[10px]">
              {airRecords.length}
            </span>
          </button>

          <button
            onClick={() => onSelectTable('liquid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center space-x-1.5 transition-all ${
              activeTable === 'liquid'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
            }`}
          >
            <Droplet className="w-3.5 h-3.5 text-cyan-400" />
            <span>Liquid Medium (μ = {params.mediumRefractiveIndex.toFixed(3)})</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-900 text-[10px]">
              {liquidRecords.length}
            </span>
          </button>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Add Ring:</span>
          <input
            type="number"
            min="1"
            max="30"
            value={newRingN}
            onChange={(e) => setNewRingN(parseInt(e.target.value) || 1)}
            className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 text-center"
          />
          <button
            onClick={() => onAddRecord(activeTable, newRingN)}
            className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Row</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onLoadSampleData(activeTable)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 flex items-center space-x-1"
            title="Populate with standard laboratory experimental measurements"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Load Sample Data</span>
          </button>

          <button
            onClick={exportToCSV}
            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => onClearTable(activeTable)}
            className="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/50 rounded flex items-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Observation Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-lab-900/90 shadow-xl">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-slate-950/80 text-slate-300 border-b border-slate-800">
              <th className="py-2.5 px-3 border-r border-slate-800 text-center">S.No.</th>
              <th className="py-2.5 px-3 border-r border-slate-800 text-center text-sky-400">Ring Order (n)</th>
              <th className="py-2.5 px-4 border-r border-slate-800 text-center">
                <div>Left Reading R_L (mm)</div>
                <div className="text-[10px] text-slate-500 font-normal">MSR + VSR×LC</div>
              </th>
              <th className="py-2.5 px-4 border-r border-slate-800 text-center">
                <div>Right Reading R_R (mm)</div>
                <div className="text-[10px] text-slate-500 font-normal">MSR + VSR×LC</div>
              </th>
              <th className="py-2.5 px-4 border-r border-slate-800 text-center text-emerald-400">
                <div>Diameter D (mm)</div>
                <div className="text-[10px] text-slate-500 font-normal">|R_L - R_R|</div>
              </th>
              <th className="py-2.5 px-4 border-r border-slate-800 text-center text-amber-400">
                <div>D² (mm²)</div>
                <div className="text-[10px] text-slate-500 font-normal">Square of diameter</div>
              </th>
              <th className="py-2.5 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {currentRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <AlertCircle className="w-6 h-6 text-slate-600" />
                    <span>No readings recorded yet for {activeTable} table.</span>
                    <span className="text-[11px] text-slate-600">
                      Align the travelling microscope crosswire on rings and click "Record Left" / "Record Right", or click "Load Sample Data".
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              currentRecords.map((rec, index) => {
                const isComplete = rec.leftReading > 0 && rec.rightReading > 0;
                return (
                  <tr
                    key={rec.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isComplete ? 'bg-lab-950/20' : 'bg-amber-950/10'
                    }`}
                  >
                    <td className="py-2 px-3 border-r border-slate-800 text-center text-slate-500">
                      {index + 1}
                    </td>

                    {/* Ring Order */}
                    <td className="py-2 px-3 border-r border-slate-800 text-center font-bold text-sky-400">
                      n = {rec.ringOrder}
                    </td>

                    {/* Left Reading */}
                    <td className="py-2 px-3 border-r border-slate-800 text-center">
                      <input
                        type="number"
                        step="0.01"
                        value={rec.leftReading || ''}
                        placeholder="0.00"
                        onChange={(e) =>
                          handleEditReading(rec, 'leftReading', parseFloat(e.target.value) || 0)
                        }
                        className="w-24 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 text-center focus:border-sky-500 outline-none"
                      />
                    </td>

                    {/* Right Reading */}
                    <td className="py-2 px-3 border-r border-slate-800 text-center">
                      <input
                        type="number"
                        step="0.01"
                        value={rec.rightReading || ''}
                        placeholder="0.00"
                        onChange={(e) =>
                          handleEditReading(rec, 'rightReading', parseFloat(e.target.value) || 0)
                        }
                        className="w-24 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 text-center focus:border-sky-500 outline-none"
                      />
                    </td>

                    {/* Diameter */}
                    <td className="py-2 px-3 border-r border-slate-800 text-center font-semibold text-emerald-300">
                      {rec.diameter > 0 ? `${rec.diameter.toFixed(3)} mm` : '—'}
                    </td>

                    {/* D^2 */}
                    <td className="py-2 px-3 border-r border-slate-800 text-center font-semibold text-amber-300">
                      {rec.diameterSquared > 0 ? `${rec.diameterSquared.toFixed(4)} mm²` : '—'}
                    </td>

                    {/* Delete action */}
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => onDeleteRecord(activeTable, rec.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Observation Summary Info Box */}
      <div className="p-3 rounded-lg bg-lab-950 border border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400">
        <div>
          <span>Total Recorded Rows: <strong className="text-slate-200">{currentRecords.length}</strong></span>
          <span className="mx-2">•</span>
          <span>Valid Complete Ring Pairs: <strong className="text-emerald-400">{currentRecords.filter(r => r.diameterSquared > 0).length}</strong></span>
        </div>

        <div className="text-[11px] text-slate-500">
          Theoretical relationship: Dₙ² = (4λR / μ) · n
        </div>
      </div>
    </div>
  );
};
