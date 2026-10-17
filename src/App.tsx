import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Watch, 
  CalendarDays, 
  History, 
  BookOpen, 
  ShieldAlert, 
  Activity, 
  Coffee, 
  Clock, 
  Layers, 
  CheckCircle2, 
  BellRing,
  Info
} from 'lucide-react';
import { 
  initialShiftInfo, 
  initialNurses, 
  initialMeasurementRecords, 
  initialBreakSessions 
} from './data/mockData';
import { Nurse, ShiftInfo, MeasurementRecord, BreakSession, BreakType, OverloadSeverity } from './types';
import { SmartwatchSimulator } from './components/SmartwatchSimulator';
import { ShiftManagementApp } from './components/ShiftManagementApp';
import { MeasurementHistory } from './components/MeasurementHistory';
import { ResearchFoundationModal } from './components/ResearchFoundationModal';
import { SmartBreakGuideModal } from './components/SmartBreakGuideModal';

type AppTab = 'integrated' | 'smartwatch' | 'shift_management' | 'history';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('integrated');
  const [shiftInfo, setShiftInfo] = useState<ShiftInfo>(initialShiftInfo);
  const [nurses, setNurses] = useState<Nurse[]>(initialNurses);
  const [measurementRecords, setMeasurementRecords] = useState<MeasurementRecord[]>(initialMeasurementRecords);
  const [breakSessions, setBreakSessions] = useState<BreakSession[]>(initialBreakSessions);
  const [selectedNurseId, setSelectedNurseId] = useState<string>('nurse-1');

  // Modals
  const [isResearchModalOpen, setIsResearchModalOpen] = useState(false);
  const [isBreakGuideModalOpen, setIsBreakGuideModalOpen] = useState(false);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  const selectedNurse = nurses.find((n) => n.id === selectedNurseId) || nurses[0];

  // Show a toast message
  const triggerToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(null), 4000);
  };

  // Update nurse metrics (from smartwatch simulations or sensors)
  const handleUpdateNurseMetrics = (
    nurseId: string,
    updates: Partial<Nurse['currentMetrics']>,
    newStatus?: Nurse['status']
  ) => {
    setNurses((prev) =>
      prev.map((n) => {
        if (n.id !== nurseId) return n;
        const updatedMetrics = { ...n.currentMetrics, ...updates, lastUpdated: '14:38' };
        return {
          ...n,
          currentMetrics: updatedMetrics,
          status: newStatus || n.status,
        };
      })
    );
  };

  // Log a new measurement to the shift history ("histórico do que foi aferido durante a jornada")
  const handleLogMeasurement = (
    nurseId: string,
    triggerEvent: string,
    actionRecommended: string,
    actionTaken: string,
    wasBreak: boolean
  ) => {
    const targetNurse = nurses.find((n) => n.id === nurseId);
    if (!targetNurse) return;

    const metrics = targetNurse.currentMetrics;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newRecord: MeasurementRecord = {
      id: `rec-${Date.now()}`,
      timestamp: timeStr,
      nurseId: targetNurse.id,
      nurseName: targetNurse.name,
      heartRate: metrics.heartRate,
      hrv: metrics.hrv,
      overloadIndex: metrics.overloadIndex,
      overloadSeverity: metrics.overloadSeverity,
      alarmCount: metrics.alarmExposureCount,
      triggerEvent,
      actionRecommended,
      actionTaken,
      wasBreakTaken: wasBreak,
    };

    setMeasurementRecords((prev) => [newRecord, ...prev]);
    triggerToast(`Aferição registrada no prontuário da escala: ${targetNurse.name} (${metrics.overloadIndex}% sobrecarga)`);
  };

  // Add manual measurement record directly
  const handleAddManualRecord = (record: Omit<MeasurementRecord, 'id'>) => {
    const newRec: MeasurementRecord = {
      ...record,
      id: `rec-${Date.now()}`,
    };
    setMeasurementRecords((prev) => [newRec, ...prev]);
    triggerToast(`Nova aferição adicionada ao histórico por ${record.nurseName}`);
  };

  // Request strategic break
  const handleRequestBreak = (nurseId: string, breakType: BreakType, duration: number) => {
    const targetNurse = nurses.find((n) => n.id === nurseId);
    if (!targetNurse) return;

    const buddy = nurses.find((n) => n.id === targetNurse.buddyNurseId) || nurses[1];
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const titles: Record<BreakType, string> = {
      breathing_3min: 'Micro-Pausa de Respiração Guiada (Box Breathing)',
      hydration_10min: 'Pausa de Descompressão Sensorial & Hidratação',
      muscular_decompression_15min: 'Pausa Estratégica de Recuperação Postural',
      rest_20min: 'Pausa de Refeição & Descanso Físico',
    };

    const newSession: BreakSession = {
      id: `brk-${Date.now()}`,
      nurseId: targetNurse.id,
      nurseName: targetNurse.name,
      type: breakType,
      title: titles[breakType],
      durationMinutes: duration,
      scheduledTime: timeStr,
      status: 'active',
      preBreakHeartRate: targetNurse.currentMetrics.heartRate,
      preBreakOverload: targetNurse.currentMetrics.overloadIndex,
      coveredByNurseName: buddy ? buddy.name : 'Equipe de Apoio',
    };

    setBreakSessions((prev) => [newSession, ...prev]);
    handleUpdateNurseMetrics(nurseId, {}, 'in_break');

    triggerToast(`Pausa estratégica ativada para ${targetNurse.name}. Leitos cobertos por ${buddy?.name || 'Equipe'}.`);
  };

  // Add nurse to roster
  const handleAddNurse = (newNurse: Nurse) => {
    setNurses((prev) => [...prev, newNurse]);
    setShiftInfo((prev) => ({
      ...prev,
      nursesOnDuty: prev.nursesOnDuty + 1,
      dimensioningAlert: prev.nursesOnDuty + 1 < prev.nursesRequiredByRegulation,
    }));
    triggerToast(`Profissional ${newNurse.name} adicionado(a) à escala de plantão da UTI!`);
  };

  // Rebalance ICU beds
  const handleRebalanceBeds = () => {
    // Redistribute bed loads to equalize strain
    setNurses((prev) =>
      prev.map((n, idx) => {
        const adjustedOverload = Math.max(30, n.currentMetrics.overloadIndex - (n.currentMetrics.overloadIndex > 70 ? 20 : 0));
        return {
          ...n,
          currentMetrics: {
            ...n.currentMetrics,
            overloadIndex: adjustedOverload,
            overloadSeverity: adjustedOverload >= 80 ? 'critical' : adjustedOverload >= 65 ? 'high' : adjustedOverload >= 50 ? 'moderate' : 'normal',
          },
        };
      })
    );
    triggerToast('Leitos da UTI rebalanceados. Sobrecarga equalizada entre a equipe!');
  };

  // Calculate team overload average
  const avgTeamOverload = Math.round(
    nurses.reduce((acc, n) => acc + n.currentMetrics.overloadIndex, 0) / nurses.length
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* TOAST NOTIFICATION POPUP */}
      {toastNotification && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 border border-cyan-500/60 text-cyan-200 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-top-3">
          <BellRing className="w-4 h-4 text-cyan-400 animate-bounce" />
          <span>{toastNotification}</span>
        </div>
      )}

      {/* TOP CLINICAL HEADER BAR */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Logo & System Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-950/40">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Watch className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                    UTI Equilíbrio
                    <span className="text-xs font-semibold px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30">
                      Enfermagem UTI
                    </span>
                  </h1>
                </div>
                <p className="text-[11px] text-slate-400">
                  Relógio Inteligente de Sobrecarga & Gestão de Escalas com Histórico
                </p>
              </div>
            </div>

            {/* Quick Shift Status Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Unit Tag */}
              <div className="bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-slate-300">{shiftInfo.unit}</span>
              </div>

              {/* Plantão Clock */}
              <div className="bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-mono text-slate-300">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>14:38</span>
                <span className="text-[10px] text-slate-500">(Turno 12h)</span>
              </div>

              {/* Team Overload Alert Chip */}
              <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-medium ${
                avgTeamOverload >= 70
                  ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                  : 'bg-amber-950/30 border-amber-800/50 text-amber-300'
              }`}>
                <Activity className="w-3.5 h-3.5" />
                <span>Sobrecarga Média da Equipe: <strong>{avgTeamOverload}%</strong></span>
              </div>

              {/* Scientific Proposal Modal Trigger */}
              <button
                id="btn-open-research-modal"
                onClick={() => setIsResearchModalOpen(true)}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 rounded-xl flex items-center gap-1 transition-colors"
                title="Ver Fundamentação Científica da Proposta (Google Acadêmico / UTIs)"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Fundamentação Científica</span>
              </button>

              {/* Break Guide Trigger */}
              <button
                id="btn-open-break-guide"
                onClick={() => setIsBreakGuideModalOpen(true)}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-amber-500/30 rounded-xl flex items-center gap-1 transition-colors"
                title="Ver Protocolo de Pausas Estratégicas"
              >
                <Coffee className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pausas</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800/80 overflow-x-auto no-scrollbar">
            <button
              id="tab-integrated"
              onClick={() => setCurrentTab('integrated')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                currentTab === 'integrated'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Visão Integrada (Relógio + Escala)
            </button>

            <button
              id="tab-smartwatch"
              onClick={() => setCurrentTab('smartwatch')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                currentTab === 'smartwatch'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Watch className="w-3.5 h-3.5" />
              Relógio Inteligente do Enfermeiro
            </button>

            <button
              id="tab-shift-management"
              onClick={() => setCurrentTab('shift_management')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                currentTab === 'shift_management'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Gestão de Escalas da UTI
            </button>

            <button
              id="tab-history"
              onClick={() => setCurrentTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                currentTab === 'history'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Histórico de Aferições na Jornada ({measurementRecords.length})
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN BODY WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* VIEW 1: INTEGRATED DUAL VIEW */}
        {currentTab === 'integrated' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Smartwatch Simulator (4 cols on lg) */}
            <div className="lg:col-span-5 xl:col-span-4 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3 px-2">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  <Watch className="w-4 h-4 text-cyan-400" />
                  Relógio Inteligente Em Uso
                </h3>
                <span className="text-[11px] text-cyan-400 font-medium">
                  {selectedNurse.name.split(' ')[0]} (UTI)
                </span>
              </div>
              <SmartwatchSimulator
                selectedNurse={selectedNurse}
                allNurses={nurses}
                onSelectNurse={setSelectedNurseId}
                onUpdateNurseMetrics={handleUpdateNurseMetrics}
                onLogMeasurement={handleLogMeasurement}
                onRequestBreak={handleRequestBreak}
              />
            </div>

            {/* Right Column: Shift Management & Instant History Feed (7-8 cols on lg) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              <ShiftManagementApp
                shiftInfo={shiftInfo}
                nurses={nurses}
                breakSessions={breakSessions}
                selectedNurseId={selectedNurseId}
                onSelectNurse={setSelectedNurseId}
                onRequestBreak={handleRequestBreak}
                onAddNurse={handleAddNurse}
                onRebalanceBeds={handleRebalanceBeds}
              />

              {/* Quick History Preview on Integrated Screen */}
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-slate-100">
                      Últimas Aferições Registradas Durante o Turno
                    </h3>
                  </div>
                  <button
                    onClick={() => setCurrentTab('history')}
                    className="text-xs text-cyan-400 hover:underline font-semibold"
                  >
                    Ver Histórico Completo ({measurementRecords.length}) →
                  </button>
                </div>

                <div className="space-y-2">
                  {measurementRecords.slice(0, 4).map((rec) => (
                    <div
                      key={rec.id}
                      className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-slate-200">{rec.timestamp}</span>
                        <div>
                          <span className="font-semibold text-slate-100">{rec.nurseName}</span>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs">{rec.triggerEvent}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right font-mono">
                          <span className={`font-bold ${rec.overloadIndex >= 80 ? 'text-rose-400' : 'text-slate-200'}`}>
                            {rec.overloadIndex}% Sobrecarga
                          </span>
                          <span className="text-[10px] text-slate-400 block">{rec.heartRate} BPM</span>
                        </div>
                        {rec.wasBreakTaken ? (
                          <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                            Pausa Ok
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                            Monitorado
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: SMARTWATCH ONLY FOCUS */}
        {currentTab === 'smartwatch' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl">
              <div className="text-center mb-4">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Dispositivo Portátil do Profissional de Saúde
                </span>
                <h2 className="text-xl font-bold text-slate-100 mt-1">
                  Relógio Inteligente UTI Equilíbrio
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Aferição contínua de Frequência Cardíaca, Variabilidade (VFC/HRV), carga acústica de alarmes e cálculo de sobrecarga para sugestão de pausas de recuperação.
                </p>
              </div>

              <SmartwatchSimulator
                selectedNurse={selectedNurse}
                allNurses={nurses}
                onSelectNurse={setSelectedNurseId}
                onUpdateNurseMetrics={handleUpdateNurseMetrics}
                onLogMeasurement={handleLogMeasurement}
                onRequestBreak={handleRequestBreak}
              />
            </div>
          </div>
        )}

        {/* VIEW 3: SHIFT MANAGEMENT ONLY */}
        {currentTab === 'shift_management' && (
          <div className="space-y-6">
            <ShiftManagementApp
              shiftInfo={shiftInfo}
              nurses={nurses}
              breakSessions={breakSessions}
              selectedNurseId={selectedNurseId}
              onSelectNurse={setSelectedNurseId}
              onRequestBreak={handleRequestBreak}
              onAddNurse={handleAddNurse}
              onRebalanceBeds={handleRebalanceBeds}
            />
          </div>
        )}

        {/* VIEW 4: MEASUREMENT HISTORY */}
        {currentTab === 'history' && (
          <div className="space-y-6">
            <MeasurementHistory
              records={measurementRecords}
              nurses={nurses}
              selectedNurseId={selectedNurseId}
              onAddManualRecord={handleAddManualRecord}
              onSelectNurseForWatch={(nurseId) => {
                setSelectedNurseId(nurseId);
                setCurrentTab('smartwatch');
              }}
            />
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-900/50 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>UTI Equilíbrio • Projeto de Pesquisa em Saúde do Trabalhador & Segurança do Paciente na UTI</span>
          <button
            onClick={() => setIsResearchModalOpen(true)}
            className="text-cyan-400 hover:underline flex items-center gap-1 text-xs"
          >
            <BookOpen className="w-3.5 h-3.5" /> Ver Metodologia e Resultados Esperados
          </button>
        </div>
      </footer>

      {/* MODALS */}
      <ResearchFoundationModal
        isOpen={isResearchModalOpen}
        onClose={() => setIsResearchModalOpen(false)}
      />

      <SmartBreakGuideModal
        isOpen={isBreakGuideModalOpen}
        onClose={() => setIsBreakGuideModalOpen(false)}
        onStartBreathingBreak={() => {
          setCurrentTab('smartwatch');
          handleRequestBreak(selectedNurse.id, 'breathing_3min', 3);
        }}
      />
    </div>
  );
}
