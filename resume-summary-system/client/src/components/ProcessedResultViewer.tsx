import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AIResumeResponse } from "@shared/types";
import { Download, ArrowLeft } from "lucide-react";

interface ProcessedResultViewerProps {
  result: AIResumeResponse;
  candidateName?: string;
  onBack: () => void;
  onExport?: () => void;
}

export function ProcessedResultViewer({
  result,
  candidateName,
  onBack,
  onExport,
}: ProcessedResultViewerProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Resultado do Processamento</h2>
          {candidateName && <p className="text-gray-600 mt-1">{candidateName}</p>}
        </div>
        <div className="flex gap-2">
          {onExport && (
            <Button onClick={onExport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          )}
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>

      {/* Habilidades Resumidas */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Habilidades Resumidas</h3>
        <div className="space-y-2">
          {result.resumo_habilidades.map((skill, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
            >
              <span className="text-blue-600 font-semibold text-sm mt-0.5">•</span>
              <p className="text-gray-700">{skill}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Experiências Resumidas */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Experiências Profissionais</h3>
        <div className="space-y-4">
          {result.experiencias_resumidas.map((exp, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="mb-3">
                <h4 className="font-semibold text-gray-900">{exp.cargo}</h4>
                <p className="text-sm text-gray-600">
                  {exp.empresa} • {exp.periodo}
                </p>
              </div>
              <div className="space-y-2">
                {exp.responsabilidades.map((resp, respIndex) => (
                  <div key={respIndex} className="flex items-start gap-3">
                    <span className="text-gray-400 text-sm mt-0.5">◦</span>
                    <p className="text-gray-700 text-sm">{resp}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Informações de Processamento */}
      <Card className="p-4 bg-green-50 border border-green-200">
        <p className="text-sm text-green-800">
          ✓ Currículo processado com sucesso pela IA. Os dados foram normalizados e estão prontos para
          exportação.
        </p>
      </Card>
    </div>
  );
}
