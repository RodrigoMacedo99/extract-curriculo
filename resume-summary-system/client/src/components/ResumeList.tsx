import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Resume } from "@shared/types";
import { Trash2, Eye, Download, Search } from "lucide-react";
import { useState, useMemo } from "react";

interface ResumeListProps {
  resumes: Resume[];
  onView: (resume: Resume) => void;
  onDelete: (id: number) => void;
  onExport: (resume: Resume) => void;
  isLoading?: boolean;
}

export function ResumeList({ resumes, onView, onDelete, onExport, isLoading = false }: ResumeListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredResumes = useMemo(() => {
    return resumes.filter((resume) => {
      const matchesSearch =
        resume.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resume.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resume.fileName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || resume.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [resumes, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pendente" },
      extracting: { bg: "bg-blue-100", text: "text-blue-800", label: "Extraindo" },
      normalizing: { bg: "bg-blue-100", text: "text-blue-800", label: "Normalizando" },
      processing: { bg: "bg-blue-100", text: "text-blue-800", label: "Processando" },
      completed: { bg: "bg-green-100", text: "text-green-800", label: "Concluído" },
      error: { bg: "bg-red-100", text: "text-red-800", label: "Erro" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome, email ou arquivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">Todos os status</option>
          <option value="completed">Concluído</option>
          <option value="processing">Processando</option>
          <option value="error">Erro</option>
        </select>
      </div>

      {/* Lista de Currículos */}
      {isLoading ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">Carregando currículos...</p>
        </Card>
      ) : filteredResumes.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">
            {resumes.length === 0 ? "Nenhum currículo processado ainda" : "Nenhum resultado encontrado"}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredResumes.map((resume) => (
            <Card key={resume.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {resume.candidateName || "Sem nome"}
                    </h3>
                    {getStatusBadge(resume.status)}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    {resume.email && <p>Email: {resume.email}</p>}
                    <p>Arquivo: {resume.fileName}</p>
                    <p>Processado em: {new Date(resume.processedAt || resume.createdAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                  {resume.errorMessage && (
                    <p className="text-sm text-red-600 mt-2">Erro: {resume.errorMessage}</p>
                  )}
                </div>

                {/* Ações */}
                <div className="flex gap-2 flex-shrink-0">
                  {resume.status === "completed" && (
                    <>
                      <Button
                        onClick={() => onView(resume)}
                        variant="outline"
                        size="sm"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => onExport(resume)}
                        variant="outline"
                        size="sm"
                        title="Exportar"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => onDelete(resume.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    title="Deletar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
