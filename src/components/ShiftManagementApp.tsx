import React, { useState } from 'react';
import { 
  Users, 
  Bed, 
  Clock, 
  AlertCircle, 
  ShieldAlert, 
  Coffee, 
  CheckCircle2, 
  Plus, 
  ArrowRightLeft, 
  Sparkles,
  Heart,
  Activity,
  UserPlus,
  RefreshCw,
  Info
} from 'lucide-react';
import { Nurse, ShiftInfo, BreakSession, BreakType } from '../types';

interface ShiftManagementAppProps {
  shiftInfo: ShiftInfo;
  nurses: Nurse[];
  breakSessions: BreakSession[];
  selectedNurseId: string;
  onSelectNurse: (nurseId: string) => void;
  onRequestBreak: (nurseId: string, type: BreakType, duration: number) => void;
  onAddNurse: (nurse: Nurse) => void;
  onRebalanceBeds: () => void;
}

export const ShiftManagementApp: React.FC<ShiftManagementAppProps> = ({
  shiftInfo,
  nurses,
  breakSessions,
  selectedNurseId,
  onSelectNurse,
  onRequestBreak,
  onAddNurse,
  onRebalanceBeds,
}) => {
  const [isAddNurseModalOpen, setIsAddNurseModalOpen] = useState(false);
  const [newNurseName, setNewNurseName] = useState('');
  const [newNurseRole, setNewNurseRole] = useState<Nurse['role']>('Enfermeiro(a) Assistencial');
  const [newNurseCoren, setNewNurseCoren] = useState('COREN-SP 410.829-ENF');
  const [rebalanceFeedback, setRebalanceFeedback] = useState<string | null>(null);

  const handleRebalance = () => {
    onRebalanceBeds();
    setRebalanceFeedback('✅ Leitos de maior complexidade redistribuídos solidariamente pela equipe!');
    setTimeout(() => setRebalanceFeedback(null), 3000);
  };

  const handleCreateNurse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNurseName.trim()) return;

    const newNurse: Nurse = {
      id: `nurse-${Date.now()}`,
      name: newNurseName,
      role: newNurseRole,
      coren: newNurseCoren,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      assignedBeds: ['Leito 09 (Apoio)', 'Leito 10 (Apoio)'],
      shift: 'Diurno (07h-19h)',
      hoursOnDuty: 2,
      status: 'active',
      currentMetrics: {
        heartRate: 76,
        hrv: 58,
        skinTemp: 36.5,
        steps: 3200,
        continuousStandingHours: 1.2,
        alarmExposureCount: 18,
        overloadIndex: 32,
        overloadSeverity: 'normal',
        lastUpdated: '14:38',
      },
    };

    onAddNurse(newNurse);
    setIsAddNurseModalOpen(false);
    setNewNurseName('');
  };

  return (
    <div id="shift-management-container" className="space-y-6">
      {/* SHIFT STATUS & REGULATORY DIMENSIONING BANNER */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {shiftInfo.unit}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {shiftInfo.shiftName} (07:00 - 19:00)
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 mt-1 flex items-center gap-2">
              Quadro de Escalas & Sobrecarga em Tempo Real
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Dimensionamento assistencial, monitoramento de sinais vitais e rotação preventiva de pausas
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-rebalance-beds"
              onClick={handleRebalance}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-xl text-xs font-semibold shadow transition-colors"
              title="Redistribuir pacientes de maior complexidade para aliviar enfermeiros em risco"
            >
              <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
              Rebalancear Leitos da UTI
            </button>

            <button
              id="btn-add-nurse"
              onClick={() => setIsAddNurseModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Escalar Profissional
            </button>
          </div>
        </div>

        {rebalanceFeedback && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{rebalanceFeedback}</span>
          </div>
        )}

        {/* DIMENSIONING RISK ALERT (Identificado na Metodologia da Pesquisa) */}
        {shiftInfo.dimensioningAlert && (
          <div className="mt-4 p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-200">
                  Alerta de Dimensionamento Inadequado Detectado (Evidência Científica)
                </p>
                <p className="text-amber-300/80 mt-0.5 leading-relaxed">
                  Para <strong>{shiftInfo.occupiedBeds} leitos ocupados</strong> com <strong>{shiftInfo.highComplexityPatients} pacientes de alta complexidade</strong>,
                  o dimensionamento preconizado (Resolução COFEN / RDC 7) indica no mínimo <strong>{shiftInfo.nursesRequiredByRegulation} profissionais</strong>.
                  A escala atual possui <strong>{nurses.length} profissionais</strong>, elevando o risco de fadiga e sobrecarga.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAddNurseModalOpen(true)}
              className="whitespace-nowrap px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg text-xs self-end sm:self-center"
            >
              Reforçar Escala
            </button>
          </div>
        )}
      </div>

      {/* NURSES ON SHIFT GRID */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            Equipe Escalada no Plantão ({nurses.length} Profissionais)
          </h3>
          <span className="text-xs text-slate-400">
            Clique no card para abrir o smartwatch correspondente
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {nurses.map((nurse) => {
            const isSelected = nurse.id === selectedNurseId;
            const metrics = nurse.currentMetrics;
            const isCritical = metrics.overloadIndex >= 80;
            const isHigh = metrics.overloadIndex >= 65 && metrics.overloadIndex < 80;

            const buddy = nurses.find((n) => n.id === nurse.buddyNurseId);

            return (
              <div
                key={nurse.id}
                id={`nurse-card-${nurse.id}`}
                onClick={() => onSelectNurse(nurse.id)}
                className={`relative bg-slate-800/90 rounded-2xl p-4 border transition-all cursor-pointer shadow-lg hover:shadow-cyan-950/20 ${
                  isSelected
                    ? 'border-cyan-500 ring-2 ring-cyan-500/40 bg-slate-800'
                    : 'border-slate-700/80 hover:border-slate-600'
                }`}
              >
                {/* Header of card */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={nurse.avatar}
                        alt={nurse.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-slate-600"
                      />
                      {isCritical && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-slate-900 animate-pulse" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">{nurse.name}</h4>
                      <p className="text-[11px] text-slate-400 leading-tight">{nurse.role}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{nurse.coren}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        : isHigh
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : metrics.overloadIndex >= 50
                        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {metrics.overloadIndex}% Sobrecarga
                  </span>
                </div>

                {/* Assigned Beds in ICU */}
                <div className="mt-3 py-1.5 px-2.5 bg-slate-900/70 rounded-xl border border-slate-800/80">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Bed className="w-3 h-3 text-cyan-400" /> Leitos Sob Responsabilidade
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {nurse.assignedBeds.map((bed, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-800 text-cyan-200 px-1.5 py-0.5 rounded border border-slate-700"
                      >
                        {bed}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Live Biometrics Summary */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-700/60 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                      <Heart className="w-3 h-3 text-rose-400" /> FC
                    </div>
                    <div className={`text-xs font-mono font-bold mt-0.5 ${metrics.heartRate > 100 ? 'text-rose-400' : 'text-slate-200'}`}>
                      {metrics.heartRate} <span className="text-[9px] font-normal text-slate-400">bpm</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                      <Activity className="w-3 h-3 text-cyan-400" /> VFC
                    </div>
                    <div className={`text-xs font-mono font-bold mt-0.5 ${metrics.hrv < 35 ? 'text-rose-400' : 'text-slate-200'}`}>
                      {metrics.hrv} <span className="text-[9px] font-normal text-slate-400">ms</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" /> Em pé
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">
                      {metrics.continuousStandingHours}h
                    </div>
                  </div>
                </div>

                {/* Mutual Coverage Info */}
                {buddy && (
                  <div className="mt-3 text-[10px] text-slate-400 flex items-center justify-between bg-slate-900/40 px-2 py-1 rounded-lg">
                    <span>Cobertura mútua de pausas:</span>
                    <strong className="text-slate-300">{buddy.name.split(' ')[0]}</strong>
                  </div>
                )}

                {/* Card Action Button */}
                <div className="mt-3 pt-2 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestBreak(nurse.id, 'muscular_decompression_15min', 15);
                    }}
                    className={`w-full py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      isCritical
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md animate-pulse'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                    }`}
                  >
                    <Coffee className="w-3.5 h-3.5" />
                    {nurse.status === 'in_break' ? 'Em Pausa de Recuperação' : isCritical ? 'Acionar Pausa Urgente' : 'Sugerir Pausa (15m)'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ROTATION OF STRATEGIC PAUSES (RODÍZIO ESTRATÉGICO DA UTI) */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
              <Coffee className="w-4 h-4 text-amber-400" />
              Rodízio de Pausas Estratégicas & Cobertura Solidária de Leitos
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Garantia de assistência mútua contínua ao paciente da UTI durante a recuperação fisiológica da enfermagem
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {breakSessions.map((session) => {
            const isDone = session.status === 'completed';
            const isActive = session.status === 'active';
            return (
              <div
                key={session.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                  isActive
                    ? 'bg-amber-950/30 border-amber-600/60 ring-1 ring-amber-500/30'
                    : isDone
                    ? 'bg-slate-900/60 border-slate-700/60'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-200 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" /> {session.scheduledTime}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                          : isDone
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {isActive ? 'Em Pausa Agora' : isDone ? 'Concluída' : 'Sugerida pelo Relógio'}
                    </span>
                  </div>

                  <h5 className="font-bold text-slate-100 text-xs mt-2">{session.title}</h5>
                  <p className="text-[11px] text-cyan-400 mt-0.5 font-medium">{session.nurseName}</p>

                  {session.coveredByNurseName && (
                    <div className="mt-2 text-[10px] bg-slate-800/80 text-slate-300 p-1.5 rounded-lg border border-slate-700/60 flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                      <span>
                        Cobertura temporária por: <strong>{session.coveredByNurseName}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {isDone && session.preBreakHeartRate && session.postBreakHeartRate && (
                  <div className="mt-3 pt-2 border-t border-slate-700/60 text-[10px] flex items-center justify-between text-emerald-400 font-mono">
                    <span>Recuperação:</span>
                    <span>
                      {session.preBreakHeartRate} → {session.postBreakHeartRate} BPM (-{session.preBreakHeartRate - session.postBreakHeartRate})
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: ADD NURSE TO ROSTER */}
      {isAddNurseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-cyan-400" />
                Escalar Novo Profissional na UTI
              </h3>
              <button
                onClick={() => setIsAddNurseModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNurse} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Beatriz Albuquerque"
                  value={newNurseName}
                  onChange={(e) => setNewNurseName(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Função</label>
                <select
                  value={newNurseRole}
                  onChange={(e) => setNewNurseRole(e.target.value as Nurse['role'])}
                  className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Enfermeiro(a) Intensivista">Enfermeiro(a) Intensivista</option>
                  <option value="Enfermeiro(a) Assistencial">Enfermeiro(a) Assistencial</option>
                  <option value="Técnico(a) de Enfermagem">Técnico(a) de Enfermagem</option>
                  <option value="Enfermeiro(a) Coordenador(a)">Enfermeiro(a) Coordenador(a)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Registro Profissional (COREN)</label>
                <input
                  type="text"
                  value={newNurseCoren}
                  onChange={(e) => setNewNurseCoren(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="p-2.5 bg-slate-800/80 rounded-xl text-[11px] text-slate-400 border border-slate-700/60">
                💡 Ao escalar o profissional, o Smartwatch virtual será sincronizado e receberá leitos de apoio para diminuir a sobrecarga dos demais colegas.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddNurseModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow"
                >
                  Confirmar e Escalar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
