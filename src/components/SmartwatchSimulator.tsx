import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Activity, 
  Bell, 
  Footprints, 
  Clock, 
  ShieldAlert, 
  Wind, 
  Coffee, 
  Wifi, 
  Battery, 
  Sparkles,
  CheckCircle2,
  Users,
  Volume2,
  Flame,
  ArrowRight
} from 'lucide-react';
import { Nurse, BreakType } from '../types';

interface SmartwatchSimulatorProps {
  selectedNurse: Nurse;
  onUpdateNurseMetrics: (nurseId: string, updates: Partial<Nurse['currentMetrics']>, status?: Nurse['status']) => void;
  onLogMeasurement: (nurseId: string, event: string, actionRec: string, actionTaken: string, wasBreak: boolean) => void;
  onRequestBreak: (nurseId: string, breakType: BreakType, duration: number) => void;
  onSelectNurse: (nurseId: string) => void;
  allNurses: Nurse[];
}

export const SmartwatchSimulator: React.FC<SmartwatchSimulatorProps> = ({
  selectedNurse,
  onUpdateNurseMetrics,
  onLogMeasurement,
  onRequestBreak,
  onSelectNurse,
  allNurses,
}) => {
  const [watchView, setWatchView] = useState<'main' | 'alert' | 'breathing' | 'break_active'>('main');
  const [breathingPhase, setBreathingPhase] = useState<'inspire' | 'hold' | 'expire' | 'wait'>('inspire');
  const [breathingSecondsLeft, setBreathingSecondsLeft] = useState<number>(60);
  const [isBreathingRunning, setIsBreathingRunning] = useState<boolean>(false);
  const [simulatingEvent, setSimulatingEvent] = useState<string | null>(null);

  const metrics = selectedNurse.currentMetrics;
  const isOverloadCritical = metrics.overloadIndex >= 80;
  const isOverloadHigh = metrics.overloadIndex >= 65 && metrics.overloadIndex < 80;

  // Box Breathing cycle effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isBreathingRunning && breathingSecondsLeft > 0) {
      timer = setInterval(() => {
        setBreathingSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsBreathingRunning(false);
            // Completed breathing break!
            const newBpm = Math.max(70, metrics.heartRate - 18);
            const newHrv = metrics.hrv + 22;
            const newOverload = Math.max(35, metrics.overloadIndex - 32);
            onUpdateNurseMetrics(selectedNurse.id, {
              heartRate: newBpm,
              hrv: newHrv,
              overloadIndex: newOverload,
              overloadSeverity: newOverload >= 80 ? 'critical' : newOverload >= 65 ? 'high' : newOverload >= 50 ? 'moderate' : 'normal',
            }, 'recovering');
            onLogMeasurement(
              selectedNurse.id,
              'Micro-pausa de respiração (Box Breathing 3 min) concluída no relógio',
              'Regulação autonômica parassimpática bem-sucedida',
              `Queda de FC para ${newBpm} BPM e índice de sobrecarga para ${newOverload}%`,
              true
            );
            setWatchView('main');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBreathingRunning, breathingSecondsLeft, selectedNurse.id, metrics]);

  // Breathing 4-phase animation cycle (4s each)
  useEffect(() => {
    let phaseInterval: NodeJS.Timeout;
    if (isBreathingRunning) {
      const phases: ('inspire' | 'hold' | 'expire' | 'wait')[] = ['inspire', 'hold', 'expire', 'wait'];
      let idx = 0;
      phaseInterval = setInterval(() => {
        idx = (idx + 1) % phases.length;
        setBreathingPhase(phases[idx]);
      }, 4000);
    }
    return () => clearInterval(phaseInterval);
  }, [isBreathingRunning]);

  const handleStartBreathing = () => {
    setBreathingSecondsLeft(60);
    setIsBreathingRunning(true);
    setWatchView('breathing');
    onRequestBreak(selectedNurse.id, 'breathing_3min', 3);
  };

  const handleTriggerEmergencyStress = () => {
    setSimulatingEvent('🚨 PCR no Leito 02');
    const newBpm = 126;
    const newHrv = 19;
    const newOverload = 92;
    onUpdateNurseMetrics(selectedNurse.id, {
      heartRate: newBpm,
      hrv: newHrv,
      alarmExposureCount: metrics.alarmExposureCount + 14,
      overloadIndex: newOverload,
      overloadSeverity: 'critical',
    }, 'critical_overload');

    onLogMeasurement(
      selectedNurse.id,
      'Parada Cardiorrespiratória (PCR) no Leito 02 - Reanimação e intubação rápida',
      'Pausa urgente de descompressão assim que estabilizar o paciente',
      'Relógio disparou alerta de taquicardia e esgotamento simpático (92%)',
      false
    );
    setWatchView('alert');
    setTimeout(() => setSimulatingEvent(null), 2500);
  };

  const handleTriggerAlarmFatigue = () => {
    setSimulatingEvent('🔔 Cascata de Alarmes na UTI');
    const newOverload = Math.min(95, metrics.overloadIndex + 16);
    onUpdateNurseMetrics(selectedNurse.id, {
      alarmExposureCount: metrics.alarmExposureCount + 22,
      heartRate: metrics.heartRate + 12,
      overloadIndex: newOverload,
      overloadSeverity: newOverload >= 80 ? 'critical' : 'high',
    });
    onLogMeasurement(
      selectedNurse.id,
      'Fadiga de Alarmes: +22 disparos auditados de ventilador mecânico e bombas',
      'Descompressão sensorial em sala de descanso silenciosa recomendada',
      'Alerta sonoro do relógio acionado para proteção cognitiva',
      false
    );
    setTimeout(() => setSimulatingEvent(null), 2500);
  };

  const handleManualInstantLog = () => {
    onLogMeasurement(
      selectedNurse.id,
      'Aferição pontual sob demanda do profissional via Smartwatch',
      'Monitoramento rotineiro contínuo da jornada hospitalar',
      `FC: ${metrics.heartRate} BPM, HRV: ${metrics.hrv}ms, Sobrecarga: ${metrics.overloadIndex}%`,
      false
    );
    setSimulatingEvent('✅ Aferição Salva no Histórico!');
    setTimeout(() => setSimulatingEvent(null), 2000);
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'high':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'moderate':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div id="smartwatch-container" className="flex flex-col items-center justify-center p-4">
      {/* Selector of which nurse's smartwatch we are examining */}
      <div className="w-full max-w-md mb-4 bg-slate-800/80 border border-slate-700/70 rounded-xl p-3 shadow-lg">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Profissional Conectado ao Relógio
          </span>
          <span className="text-[11px] bg-slate-700 px-2 py-0.5 rounded-full text-slate-300">
            {allNurses.length} no Plantão
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {allNurses.map((n) => {
            const isSelected = n.id === selectedNurse.id;
            const isCrit = n.currentMetrics.overloadIndex >= 80;
            return (
              <button
                key={n.id}
                id={`select-nurse-watch-${n.id}`}
                onClick={() => {
                  onSelectNurse(n.id);
                  setWatchView('main');
                }}
                className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-left transition-all text-xs ${
                  isSelected
                    ? 'bg-cyan-950/70 border-cyan-500/80 text-cyan-200 ring-1 ring-cyan-500/50'
                    : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={n.avatar}
                    alt={n.name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-600"
                  />
                  {isCrit && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate text-[11px]">{n.name.split(' ')[0]}</p>
                  <p className={`text-[10px] font-mono ${isCrit ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                    {n.currentMetrics.overloadIndex}%
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SMARTWATCH PHYSICAL HARDWARE CASING */}
      <div className="relative flex flex-col items-center">
        {/* Top watch strap */}
        <div className="w-40 h-14 bg-gradient-to-b from-slate-950 via-slate-800 to-slate-900 rounded-t-2xl shadow-inner border-t border-x border-slate-700/60 relative flex justify-center items-center">
          <div className="w-24 h-2 bg-slate-700/40 rounded-full mb-4" />
          <div className="absolute top-2 text-[10px] text-slate-500 font-mono tracking-widest uppercase">
            Hospital Grade • BLE
          </div>
        </div>

        {/* Watch Chassis (Hardware Frame) */}
        <div className="relative w-[310px] h-[370px] sm:w-[330px] sm:h-[390px] bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 rounded-[48px] p-3 shadow-2xl border-4 border-slate-700/80 ring-8 ring-black/60 flex flex-col items-center justify-center">
          {/* Side Crown Button (Physical hardware button) */}
          <button
            id="watch-hardware-crown"
            onClick={() => setWatchView(watchView === 'main' ? 'alert' : 'main')}
            title="Botão Coroa Digital do Relógio"
            className="absolute -right-3.5 top-28 w-3 h-12 bg-gradient-to-r from-slate-600 to-slate-400 rounded-r-md shadow-md border-y border-r border-slate-500 active:translate-x-[-1px] transition-transform flex items-center justify-center"
          >
            <div className="w-1 h-8 bg-slate-800/40 rounded-full" />
          </button>

          {/* Secondary Physical Action Button */}
          <button
            id="watch-hardware-action"
            onClick={handleStartBreathing}
            title="Botão de Ação Rápida: Iniciar Pausa de Respiração"
            className="absolute -right-3 bottom-28 w-2.5 h-8 bg-gradient-to-r from-cyan-600 to-cyan-500 rounded-r-md shadow-sm border border-cyan-400 active:translate-x-[-1px] transition-transform"
          />

          {/* Bezel Screen Container (High-res AMOLED Simulation) */}
          <div className="w-full h-full bg-black rounded-[40px] overflow-hidden relative border border-slate-800/80 p-3.5 flex flex-col text-slate-100 select-none shadow-inner">
            {/* Watch Top Status Bar */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 pb-2 border-b border-slate-800/60">
              <div className="flex items-center gap-1.5 font-mono text-cyan-400 font-semibold">
                <Wifi className="w-3 h-3" />
                <span className="truncate max-w-[90px]">UTI-ADULTO</span>
              </div>
              <div className="font-mono font-bold text-slate-200 text-xs">
                14:35
              </div>
              <div className="flex items-center gap-1 text-emerald-400">
                <Battery className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono">89%</span>
              </div>
            </div>

            {/* WATCH SCREEN CONTENT AREA */}
            <div className="flex-1 flex flex-col justify-between py-1 overflow-y-auto no-scrollbar relative">
              <AnimatePresence mode="wait">
                {/* 1. MAIN SCREEN: SOBRECARGA & VITALS */}
                {watchView === 'main' && (
                  <motion.div
                    key="main-screen"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col h-full justify-between"
                  >
                    {/* Nurse mini header on watch */}
                    <div className="flex items-center justify-between my-0.5">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={selectedNurse.avatar}
                          alt={selectedNurse.name}
                          className="w-5 h-5 rounded-full object-cover border border-cyan-500/50"
                        />
                        <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                          {selectedNurse.name}
                        </span>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium uppercase ${getSeverityBadgeColor(metrics.overloadSeverity)}`}>
                        {metrics.overloadSeverity === 'critical' ? 'CRÍTICO' : metrics.overloadSeverity === 'high' ? 'ALTO' : 'ESTÁVEL'}
                      </span>
                    </div>

                    {/* OVERLOAD INDEX GAUGE DISPLAY */}
                    <div className="relative my-1 bg-slate-900/90 rounded-2xl p-2.5 border border-slate-800 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                          <Flame className={`w-3 h-3 ${isOverloadCritical ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`} />
                          Índice Sobrecarga
                        </span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
                            isOverloadCritical ? 'text-rose-400' : isOverloadHigh ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {metrics.overloadIndex}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">%</span>
                        </div>
                        <span className="text-[9px] text-slate-400">
                          {isOverloadCritical ? 'Pausa recomendada agora' : isOverloadHigh ? 'Atenção: estresse elevado' : 'Dentro do limite seguro'}
                        </span>
                      </div>

                      {/* Circular Gauge Graphic */}
                      <div className="relative w-14 h-14 flex items-center justify-center">
                        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-800"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className={
                              isOverloadCritical ? 'text-rose-500' : isOverloadHigh ? 'text-amber-400' : 'text-emerald-400'
                            }
                            strokeDasharray={`${metrics.overloadIndex}, 100`}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <span className="absolute text-[10px] font-bold text-slate-200">
                          {metrics.overloadIndex}%
                        </span>
                      </div>
                    </div>

                    {/* VITAL SENSORS MINI GRID */}
                    <div className="grid grid-cols-2 gap-1.5">
                      {/* Heart Rate */}
                      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-1.5 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                          <Heart className="w-3.5 h-3.5 animate-pulse text-rose-500" />
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">Cardíaco</div>
                          <div className="text-xs font-bold font-mono text-slate-100">{metrics.heartRate} <span className="text-[9px] font-normal text-slate-400">BPM</span></div>
                        </div>
                      </div>

                      {/* HRV (Heart Rate Variability) */}
                      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-1.5 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                          <Activity className="w-3.5 h-3.5 text-cyan-400" />
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">VFC (HRV)</div>
                          <div className="text-xs font-bold font-mono text-slate-100">{metrics.hrv} <span className="text-[9px] font-normal text-slate-400">ms</span></div>
                        </div>
                      </div>

                      {/* ICU Alarm Fatigue Count */}
                      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-1.5 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                          <Bell className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">Alarmes UTI</div>
                          <div className="text-xs font-bold font-mono text-slate-100">{metrics.alarmExposureCount} <span className="text-[9px] font-normal text-slate-400">sons</span></div>
                        </div>
                      </div>

                      {/* Standing time / Steps */}
                      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-1.5 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                          <Footprints className="w-3.5 h-3.5 text-purple-400" />
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">Tempo em Pé</div>
                          <div className="text-xs font-bold font-mono text-slate-100">{metrics.continuousStandingHours}h <span className="text-[9px] font-normal text-slate-400">cont.</span></div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Smartwatch Action Bar */}
                    <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center gap-1.5">
                      {isOverloadCritical ? (
                        <button
                          id="watch-btn-pause-urgent"
                          onClick={() => setWatchView('alert')}
                          className="flex-1 py-1.5 px-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1 animate-pulse"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Pausa Estratégica
                        </button>
                      ) : (
                        <button
                          id="watch-btn-breathing"
                          onClick={handleStartBreathing}
                          className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
                        >
                          <Wind className="w-3.5 h-3.5 text-cyan-400" />
                          Micro-Pausa (3m)
                        </button>
                      )}

                      <button
                        id="watch-btn-log-instant"
                        onClick={handleManualInstantLog}
                        title="Registrar aferição agora"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs"
                      >
                        <Clock className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 2. ALERT & STRATEGIC BREAK PROPOSAL SCREEN */}
                {watchView === 'alert' && (
                  <motion.div
                    key="alert-screen"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col h-full justify-between py-1 text-center"
                  >
                    <div className="flex items-center justify-center gap-1.5 text-rose-400 font-bold text-xs uppercase tracking-wider">
                      <ShieldAlert className="w-4 h-4 animate-bounce" />
                      Alerta de Sobrecarga
                    </div>

                    <div className="my-1 p-2 bg-rose-950/40 border border-rose-800/60 rounded-2xl">
                      <p className="text-xs font-bold text-rose-200">
                        Sobrecarga Crítica: {metrics.overloadIndex}%
                      </p>
                      <p className="text-[10px] text-slate-300 mt-1 leading-snug">
                        {metrics.heartRate} BPM • VFC reduzida ({metrics.hrv}ms). {metrics.alarmExposureCount} alarmes auditados.
                      </p>
                      <div className="mt-2 text-[10px] bg-slate-900/90 text-cyan-300 p-1.5 rounded-lg border border-slate-800 text-left flex items-start gap-1.5">
                        <Users className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Carlos Eduardo</strong> foi notificado na escala para cobertura mútua dos Leitos 01 e 02.
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <button
                        id="watch-accept-break-btn"
                        onClick={() => {
                          onRequestBreak(selectedNurse.id, 'muscular_decompression_15min', 15);
                          setWatchView('break_active');
                        }}
                        className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-1.5"
                      >
                        <Coffee className="w-3.5 h-3.5" />
                        Aceitar Pausa de 15 min
                      </button>

                      <button
                        id="watch-quick-breathing-btn"
                        onClick={handleStartBreathing}
                        className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1"
                      >
                        <Wind className="w-3.5 h-3.5" />
                        Fazer Respiração Rápida (3m)
                      </button>

                      <button
                        onClick={() => setWatchView('main')}
                        className="text-[10px] text-slate-400 hover:text-slate-200 underline pt-1"
                      >
                        Voltar ao monitoramento
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 3. INTERACTIVE BOX BREATHING / MICRO-PAUSE SCREEN */}
                {watchView === 'breathing' && (
                  <motion.div
                    key="breathing-screen"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col h-full justify-between py-1 text-center items-center"
                  >
                    <div>
                      <div className="flex items-center justify-center gap-1 text-cyan-400 text-xs font-bold uppercase">
                        <Wind className="w-3.5 h-3.5" /> Respiração Guiada
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Resta: {breathingSecondsLeft}s
                      </p>
                    </div>

                    {/* Animated Breathing Circle */}
                    <div className="relative my-2 w-28 h-28 flex items-center justify-center">
                      <motion.div
                        animate={{
                          scale: breathingPhase === 'inspire' ? 1.35 : breathingPhase === 'hold' ? 1.35 : 0.85,
                          opacity: breathingPhase === 'expire' ? 0.6 : 1,
                        }}
                        transition={{ duration: 3.8, ease: 'easeInOut' }}
                        className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-600/40 via-teal-500/30 to-blue-500/40 border-2 border-cyan-400/80 shadow-[0_0_25px_rgba(6,182,212,0.4)] flex flex-col items-center justify-center"
                      >
                        <span className="text-xs font-extrabold text-cyan-100 uppercase tracking-wide">
                          {breathingPhase === 'inspire' && 'Inspire...'}
                          {breathingPhase === 'hold' && 'Segure...'}
                          {breathingPhase === 'expire' && 'Expire...'}
                          {breathingPhase === 'wait' && 'Descanse...'}
                        </span>
                        <span className="text-[9px] text-cyan-200 font-mono">4s</span>
                      </motion.div>
                    </div>

                    <div className="w-full px-2">
                      <div className="text-[10px] text-slate-300 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
                        Ativando tônus vagal parassimpático
                      </div>
                      <button
                        onClick={() => {
                          setIsBreathingRunning(false);
                          setWatchView('main');
                        }}
                        className="mt-1.5 text-[10px] text-slate-400 hover:text-slate-200 underline"
                      >
                        Encerrar sessão
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 4. ACTIVE STRATEGIC BREAK CONFIRMATION */}
                {watchView === 'break_active' && (
                  <motion.div
                    key="break-active-screen"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col h-full justify-between py-2 text-center items-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mt-2">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-emerald-300">Pausa em Andamento</h4>
                      <p className="text-[10px] text-slate-300 mt-1 px-2">
                        Seus leitos estão temporariamente cobertos. Descanse na área de descompressão.
                      </p>
                      <div className="mt-2 font-mono text-xl font-bold text-slate-100">
                        14:48 <span className="text-xs text-slate-400">retorno</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const newBpm = Math.max(68, metrics.heartRate - 24);
                        const newOverload = Math.max(30, metrics.overloadIndex - 45);
                        onUpdateNurseMetrics(selectedNurse.id, {
                          heartRate: newBpm,
                          hrv: metrics.hrv + 30,
                          overloadIndex: newOverload,
                          overloadSeverity: 'normal',
                        }, 'active');
                        onLogMeasurement(
                          selectedNurse.id,
                          'Retorno de Pausa Estratégica de 15 min de Descompressão',
                          'Recuperação fisiológica completa confirmada',
                          `FC reduzida para ${newBpm} BPM (-24 BPM) e sobrecarga caiu para ${newOverload}%`,
                          true
                        );
                        setWatchView('main');
                      }}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md"
                    >
                      Concluir Pausa e Retornar
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Bottom watch strap */}
        <div className="w-40 h-14 bg-gradient-to-t from-slate-950 via-slate-800 to-slate-900 rounded-b-2xl shadow-inner border-b border-x border-slate-700/60 relative flex justify-center items-center">
          <div className="w-20 h-2 bg-slate-700/40 rounded-full mt-4" />
        </div>
      </div>

      {/* QUICK LAB / CLINICAL SIMULATION CONTROLS FOR EVALUATION */}
      <div className="w-full max-w-md mt-4 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3.5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Simulador de Estressores da UTI
          </div>
          {simulatingEvent && (
            <span className="text-[11px] font-medium text-amber-300 animate-pulse bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700/50">
              {simulatingEvent}
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mb-2.5 leading-relaxed">
          Dispare eventos reais apontados na pesquisa bibliográfica para ver a reação imediata do relógio inteligente e o registro na escala:
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            id="sim-trigger-pcr"
            onClick={handleTriggerEmergencyStress}
            className="flex items-center gap-1.5 p-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/50 text-rose-200 text-xs text-left transition-colors"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <div>
              <div className="font-semibold">PCR / Emergência</div>
              <div className="text-[10px] text-rose-300/80">Eleva BPM e sobrecarga</div>
            </div>
          </button>

          <button
            id="sim-trigger-alarms"
            onClick={handleTriggerAlarmFatigue}
            className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-950/50 hover:bg-amber-900/60 border border-amber-800/50 text-amber-200 text-xs text-left transition-colors"
          >
            <Volume2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div>
              <div className="font-semibold">+ Alarmes de UTI</div>
              <div className="text-[10px] text-amber-300/80">Fadiga sensorial crônica</div>
            </div>
          </button>

          <button
            id="sim-trigger-pause"
            onClick={handleStartBreathing}
            className="flex items-center gap-1.5 p-2 rounded-xl bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-800/50 text-cyan-200 text-xs text-left transition-colors"
          >
            <Wind className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <div>
              <div className="font-semibold">Pausa Respiratória</div>
              <div className="text-[10px] text-cyan-300/80">Box Breathing (3 min)</div>
            </div>
          </button>

          <button
            id="sim-trigger-record"
            onClick={handleManualInstantLog}
            className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs text-left transition-colors"
          >
            <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div>
              <div className="font-semibold">Aferir Apenas</div>
              <div className="text-[10px] text-slate-400">Registrar no histórico</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
