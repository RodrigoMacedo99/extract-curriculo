import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PDFUploader } from "@/components/PDFUploader";
import { NormalizedDataViewer } from "@/components/NormalizedDataViewer";
import { ProcessedResultViewer } from "@/components/ProcessedResultViewer";
import { ResumeList } from "@/components/ResumeList";
import { DadosNormalizados, AIResumeResponse, Resume } from "@shared/types";
import { Loader2, LogOut } from "lucide-react";
// XLSX will be imported dynamically when needed

type Step = "list" | "upload" | "normalize" | "result";

export default function Home() {
  const { user, loading: authLoading, isAuthenticated, logout, getLoginUrl } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>("list");
  const [normalizedData, setNormalizedData] = useState<DadosNormalizados | null>(null);
  const [processedResult, setProcessedResult] = useState<AIResumeResponse | null>(null);
  const [currentResume, setCurrentResume] = useState<Resume | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Queries
  const { data: resumes = [], isLoading: resumesLoading, refetch: refetchResumes } = trpc.resume.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Mutations
  const processWithAI = trpc.resume.processWithAI.useMutation();
  const deleteResume = trpc.resume.delete.useMutation();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4">Sistema de Resumo de Currículos</h1>
          <p className="text-gray-600 mb-6">Processe e organize currículos com IA de forma automatizada.</p>
          <Button onClick={() => (window.location.href = getLoginUrl())} className="w-full">
            Fazer Login
          </Button>
        </Card>
      </div>
    );
  }

  const handleExtractedData = (data: DadosNormalizados) => {
    setNormalizedData(data);
    setCurrentStep("normalize");
    setError(null);
  };

  const handleProcessWithAI = async () => {
    if (!normalizedData) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await processWithAI.mutateAsync({
        candidateName: normalizedData.candidateName,
        email: normalizedData.email,
        phone: normalizedData.phone,
        habilidades_brutas: normalizedData.habilidades_brutas,
        experiencias_brutas: normalizedData.experiencias_brutas,
      });

      setProcessedResult(result.result);
      setCurrentStep("result");
      await refetchResumes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar currículo");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteResume = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este currículo?")) return;

    try {
      await deleteResume.mutateAsync({ id });
      await refetchResumes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao deletar currículo");
    }
  };

  const handleViewResume = (resume: Resume) => {
    setCurrentResume(resume);
    const experienciasResumidas = typeof resume.experienciasResumidas === 'string' 
      ? JSON.parse(resume.experienciasResumidas) 
      : (resume.experienciasResumidas || []);
    const resumoHabilidades = typeof resume.resumoHabilidades === 'string'
      ? JSON.parse(resume.resumoHabilidades)
      : (resume.resumoHabilidades || []);

    setProcessedResult({
      resumo_habilidades: Array.isArray(resumoHabilidades) ? resumoHabilidades : [],
      experiencias_resumidas: Array.isArray(experienciasResumidas) ? experienciasResumidas : [],
    });
    setCurrentStep("result");
  };

  const handleExportResume = async (resume: Resume) => {
    try {
      // Importar XLSX dinamicamente
      const XLSX = await import('xlsx');
      
      const experienciasResumidas = typeof resume.experienciasResumidas === 'string'
        ? JSON.parse(resume.experienciasResumidas)
        : (resume.experienciasResumidas || []);
      const resumoHabilidades = typeof resume.resumoHabilidades === 'string'
        ? JSON.parse(resume.resumoHabilidades)
        : (resume.resumoHabilidades || []);

      // Criar workbook
      const wb = XLSX.utils.book_new();

      // Aba 1: Dados Pessoais
      const personalData = [
        ["Dados Pessoais"],
        ["Nome", resume.candidateName || "N/A"],
        ["Email", resume.email || "N/A"],
        ["Telefone", resume.phone || "N/A"],
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(personalData);
      XLSX.utils.book_append_sheet(wb, ws1, "Dados Pessoais");

      // Aba 2: Habilidades
      const skillsData = [["Habilidades"], ...(Array.isArray(resumoHabilidades) ? resumoHabilidades.map((h: string) => [h]) : [])];
      const ws2 = XLSX.utils.aoa_to_sheet(skillsData);
      XLSX.utils.book_append_sheet(wb, ws2, "Habilidades");

      // Aba 3: Experiências
      const expData: any[] = [
        ["Empresa", "Cargo", "Período", "Responsabilidades"],
        ...(Array.isArray(experienciasResumidas) ? experienciasResumidas.map((exp: any) => [
          exp.empresa || "",
          exp.cargo || "",
          exp.periodo || "",
          Array.isArray(exp.responsabilidades) ? exp.responsabilidades.join("; ") : "",
        ]) : []),
      ];
      const ws3 = XLSX.utils.aoa_to_sheet(expData);
      XLSX.utils.book_append_sheet(wb, ws3, "Experiências");

      // Salvar arquivo
      const fileName = `${resume.candidateName || "resume"}_${new Date().getTime()}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao exportar currículo");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Resumo de Currículos</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <Button onClick={logout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <Card className="mb-6 p-4 bg-red-50 border border-red-200">
            <p className="text-red-800">{error}</p>
            <Button
              onClick={() => setError(null)}
              variant="ghost"
              size="sm"
              className="mt-2"
            >
              Fechar
            </Button>
          </Card>
        )}

        {/* Tabs Navigation */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          <Button
            onClick={() => setCurrentStep("list")}
            variant={currentStep === "list" ? "default" : "ghost"}
            className="rounded-b-none"
          >
            Meus Currículos
          </Button>
          <Button
            onClick={() => setCurrentStep("upload")}
            variant={currentStep === "upload" ? "default" : "ghost"}
            className="rounded-b-none"
          >
            Novo Currículo
          </Button>
        </div>

        {/* Content */}
        {currentStep === "list" && (
          <ResumeList
            resumes={resumes}
            onView={handleViewResume}
            onDelete={handleDeleteResume}
            onExport={handleExportResume}
            isLoading={resumesLoading}
          />
        )}

        {currentStep === "upload" && (
          <div className="space-y-6">
            <PDFUploader
              onExtracted={handleExtractedData}
              isProcessing={isProcessing}
            />
          </div>
        )}

        {currentStep === "normalize" && normalizedData && (
          <NormalizedDataViewer
            data={normalizedData}
            onUpdate={setNormalizedData}
            onProcess={handleProcessWithAI}
            isProcessing={isProcessing}
          />
        )}

        {currentStep === "result" && processedResult && (
          <ProcessedResultViewer
            result={processedResult}
            candidateName={(normalizedData?.candidateName || currentResume?.candidateName) || undefined}
            onBack={() => setCurrentStep("list")}
            onExport={currentResume ? () => void handleExportResume(currentResume) : undefined}
          />
        )}
      </main>
    </div>
  );
}
