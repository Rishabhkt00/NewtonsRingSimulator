import React, { useState } from 'react';
import { ObservationRecord, OpticalParameters } from '../../types/physics';
import { ObservationTable } from '../measurements/ObservationTable';
import { DataAnalysisGraph } from '../graph/DataAnalysisGraph';
import { CalculationDashboard } from '../calculations/CalculationDashboard';
import { Table, LineChart, FlaskConical } from 'lucide-react';

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

export const DataAndAnalysisView: React.FC<Props> = ({
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
  const [subView, setSubView] = useState<'combined' | 'deep_calculations'>('combined');

  return (
    <div className="space-y-4">
      {/* View Mode Switcher: Integrated Table+Graph or Deep Calculations */}
      <div className="flex items-center justify-between p-2 rounded-xl bg-lab-900/90 border border-slate-800 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSubView('combined')}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
              subView === 'combined'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Integrated Table & Live Regression Graph</span>
          </button>

          <button
            onClick={() => setSubView('deep_calculations')}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
              subView === 'deep_calculations'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Detailed Formulae & Calculations Dashboard</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 hidden sm:block">
          Measurements immediately update regression slope and calculated wavelength
        </div>
      </div>

      {subView === 'combined' ? (
        <div className="space-y-6">
          {/* Observation Table */}
          <ObservationTable
            airRecords={airRecords}
            liquidRecords={liquidRecords}
            activeTable={activeTable}
            params={params}
            onSelectTable={onSelectTable}
            onUpdateRecord={onUpdateRecord}
            onAddRecord={onAddRecord}
            onDeleteRecord={onDeleteRecord}
            onLoadSampleData={onLoadSampleData}
            onClearTable={onClearTable}
          />

          {/* Live Graph & Regression Analysis */}
          <DataAnalysisGraph
            airRecords={airRecords}
            liquidRecords={liquidRecords}
            params={params}
          />
        </div>
      ) : (
        <CalculationDashboard
          airRecords={airRecords}
          liquidRecords={liquidRecords}
          params={params}
        />
      )}
    </div>
  );
};
