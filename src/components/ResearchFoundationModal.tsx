import React from 'react';
import { BookOpen, ShieldAlert, Award, FileText, CheckCircle, ExternalLink, Activity, Heart, Users } from 'lucide-react';
import { projectScientificRationale } from '../data/mockData';

interface ResearchFoundationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResearchFoundationModal: React.FC<ResearchFoundationModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/90 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Fundamentação Científica da Proposta
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                {projectScientificRationale.title}
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

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto text-xs sm:text-sm text-slate-300 leading-relaxed">
          {/* Keywords */}
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Palavras-chave do Projeto:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {projectScientificRationale.keywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-medium"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Research Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
              <h4 className="font-bold text-slate-100 text-xs sm:text-sm flex items-center gap-2 text-cyan-400 mb-1.5">
                <FileText className="w-4 h-4" /> Introdução & Problematização
              </h4>
              <p className="text-xs text-slate-300 leading-normal">
                O trabalho da enfermagem é fundamental para os hospitais e a qualidade da assistência.
                Porém, enfrenta alta carga de trabalho, longas jornadas e elevada demanda, especialmente nas UTIs.
                Identificar os fatores determinantes é crucial para mitigar impactos físicos, emocionais e psicológicos.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
              <h4 className="font-bold text-slate-100 text-xs sm:text-sm flex items-center gap-2 text-emerald-400 mb-1.5">
                <Award className="w-4 h-4" /> Objetivos da Proposta
              </h4>
              <p className="text-xs text-slate-300 leading-normal">
                Promover estratégias tecnológicas e gerenciais para reduzir os impactos da sobrecarga dos plantões,
                estimulando pausas de recuperação, bem-estar profissional e, consequentemente, elevando a segurança
                e a humanização do cuidado ao paciente e seus familiares.
              </p>
            </div>
          </div>

          {/* Core Findings Table */}
          <div>
            <h4 className="font-bold text-slate-100 text-sm mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Fatores de Sobrecarga na UTI e Soluções Tecnológicas Implementadas
            </h4>
            <div className="space-y-2.5">
              {projectScientificRationale.coreFindings.map((finding, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl"
                >
                  <div className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                    {finding.factor}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    {finding.description}
                  </p>
                  <div className="mt-2 text-xs bg-slate-900/90 text-cyan-300 p-2 rounded-lg border border-slate-800 flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Implementação no App:</strong> {finding.solution}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expected Results & Conclusion */}
          <div className="p-4 bg-gradient-to-r from-slate-850 to-slate-800 border border-cyan-500/30 rounded-2xl">
            <h4 className="font-bold text-slate-100 text-xs sm:text-sm text-cyan-300 mb-1">
              Conclusão e Impacto na Assistência
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              A sobrecarga da enfermagem compromete a saúde dos profissionais e a segurança dos pacientes.
              A integração entre o <strong>relógio inteligente com detecção precoce de taquicardia/baixa VFC</strong> e
              o <strong>aplicativo de gestão de escalas com histórico das aferições</strong> viabiliza pausas planejadas
              sem desfalcar o setor, garantindo que o cuidado intensivo permaneça seguro e humanizado.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-850 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-xs transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
