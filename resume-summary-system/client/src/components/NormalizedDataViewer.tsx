import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DadosNormalizados, ExperienciaBruta } from "@shared/types";
import { useState } from "react";
import { Trash2, Plus } from "lucide-react";

interface NormalizedDataViewerProps {
  data: DadosNormalizados;
  onUpdate: (data: DadosNormalizados) => void;
  onProcess: () => void;
  isProcessing?: boolean;
}

export function NormalizedDataViewer({
  data,
  onUpdate,
  onProcess,
  isProcessing = false,
}: NormalizedDataViewerProps) {
  const [editingData, setEditingData] = useState(data);

  const handleCandidateNameChange = (value: string) => {
    setEditingData({ ...editingData, candidateName: value });
  };

  const handleEmailChange = (value: string) => {
    setEditingData({ ...editingData, email: value });
  };

  const handlePhoneChange = (value: string) => {
    setEditingData({ ...editingData, phone: value });
  };

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...editingData.habilidades_brutas];
    newSkills[index] = value;
    setEditingData({ ...editingData, habilidades_brutas: newSkills });
  };

  const handleAddSkill = () => {
    setEditingData({
      ...editingData,
      habilidades_brutas: [...editingData.habilidades_brutas, ""],
    });
  };

  const handleRemoveSkill = (index: number) => {
    setEditingData({
      ...editingData,
      habilidades_brutas: editingData.habilidades_brutas.filter((_, i) => i !== index),
    });
  };

  const handleExperienceChange = (index: number, field: keyof ExperienciaBruta, value: string) => {
    const newExperiences = [...editingData.experiencias_brutas];
    newExperiences[index] = { ...newExperiences[index], [field]: value };
    setEditingData({ ...editingData, experiencias_brutas: newExperiences });
  };

  const handleAddExperience = () => {
    setEditingData({
      ...editingData,
      experiencias_brutas: [
        ...editingData.experiencias_brutas,
        { cargo: "", empresa: "", periodo: "", descricao_texto: "" },
      ],
    });
  };

  const handleRemoveExperience = (index: number) => {
    setEditingData({
      ...editingData,
      experiencias_brutas: editingData.experiencias_brutas.filter((_, i) => i !== index),
    });
  };

  const handleSaveAndProcess = () => {
    onUpdate(editingData);
    onProcess();
  };

  return (
    <div className="space-y-6">
      {/* Dados Pessoais */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Dados Pessoais</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="candidateName">Nome do Candidato</Label>
            <Input
              id="candidateName"
              value={editingData.candidateName || ""}
              onChange={(e) => handleCandidateNameChange(e.target.value)}
              placeholder="Nome completo"
              disabled={isProcessing}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editingData.email || ""}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="email@example.com"
                disabled={isProcessing}
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={editingData.phone || ""}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(11) 99999-9999"
                disabled={isProcessing}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Habilidades */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Habilidades</h3>
          <Button
            onClick={handleAddSkill}
            variant="outline"
            size="sm"
            disabled={isProcessing}
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </div>
        <div className="space-y-2">
          {editingData.habilidades_brutas.map((skill, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={skill}
                onChange={(e) => handleSkillChange(index, e.target.value)}
                placeholder="Ex: JavaScript, React, Node.js"
                disabled={isProcessing}
              />
              <Button
                onClick={() => handleRemoveSkill(index)}
                variant="ghost"
                size="sm"
                disabled={isProcessing}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Experiências */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Experiências Profissionais</h3>
          <Button
            onClick={handleAddExperience}
            variant="outline"
            size="sm"
            disabled={isProcessing}
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </div>
        <div className="space-y-6">
          {editingData.experiencias_brutas.map((exp, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Cargo</Label>
                  <Input
                    value={exp.cargo}
                    onChange={(e) => handleExperienceChange(index, "cargo", e.target.value)}
                    placeholder="Ex: Senior Developer"
                    disabled={isProcessing}
                  />
                </div>
                <div>
                  <Label>Empresa</Label>
                  <Input
                    value={exp.empresa}
                    onChange={(e) => handleExperienceChange(index, "empresa", e.target.value)}
                    placeholder="Ex: Tech Company"
                    disabled={isProcessing}
                  />
                </div>
              </div>
              <div>
                <Label>Período</Label>
                <Input
                  value={exp.periodo}
                  onChange={(e) => handleExperienceChange(index, "periodo", e.target.value)}
                  placeholder="Ex: 2020-2023"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={exp.descricao_texto}
                  onChange={(e) => handleExperienceChange(index, "descricao_texto", e.target.value)}
                  placeholder="Descreva as responsabilidades e atividades..."
                  rows={4}
                  disabled={isProcessing}
                />
              </div>
              <Button
                onClick={() => handleRemoveExperience(index)}
                variant="destructive"
                size="sm"
                disabled={isProcessing}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Remover
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Botão de Processamento */}
      <div className="flex gap-3">
        <Button
          onClick={handleSaveAndProcess}
          className="flex-1"
          disabled={isProcessing || editingData.habilidades_brutas.length === 0}
        >
          {isProcessing ? "Processando..." : "Processar com IA"}
        </Button>
      </div>
    </div>
  );
}
