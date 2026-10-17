export type OverloadSeverity = 'normal' | 'moderate' | 'high' | 'critical';

export interface Nurse {
  id: string;
  name: string;
  role: 'Enfermeiro(a) Assistencial' | 'Técnico(a) de Enfermagem' | 'Enfermeiro(a) Coordenador(a)' | 'Enfermeiro(a) Intensivista';
  coren: string;
  avatar: string;
  assignedBeds: string[]; // e.g. ["Leito 01", "Leito 02"]
  shift: 'Diurno (07h-19h)' | 'Noturno (19h-07h)';
  hoursOnDuty: number;
  currentMetrics: VitalMetrics;
  status: 'active' | 'in_break' | 'critical_overload' | 'recovering';
  buddyNurseId?: string; // Colaborador para cobertura mútua
}

export interface VitalMetrics {
  heartRate: number; // BPM (60-140)
  hrv: number; // Variabilidade da FC em ms (baixo = estresse elevado simpático)
  skinTemp: number; // °C
  steps: number; // Passos acumulados
  continuousStandingHours: number; // Horas em pé ininterruptas
  alarmExposureCount: number; // Quantidade de alarmes atendidos na UTI
  overloadIndex: number; // 0 - 100%
  overloadSeverity: OverloadSeverity;
  lastUpdated: string;
}

export interface MeasurementRecord {
  id: string;
  timestamp: string; // ex: "14:20"
  nurseId: string;
  nurseName: string;
  heartRate: number;
  hrv: number;
  overloadIndex: number;
  overloadSeverity: OverloadSeverity;
  alarmCount: number;
  triggerEvent?: string; // ex: "PCR Leito 03", "Admissão Pós-Op", "Troca de curativo complexo"
  actionRecommended?: string; // ex: "Micro-pausa de 3min sugerida"
  actionTaken?: string; // ex: "Pausa de respiração concluída (-18 BPM)"
  wasBreakTaken: boolean;
}

export type BreakType = 'breathing_3min' | 'hydration_10min' | 'muscular_decompression_15min' | 'rest_20min';

export interface BreakSession {
  id: string;
  nurseId: string;
  nurseName: string;
  type: BreakType;
  title: string;
  durationMinutes: number;
  scheduledTime: string;
  status: 'suggested' | 'active' | 'completed' | 'skipped';
  preBreakHeartRate?: number;
  postBreakHeartRate?: number;
  preBreakOverload?: number;
  postBreakOverload?: number;
  coveredByNurseName?: string;
  completedAt?: string;
}

export interface ShiftInfo {
  id: string;
  unit: string; // "UTI Geral Adulto - 10 Leitos"
  shiftName: string; // "Plantão Diurno - 12h"
  startTime: string; // "07:00"
  endTime: string; // "19:00"
  currentTime: string; // "14:35"
  totalBeds: number;
  occupiedBeds: number;
  highComplexityPatients: number;
  nursesRequiredByRegulation: number;
  nursesOnDuty: number;
  dimensioningAlert: boolean; // Alerta de dimensionamento inadequado (identificado no estudo)
}
