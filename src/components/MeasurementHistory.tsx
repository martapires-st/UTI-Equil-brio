import React, { useState, useMemo } from 'react';
import { 
  History, 
  Filter, 
  Heart, 
  Activity, 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  PlusCircle, 
  Search, 
  TrendingUp, 
  Coffee,
  Calendar,
  Clock,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { MeasurementRecord, Nurse, OverloadSeverity } from '../types';

interface MeasurementHistoryProps {
  records: MeasurementRecord[];
  nurses: Nurse[];
  selectedNurseId?: string;
  onAddManualRecord: (record: Omit<MeasurementRecord, 'id'>) => void;
  onSelectNurseForWatch: (nurseId: string) => void;
}

export const MeasurementHistory: React.FC<MeasurementHistoryProps> = ({
  records,
  nurses,
  selectedNurseId,
  onAddManualRecord,
  onSelectNurseForWatch,
}) => {
  const [filterNurse, setFilterNurse] = useState<string>(selectedNurseId || 'all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState<boolean>(false);

  // Form for manual measurement logging
  const [newNurseId, setNewNurseId] = useState<string>(nurses[0]?.id || '');
  const [newBpm, setNewBpm] = useState<number>(85);
  const [newHrv, setNewHrv] = useState<number>(45);
  const [newAlarms, setNewAlarms] = useState<number>(50);
  const [newTrigger, setNewTrigger] = useState<string>('Aferição de rotina durante procedimento');
  const [newAction, setNewAction] = useState<string>('Sugerida hidratação e alongamento');
  const [newTime, setNewTime] = useState<string>('14:40');

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchNurse = filterNurse === 'all' || r.nurseId === filterNurse;
      const matchSeverity = filterSeverity === 'all' || r.overloadSeverity === filterSeverity;
      const matchSearch = searchTerm === '' || 
        r.nurseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.triggerEvent && r.triggerEvent.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.actionTaken && r.actionTaken.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchNurse && matchSeverity && matchSearch;
    });
  }, [records, filterNurse, filterSeverity, searchTerm]);

  // Aggregate stats
  const stats = useMemo(() => {
    if (records.length === 0) return { avgBpm: 0, avgHrv: 0, avgOverload: 0, totalPauses: 0, criticalCount: 0 };
    const totalBpm = records.reduce((acc, r) => acc + r.heartRate, 0);
    const totalHrv = records.reduce((acc, r) => acc + r.hrv, 0);
    const totalOverload = records.reduce((acc, r) => acc + r.overloadIndex, 0);
    const totalPauses = records.filter((r) => r.wasBreakTaken).length;
    const criticalCount = records.filter((r) => r.overloadSeverity === 'critical').length;
    return {
      avgBpm: Math.round(totalBpm / records.length),
      avgHrv: Math.round(totalHrv / records.length),
      avgOverload: Math.round(totalOverload / records.length),
      totalPauses,
      criticalCount,
    };
  }, [records]);

  const handleSaveManualRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNurse = nurses.find((n) => n.id === newNurseId);
    if (!targetNurse) return;

    // Calculate overload based on parameters
    const calcOverload = Math.min(100, Math.max(15, Math.round((newBpm - 60) * 0.7 + (70 - newHrv) * 0.5 + newAlarms * 0.15)));
    const severity: OverloadSeverity = calcOverload >= 80 ? 'critical' : calcOverload >= 65 ? 'high' : calcOverload >= 50 ? 'moderate' : 'normal';

    onAddManualRecord({
      timestamp: newTime,
      nurseId: targetNurse.id,
      nurseName: targetNurse.name,
      heartRate: Number(newBpm),
      hrv: Number(newHrv),
      alarmCount: Number(newAlarms),
      overloadIndex: calcOverload,
      overloadSeverity: severity,
      triggerEvent: newTrigger,
      actionRecommended: newAction,
      actionTaken: 'Registrado manualmente no prontuário ocupacional',
      wasBreakTaken: false,
    });

    setIsNewRecordModalOpen(false);
  };

  const handleExportSummary = () => {
    const textContent = `=== RELATÓRIO OCUPACIONAL DA JORNADA DE ENFERMAGEM - UTI ===\nData: ${new Date().toLocaleDateString('pt-BR')}\nPlantão: 07:00 às 19:00\nTotal de Aferições Registradas: ${records.length}\n\nRESUMO GERAL:\n- Média de FC: ${stats.avgBpm} BPM\n- Média VFC (HRV): ${stats.avgHrv} ms\n- Média de Sobrecarga: ${stats.avgOverload}%\n- Pausas Estratégicas Executadas: ${stats.totalPauses}\n- Picos de Sobrecarga Crítica: ${stats.criticalCount}\n\nHISTÓRICO DETALHADO:\n` +
      records.map(r => `[${r.timestamp}] ${r.nurseName} | FC: ${r.heartRate} BPM | HRV: ${r.hrv}ms | Sobrecarga: ${r.overloadIndex}% (${r.overloadSeverity}) | Evento: ${r.triggerEvent || 'Nenhum'} | Pausa: ${r.wasBreakTaken ? 'Sim' : 'Não'}`).join('\n');
    
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `historico-sobrecarga-enfermagem-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityBadge = (severity: OverloadSeverity) => {
    switch (severity) {
      case 'critical':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">Crítica</span>;
      case 'high':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">Alta</span>;
      case 'moderate':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">Moderada</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Normal</span>;
    }
  };

  return (
    <div id="measurement-history-container" className="space-y-6">
      {/* Top Section: Overview Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Aferições no Turno</span>
            <History className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">{records.length}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-500" /> Plantão de 12h
          </div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Média de FC</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-300">
            {stats.avgBpm} <span className="text-xs font-normal text-slate-400">BPM</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {stats.avgBpm > 95 ? 'Taquicardia sustentada' : 'Faixa de esforço moderado'}
          </div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>VFC / HRV Média</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300">
            {stats.avgHrv} <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {stats.avgHrv < 40 ? 'Estresse simpático alto' : 'Equilíbrio autonômico'}
          </div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Pausas Realizadas</span>
            <Coffee className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300">
            {stats.totalPauses} <span className="text-xs font-normal text-slate-400">pausas</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Eficácia média: -24% FC
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Picos Críticos</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">
            {stats.criticalCount} <span className="text-xs font-normal text-slate-400">eventos</span>
          </div>
          <div className="text-[11px] text-rose-300/80 mt-1">
            Sobrecarga ≥ 80% detectada
          </div>
        </div>
      </div>

      {/* Visual Timeline of Overload across the shift */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Curva de Sobrecarga Aferida ao Longo do Plantão (12 Horas)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Registros contínuos aferidos pelos sensores do smartwatch de cada enfermeiro na UTI
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Normal (&lt;50%)
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Alerta (50-79%)
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Crítico (≥80%)
            </span>
          </div>
        </div>

        {/* Dynamic bar timeline chart */}
        <div className="pt-2 pb-1 overflow-x-auto">
          <div className="min-w-[650px] flex items-end gap-2 h-36 border-b border-slate-700 pb-2 px-2">
            {records.slice(-12).map((rec) => {
              const heightPercent = Math.max(15, rec.overloadIndex);
              const barColor = 
                rec.overloadSeverity === 'critical' ? 'bg-gradient-to-t from-rose-600 to-rose-400' :
                rec.overloadSeverity === 'high' ? 'bg-gradient-to-t from-amber-600 to-amber-400' :
                rec.overloadSeverity === 'moderate' ? 'bg-gradient-to-t from-yellow-600 to-yellow-400' :
                'bg-gradient-to-t from-emerald-600 to-emerald-400';
              return (
                <div key={rec.id} className="flex-1 flex flex-col items-center group relative cursor-pointer">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 z-20 pointer-events-none bg-slate-900 border border-slate-700 text-slate-100 p-2 rounded-lg text-[10px] w-48 shadow-xl">
                    <p className="font-bold text-cyan-300">{rec.nurseName}</p>
                    <p className="text-slate-400">{rec.timestamp} • {rec.triggerEvent || 'Aferição'}</p>
                    <div className="mt-1 flex justify-between font-mono text-[11px]">
                      <span>FC: {rec.heartRate} BPM</span>
                      <span>HRV: {rec.hrv}ms</span>
                    </div>
                    <div className="font-bold text-rose-400 mt-0.5">Sobrecarga: {rec.overloadIndex}%</div>
                    {rec.wasBreakTaken && (
                      <p className="text-emerald-400 font-semibold mt-1">✨ Pausa realizada</p>
                    )}
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 mb-1 font-semibold">
                    {rec.overloadIndex}%
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-md transition-all group-hover:brightness-125 relative ${barColor}`}
                  >
                    {rec.wasBreakTaken && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs">☕</span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-2 truncate max-w-[50px]">
                    {rec.timestamp}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FILTER & ACTIONS BAR */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar evento, enfermeiro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Filter by nurse */}
          <select
            id="filter-nurse-select"
            value={filterNurse}
            onChange={(e) => setFilterNurse(e.target.value)}
            className="py-1.5 px-3 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">Todos os Profissionais</option>
            {nurses.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name} ({n.role.split(' ')[0]})
              </option>
            ))}
          </select>

          {/* Filter by severity */}
          <select
            id="filter-severity-select"
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="py-1.5 px-3 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">Todas as Severidades</option>
            <option value="critical">Crítica (≥80%)</option>
            <option value="high">Alta (65-79%)</option>
            <option value="moderate">Moderada (50-64%)</option>
            <option value="normal">Normal (&lt;50%)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-add-manual-record"
            onClick={() => setIsNewRecordModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Nova Aferição
          </button>

          <button
            id="btn-export-history"
            onClick={handleExportSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-semibold shadow transition-colors"
            title="Exportar histórico da jornada"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* TABLE / LIST OF RECORDS ("histórico do que foi aferido durante a jornada") */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Histórico Detalhado das Aferições na Jornada
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Exibindo {filteredRecords.length} de {records.length} registros
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-700/80">
              <tr>
                <th className="py-3 px-4">Horário</th>
                <th className="py-3 px-4">Profissional</th>
                <th className="py-3 px-4">FC / HRV</th>
                <th className="py-3 px-4">Alarmes</th>
                <th className="py-3 px-4">Sobrecarga</th>
                <th className="py-3 px-4">Evento / Gatilho na UTI</th>
                <th className="py-3 px-4">Ação / Pausa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Nenhum registro encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  return (
                    <tr 
                      key={rec.id} 
                      className={`hover:bg-slate-750/50 transition-colors ${
                        rec.overloadSeverity === 'critical' ? 'bg-rose-950/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-200">
                        {rec.timestamp}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onSelectNurseForWatch(rec.nurseId)}
                          className="font-medium text-cyan-400 hover:underline flex items-center gap-1.5"
                          title="Ver smartwatch deste enfermeiro"
                        >
                          <span>{rec.nurseName}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 font-mono">
                          <span className={`font-semibold ${rec.heartRate > 100 ? 'text-rose-400' : 'text-slate-200'}`}>
                            {rec.heartRate} <span className="text-[10px] text-slate-500">BPM</span>
                          </span>
                          <span className="text-slate-500">/</span>
                          <span className={`font-semibold ${rec.hrv < 30 ? 'text-rose-400' : 'text-cyan-300'}`}>
                            {rec.hrv} <span className="text-[10px] text-slate-500">ms</span>
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span className="text-slate-300">{rec.alarmCount}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-100">
                            {rec.overloadIndex}%
                          </span>
                          {getSeverityBadge(rec.overloadSeverity)}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-slate-200 truncate" title={rec.triggerEvent}>
                          {rec.triggerEvent || 'Aferição contínua programada'}
                        </p>
                        {rec.actionRecommended && (
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {rec.actionRecommended}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {rec.wasBreakTaken ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3" /> Pausa Realizada
                          </span>
                        ) : rec.overloadSeverity === 'critical' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-950/50 border border-rose-800/40 px-2 py-0.5 rounded-md">
                            <AlertTriangle className="w-3 h-3" /> Pausa Pendente
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            Em atividade
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD MANUAL MEASUREMENT */}
      {isNewRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-850 bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-cyan-400" />
                Registrar Nova Aferição na Escala
              </h3>
              <button
                onClick={() => setIsNewRecordModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveManualRecord} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Profissional</label>
                <select
                  value={newNurseId}
                  onChange={(e) => setNewNurseId(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {nurses.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name} — {n.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Horário</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Frequência Cardíaca (BPM)</label>
                  <input
                    type="number"
                    min="50"
                    max="180"
                    value={newBpm}
                    onChange={(e) => setNewBpm(Number(e.target.value))}
                    className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">VFC / HRV (ms)</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={newHrv}
                    onChange={(e) => setNewHrv(Number(e.target.value))}
                    className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Alarmes Atendidos</label>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    value={newAlarms}
                    onChange={(e) => setNewAlarms(Number(e.target.value))}
                    className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Evento / Procedimento Clínico</label>
                <input
                  type="text"
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  placeholder="Ex: Admissão grave, cascata de alarmes..."
                  className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Recomendação Gerada</label>
                <input
                  type="text"
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewRecordModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow"
                >
                  Salvar no Histórico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
