# VitaSyn - Plataforma de Telessaúde Premium (MVP 1.0)

A VitaSyn é uma plataforma de alto nível que conecta pacientes a profissionais de saúde por meio de consultas de vídeo seguras.

## Tecnologias Utilizadas

- **Frontend:** React 18, TypeScript, Tailwind CSS
- **Backend/Cloud:** Firebase (Auth, Firestore, Functions), Next.js API Routes (Simulado/Referência)
- **Pagamentos:** Stripe Connect Express (Cobranças e Transferências Separadas)
- **Vídeo:** Integração com Google Meet via Calendar API

## Configuração

1. **Instalar Dependências**
   ```bash
   npm install
   ```

2. **Variáveis de Ambiente**
   Copie `.env.example` para `.env.local` e preencha suas chaves.

3. **Rodar Servidor de Desenvolvimento**
   ```bash
   npm start
   ```

## Funcionalidades Implementadas

1. **Fluxo do Paciente:** Buscar profissionais, ver perfis detalhados, agendar horários, pagar via Stripe (simulação de UI), receber links do Google Meet.
2. **Fluxo do Profissional:** Painel com estatísticas de ganhos, próximas consultas e botão de integração Stripe Connect.
3. **Design System:** Estética personalizada "Bilionária" com tipografia Playfair Display/Inter e paleta de alto contraste.

## Arquitetura Backend (Referência)

A pasta `functions/` contém a lógica para:
- `stripeWebhook`: Processar pagamentos e acionar eventos de calendário.
- `scheduledPayouts`: Job diário para transferir fundos aos profissionais (líquido de taxas).
- `createCalendarEvent`: Gerar links do Google Meet.

## Estrutura do Banco de Dados

Veja `types.ts` para as definições completas em TypeScript do esquema Firestore (`users`, `professionals`, `consultations`).