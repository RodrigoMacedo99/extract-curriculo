import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { DadosNormalizados } from "@shared/types";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFUploaderProps {
  onExtracted: (data: DadosNormalizados) => void;
  isProcessing?: boolean;
}

export function PDFUploader({ onExtracted, isProcessing = false }: PDFUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const extractTextFromPDF = async (pdfFile: File): Promise<string> => {
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = "";

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n";
      }

      return fullText;
    } catch (err) {
      throw new Error("Erro ao extrair texto do PDF");
    }
  };

  const normalizeData = (rawText: string): DadosNormalizados => {
    // Simples normalização - em produção, isso seria mais sofisticado
    const lines = rawText.split("\n").filter((line) => line.trim());

    // Extrair habilidades (procura por palavras-chave comuns)
    const skillKeywords = [
      "JavaScript",
      "React",
      "Node.js",
      "Python",
      "Java",
      "SQL",
      "MongoDB",
      "Docker",
      "Git",
      "AWS",
      "TypeScript",
      "HTML",
      "CSS",
      "REST",
      "GraphQL",
    ];

    const habilidades_brutas = skillKeywords.filter((skill) =>
      rawText.toLowerCase().includes(skill.toLowerCase())
    );

    // Extrair experiências (procura por padrões de data)
    const experiencias_brutas = [];
    const experienciaPattern = /(\w+(?:\s+\w+)*)\s+(?:at|em|na|no)\s+(\w+(?:\s+\w+)*)\s*\(([^)]+)\)/gi;

    let match;
    while ((match = experienciaPattern.exec(rawText)) !== null) {
      experiencias_brutas.push({
        cargo: match[1],
        empresa: match[2],
        periodo: match[3],
        descricao_texto: "",
      });
    }

    return {
      habilidades_brutas: habilidades_brutas.length > 0 ? habilidades_brutas : ["Não identificadas"],
      experiencias_brutas,
    };
  };

  const handleFileSelect = async (selectedFile: File | null) => {
    if (!selectedFile) return;

    setError(null);
    setSuccess(false);

    // Validar tipo de arquivo
    if (selectedFile.type !== "application/pdf") {
      setError("Por favor, selecione um arquivo PDF válido");
      return;
    }

    // Validar tamanho
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("O arquivo deve ter no máximo 10MB");
      return;
    }

    setFile(selectedFile);
    setExtracting(true);

    try {
      const rawText = await extractTextFromPDF(selectedFile);
      const normalizedData = normalizeData(rawText);

      setSuccess(true);
      onExtracted(normalizedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar PDF");
      setFile(null);
    } finally {
      setExtracting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles[0]);
    }
  };

  return (
    <Card className="w-full p-8">
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
          className="hidden"
          disabled={extracting || isProcessing}
        />

        {extracting ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm font-medium text-gray-700">Extraindo texto do PDF...</p>
          </div>
        ) : success && file ? (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
            <p className="text-sm font-medium text-gray-700">{file.name}</p>
            <p className="text-xs text-gray-500">Arquivo carregado com sucesso</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-8 h-8 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">Arraste um PDF ou clique para selecionar</p>
            <p className="text-xs text-gray-500">Máximo 10MB</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {file && success && (
        <div className="mt-4">
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full">
            Selecionar outro PDF
          </Button>
        </div>
      )}
    </Card>
  );
}
