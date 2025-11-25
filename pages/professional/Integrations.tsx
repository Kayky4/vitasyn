import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { UserRole } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const IntegrationCard = ({ 
    icon, 
    title, 
    description, 
    status, 
    onAction 
}: { 
    icon: React.ReactNode, 
    title: string, 
    description: string, 
    status: 'connected' | 'disconnected', 
    onAction: () => void 
}) => (
    <Card className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-neutral-100 shadow-md hover:shadow-lg transition-shadow">
        <div className="flex gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${status === 'connected' ? 'bg-success/10 text-success' : 'bg-neutral-100 text-neutral-500'}`}>
                {icon}
            </div>
            <div>
                <h3 className="font-bold text-lg text-neutral-900">{title}</h3>
                <p className="text-neutral-500 text-sm max-w-md">{description}</p>
            </div>
        </div>
        <div className="flex flex-col items-end gap-2 w-full md:w-auto">
             {status === 'connected' ? (
                 <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-bold uppercase tracking-wide">
                     <span className="w-2 h-2 rounded-full bg-green-500"></span>
                     Conectado
                 </div>
             ) : (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-500 text-xs font-bold uppercase tracking-wide">
                     Pendente
                 </div>
             )}
             
             {status === 'connected' ? (
                 <Button variant="secondary" size="sm" className="w-full md:w-auto text-danger hover:bg-red-50 hover:border-red-100">Desconectar</Button>
             ) : (
                 <Button size="sm" className="w-full md:w-auto" onClick={onAction}>Conectar Agora</Button>
             )}
        </div>
    </Card>
);

const ProfessionalIntegrations = () => {
  const navigate = useNavigate();
  const [googleStatus, setGoogleStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [stripeStatus, setStripeStatus] = useState<'connected' | 'disconnected'>('disconnected');

  const handleConnectGoogle = () => {
      // Mock OAuth flow
      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const popup = window.open('', 'Google Connect', `width=${width},height=${height},top=${top},left=${left}`);
      if (popup) {
          popup.document.write('<h1>Simulating Google OAuth...</h1><p>Please wait...</p>');
          setTimeout(() => {
              popup.close();
              setGoogleStatus('connected');
              alert("Google Calendar conectado com sucesso!");
          }, 1500);
      }
  };

  const handleConnectStripe = () => {
      alert("Redirecionando para Stripe Connect Onboarding...");
      setTimeout(() => {
          setStripeStatus('connected');
      }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar userRole={UserRole.PROFESSIONAL} isAuthenticated={true} />
      
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
            <button onClick={() => navigate(-1)} className="text-neutral-500 hover:text-neutral-900 text-sm mb-2 flex items-center gap-1">
               ← Voltar para Painel
            </button>
            <h1 className="text-3xl font-bold text-neutral-900">Integrações & Pagamentos</h1>
            <p className="text-neutral-500 mt-1">Conecte suas ferramentas para automatizar sua clínica.</p>
        </div>

        <div className="space-y-6">
            {/* Google Calendar */}
            <IntegrationCard 
                title="Google Calendar"
                description="Sincronize automaticamente suas consultas para gerar links do Google Meet e evitar conflitos de horário."
                status={googleStatus}
                onAction={handleConnectGoogle}
                icon={
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                    </svg>
                }
            />

            {/* Stripe */}
            <IntegrationCard 
                title="Stripe Connect"
                description="Necessário para receber pagamentos dos pacientes. Os repasses são feitos automaticamente para sua conta bancária."
                status={stripeStatus}
                onAction={handleConnectStripe}
                icon={
                    <svg className="w-6 h-6" viewBox="0 0 40 40" fill="currentColor">
                        <path d="M33.9 18.6c0-2.5-2-4.5-5.3-4.5-3.9 0-6.9 2.2-6.9 2.2l-1.3-3.1s2.6-1.6 7.5-1.6c6.8 0 10.9 3.8 10.9 9.1 0 7.6-10.3 7.7-10.3 11.4 0 1.4 1.5 2 3.6 2 3.2 0 6.5-1.8 6.5-1.8l1.2 3.4s-3.3 2.3-8 2.3c-7 0-10.7-3.7-10.7-9.3 0-8.1 10.3-8.2 10.3-11.5 0-1.3-1.4-2-3.5-2-2.8 0-5.1 1.3-5.1 1.3l-1.3-3.4c1.9-1.3 5.2-1.9 8-1.9z"/>
                    </svg>
                }
            />
        </div>
        
        <div className="mt-12 bg-neutral-900 text-neutral-400 p-8 rounded-xl text-sm">
            <h4 className="text-white font-bold mb-2">Segurança e Dados</h4>
            <p>
                A VitaSyn utiliza criptografia de ponta a ponta. Não armazenamos dados do seu cartão de crédito. 
                O acesso ao Google Calendar é restrito apenas para criação e leitura de eventos relacionados à plataforma.
            </p>
        </div>

      </main>
    </div>
  );
};

export default ProfessionalIntegrations;