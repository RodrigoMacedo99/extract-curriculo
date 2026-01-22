# Sistema de Resumo de Currículos - TODO

## Backend & IA
- [x] Criar tabelas Drizzle para armazenar currículos processados
- [x] Implementar procedimento tRPC para enviar dados à IA (Groq/LLaMA)
- [x] Implementar validação de resposta JSON da IA
- [ ] Criar procedimento tRPC para processar lotes de currículos
- [ ] Implementar sistema de cache/status de processamento

## Frontend - Upload & Extração
- [x] Implementar componente de upload de PDF com validação
- [x] Integrar biblioteca de extração de texto de PDF (pdfjs)
- [x] Criar componente de normalização de dados extraídos
- [x] Implementar visualização de dados extraídos antes do processamento

## Frontend - Processamento & IA
- [x] Criar componente de envio para IA com feedback visual
- [x] Implementar sistema de validação de resposta JSON
- [x] Criar interface de revisão de resumos gerados
- [ ] Implementar processamento em lote com progresso

## Frontend - Gerenciamento & Visualização
- [x] Criar painel de gerenciamento com tabela de currículos
- [x] Implementar filtros e busca por candidato/empresa/cargo
- [x] Criar visualização de detalhes do currículo processado
- [x] Implementar exclusão e edição de currículos

## Armazenamento & Exportação
- [ ] Integrar SQLite WASM para armazenamento local
- [x] Implementar sincronização com banco de dados do servidor
- [x] Criar funcionalidade de exportação para Excel (.xlsx)
- [x] Implementar download de planilhas com formatação

## Testes & Documentação
- [x] Escrever testes para procedimentos tRPC
- [ ] Testar extração de PDF com diferentes formatos
- [x] Testar validação de resposta da IA
- [x] Criar documentação do prompt da IA
- [ ] Documentar fluxo de processamento

## UI/UX
- [x] Definir paleta de cores e design system
- [x] Criar layout responsivo
- [x] Implementar feedback visual (loading, sucesso, erro)
- [x] Adicionar notificações de status
