
// Enums
export enum UserRole {
  PATIENT = 'patient',
  PROFESSIONAL = 'professional',
  ADMIN = 'admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
  ARCHIVED = 'archived'
}

export enum SubscriptionPlan {
  FREE = 'free',
  PLUS = 'plus',
  ELITE = 'elite'
}

export enum ConsultationStatus {
  PENDING = 'pending',
  PAID = 'paid',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum TransactionType {
  PAYMENT = 'payment',    // Entrada (Consulta)
  PAYOUT = 'payout',      // Saída (Transferência para conta)
  REFUND = 'refund',      // Estorno
  ADJUSTMENT = 'adjustment', // Ajuste de sistema
  SUBSCRIPTION = 'subscription' // Mensalidade da plataforma
}

export enum TransactionStatus {
  COMPLETED = 'completed',
  PROCESSING = 'processing',
  FAILED = 'failed',
  PENDING = 'pending'
}

// Interfaces
export interface ClinicalData {
  height?: number; // em cm
  weight?: number; // em kg
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
  notes?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  status?: UserStatus; // Novo campo de controle
  subscription?: SubscriptionPlan; // Novo campo de assinatura
  joinedAt?: string; // Data de cadastro

  // Campos estendidos do Paciente
  cpf?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  
  // Novo: Dados Clínicos (Health ID)
  clinical?: ClinicalData;
  
  credits: {
    balance_cents: number;
  };
}

export interface ProfessionalProfile {
  id: string; // same as uid
  userRef: string; // reference to user doc
  name: string; // denormalized for easier access
  email: string;
  status?: UserStatus; // Controle administrativo
  
  // Campos Profissionais Obrigatórios
  professionalType: 'Nutricionista' | 'Fisioterapeuta' | 'Psicólogo' | string;
  registrationNumber: string; // CRP, CRM, etc.
  cpf: string; // Identificador sensível
  
  // Campos do Perfil Público
  title: string; // Ex: Psicólogo Clínico
  bio: string;
  specialties: string[];
  price_default_cents: number;
  avatarUrl?: string;
  
  // Sistema
  isOnline?: boolean; // Novo campo de status
  availability: any; // Tipagem flexível para suportar migração
  connected_account_id?: string;
  onboarding_complete: boolean;
  google_refresh_token?: string;
  
  // Configs
  sessionDuration?: number;
  bufferTime?: number;
}

export interface Consultation {
  id: string;
  patientId: string;
  professionalId: string;
  professionalName: string;
  patientName?: string;
  start_at: string; // ISO string
  end_at: string; // ISO string
  status: ConsultationStatus;
  price_cents: number;
  meeting?: {
    calendarEventId: string;
    meetLink: string;
  };
  payment?: {
    chargeId: string;
    paid_at: string;
  };
  created_at?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount_cents: number;
  status: TransactionStatus;
  created_at: string;
  description: string;
  related_entity_id?: string; // ID da consulta ou do paciente
  related_entity_name?: string; // Nome do paciente ou "Transferência Bancária"
}

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  read: boolean;
  created_at: string;
}

// --- Admin Specific Types ---

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string; // ex: 'suspend_user', 'refund_transaction'
  targetId?: string;
  details: string;
  timestamp: string;
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  message: string;
  targetAudience: 'all' | 'patients' | 'professionals' | 'single_user';
  targetUserId?: string; // Se for single_user
  priority: 'low' | 'normal' | 'high';
  expiresAt?: string;
  createdAt: string;
  active: boolean;
}
