import React from 'react';
import { Wind, Coffee, Heart, Clock, Sparkles, CheckCircle2 } from 'lucide-react';

interface SmartBreakGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartBreathingBreak: () => void;
}

export const SmartBreakGuideModal: React.FC<SmartBreakGuideModalProps> = ({
  isOpen,
  onClose,
  onStartBreathingBreak,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/90 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        <div className="p-5 border-b border-slate-800 bg-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Protocolos Clínicos de Recuperação
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                Pausas Estratégicas Baseadas em Evidências
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto text-xs sm:text-sm text-slate-300">
          <p className="text-xs text-slate-400 leading-relaxed">
            As pausas estratégicas são sugeridas automaticamente pelo relógio inteligente assim que os limiares de sobrecarga
            (elevação de FC, queda de VFC ou excesso de alarmes) são ultrapassados. Conheça as 3 modalidades integradas:
          </p>

          <div className="space-y-3">
            {/* 1. Micro-pausa */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-cyan-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-cyan-300 text-sm">
                  <Wind className="w-4 h-4 text-cyan-400" />
                  1. Micro-Pausa de Respiração Guiada (Box Breathing)
                </div>
                <span className="text-xs font-mono font-semibold bg-cyan-950 px-2 py-0.5 rounded text-cyan-400 border border-cyan-800">
                  3 minutos
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Ciclos de 4s inspirando, 4s retendo, 4s expirando e 4s em repouso.
                Estimula diretamente o nervo vago e o sistema nervoso parassimpático, reduzindo taquicardias induzidas por estresse agudo
                (como após intercorrências ou procedimentos críticos na UTI).
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Redução comprovada de 15 a 25 BPM
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onStartBreathingBreak();
                  }}
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-xs"
                >
                  Iniciar no Relógio
                </button>
              </div>
            </div>

            {/* 2. Descompressão */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-amber-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                  <Coffee className="w-4 h-4 text-amber-400" />
                  2. Pausa de Descompressão Sensorial & Hidratação
                </div>
                <span className="text-xs font-mono font-semibold bg-amber-950 px-2 py-0.5 rounded text-amber-400 border border-amber-800">
                  10 minutos
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Afastamento temporário do ambiente acústico da UTI (bombas de infusão e monitores de sinais vitais) em sala de descanso silenciosa.
                Inclui ingestão de água para mitigar a desidratação decorrente do uso contínuo de EPIs hospitalares.
              </p>
              <div className="mt-2 text-[11px] text-slate-400">
                Gatilho: Acúmulo de mais de 50 alarmes atendidos ou 3h ininterruptas de plantão.
              </div>
            </div>

            {/* 3. Repouso Muscular */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-purple-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-purple-300 text-sm">
                  <Heart className="w-4 h-4 text-purple-400" />
                  3. Pausa de Recuperação Postural & Repouso Físico
                </div>
                <span className="text-xs font-mono font-semibold bg-purple-950 px-2 py-0.5 rounded text-purple-400 border border-purple-800">
                  15 a 20 minutos
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Alívio postural para prevenção de distúrbios osteomusculares (DORT/LER) comuns na enfermagem.
                O relógio sincroniza automaticamente a escala do plantão para que o colega de dupla cubra os leitos sem desassistência ao paciente crítico.
              </p>
              <div className="mt-2 text-[11px] text-slate-400">
                Gatilho: Mais de 4 horas em pé contínuas ou índice de sobrecarga &gt; 80%.
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-850 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-xl text-xs transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
