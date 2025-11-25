
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Navbar } from '../components/Navbar';
import { Card } from '../components/ui/Card';

// --- Assets & Icons ---
const Icons = {
  Check: () => <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
  X: () => <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
  Video: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  Shield: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Chart: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  Wallet: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  ArrowRight: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>,
  ChevronDown: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>,
  Lightning: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Calendar: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
};

const FAQS = [
  { q: "Preciso pagar mensalidade para usar?", a: "Não. A VitaSyn opera no modelo de sucesso compartilhado. Não cobramos adesão nem mensalidade fixa. Você utiliza toda a infraestrutura gratuitamente e apenas uma taxa administrativa de 15% é descontada sobre as consultas realizadas." },
  { q: "Como e quando recebo meus pagamentos?", a: "Nossa integração bancária é automática. O valor da consulta (descontada a taxa) fica disponível em sua carteira digital e é transferido para sua conta bancária cadastrada em D+2 (2 dias úteis após o atendimento)." },
  { q: "A plataforma está adequada à LGPD e HIPAA?", a: "Sim. Segurança é nosso pilar central. Utilizamos criptografia de ponta a ponta para vídeo e armazenamento de dados clínicos, garantindo conformidade total com as leis de proteção de dados." },
  { q: "Sou recém-formado, posso me cadastrar?", a: "Com certeza. A VitaSyn é o ambiente ideal para construir sua base de pacientes sem os custos proibitivos de montar um consultório físico. Basta ter seu registro profissional ativo." },
];

// --- Styles for Animation ---
const styles = `
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .animate-blob { animation: blob 7s infinite; }
  .animation-delay-2000 { animation-delay: 2s; }
  .animation-delay-4000 { animation-delay: 4s; }
`;

// --- Components ---

const StepCard = ({ number, title, desc }: { number: string, title: string, desc: string }) => (
    <div className="flex flex-col items-center text-center p-6 rounded-3xl border border-neutral-100 bg-white shadow-sm hover:shadow-md transition-shadow group">
        <div className="w-14 h-14 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-bold text-xl mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
            {number}
        </div>
        <h4 className="font-bold text-xl text-neutral-900 mb-3">{title}</h4>
        <p className="text-neutral-500 text-sm leading-relaxed">{desc}</p>
    </div>
);

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="flex flex-col p-6 rounded-2xl bg-neutral-50 border border-neutral-100 hover:bg-white hover:shadow-lg transition-all duration-300 group">
        <div className="w-12 h-12 rounded-xl bg-white border border-neutral-100 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform shadow-sm">
            {icon}
        </div>
        <h3 className="font-bold text-lg text-neutral-900 mb-2">{title}</h3>
        <p className="text-neutral-500 text-sm leading-relaxed">{desc}</p>
    </div>
);

const ComparisonRow = ({ feature, vitasyn, traditional, generic }: any) => (
    <div className="grid grid-cols-4 gap-4 py-4 border-b border-neutral-100 items-center">
        <div className="col-span-1 font-medium text-neutral-700 text-sm">{feature}</div>
        <div className="col-span-1 text-center font-bold text-primary bg-primary/5 py-2 rounded-lg">{vitasyn}</div>
        <div className="col-span-1 text-center text-neutral-400 text-sm">{traditional}</div>
        <div className="col-span-1 text-center text-neutral-400 text-sm">{generic}</div>
    </div>
);

const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <style>{styles}</style>
      <Navbar userRole={null} isAuthenticated={false} />
      
      {/* =========================================
          HERO SECTION (The Promise)
      ========================================= */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none">
            <div className="absolute top-0 right-10 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
            <div className="absolute top-20 left-10 w-80 h-80 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            {/* Early Access Badge */}
            <div className="inline-flex items-center gap-2 bg-neutral-900 text-white rounded-full px-4 py-1.5 shadow-xl shadow-neutral-900/10 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold tracking-wide uppercase">Lançamento Exclusivo</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-neutral-900 tracking-tight leading-[1.1] mb-6 max-w-5xl mx-auto">
                Maximize seus Ganhos.<br />
                Elimine a Burocracia. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">A Clínica do Futuro é Digital.</span>
            </h1>
            
            <p className="text-xl text-neutral-500 mb-10 max-w-3xl mx-auto leading-relaxed">
                A plataforma definitiva para <strong className="text-neutral-900">Psicólogos, Nutricionistas e Fisioterapeutas</strong> gerenciarem atendimentos, finanças e pacientes em um só lugar. Sem custos fixos.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <Link to="/auth?role=professional&mode=signup">
                    <Button size="lg" className="rounded-xl h-14 px-10 text-lg shadow-xl shadow-primary/30 w-full sm:w-auto">
                        Criar Perfil Profissional
                    </Button>
                </Link>
                <p className="text-sm text-neutral-400 font-medium sm:hidden">Comece grátis. Cancele quando quiser.</p>
                <div className="hidden sm:flex items-center gap-2 text-sm text-neutral-500 bg-neutral-50 px-4 py-4 rounded-xl border border-neutral-100 h-14">
                    <Icons.Check /> Pagamento apenas sobre o sucesso
                </div>
            </div>

            {/* Platform Preview Mockup */}
            <div className="relative max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10 border border-neutral-200/60 bg-white">
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 pointer-events-none z-10"></div>
                 <div className="bg-neutral-50 border-b border-neutral-100 p-3 flex items-center gap-2">
                     <div className="flex gap-1.5">
                         <div className="w-3 h-3 rounded-full bg-red-400"></div>
                         <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                         <div className="w-3 h-3 rounded-full bg-green-400"></div>
                     </div>
                     <div className="mx-auto bg-white border border-neutral-200 rounded-md px-3 py-1 text-[10px] text-neutral-400 font-mono">vitasyn.app/dashboard</div>
                 </div>
                 {/* Abstract UI Representation */}
                 <div className="p-8 grid grid-cols-12 gap-6 bg-white min-h-[400px]">
                     {/* Sidebar */}
                     <div className="col-span-2 hidden md:block space-y-3">
                         <div className="h-8 w-8 bg-primary rounded-lg mb-6"></div>
                         <div className="h-2 w-16 bg-neutral-100 rounded-full"></div>
                         <div className="h-2 w-12 bg-neutral-100 rounded-full"></div>
                         <div className="h-2 w-20 bg-neutral-100 rounded-full"></div>
                     </div>
                     {/* Main Content */}
                     <div className="col-span-12 md:col-span-7 space-y-4">
                         <div className="flex justify-between items-center mb-4">
                            <div className="h-8 w-32 bg-neutral-100 rounded-lg"></div>
                            <div className="h-8 w-8 bg-neutral-100 rounded-full"></div>
                         </div>
                         <div className="h-32 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100"></div>
                         <div className="grid grid-cols-2 gap-4">
                             <div className="h-24 bg-neutral-50 rounded-2xl"></div>
                             <div className="h-24 bg-neutral-50 rounded-2xl"></div>
                         </div>
                     </div>
                     {/* Right Panel */}
                     <div className="col-span-3 hidden md:block space-y-4">
                         <div className="h-40 bg-neutral-900 rounded-2xl"></div>
                         <div className="h-20 bg-neutral-50 rounded-2xl"></div>
                     </div>
                 </div>
            </div>
        </div>
      </section>

      {/* =========================================
          TRUST BAR (Infrastructure)
      ========================================= */}
      <section className="border-y border-neutral-100 bg-[#F9FAFB]/50 py-10">
          <div className="max-w-7xl mx-auto px-6 text-center">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-6">Infraestrutura Global para sua Clínica Local</p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                  <h3 className="text-lg font-bold text-neutral-600 flex items-center gap-2"><span className="text-blue-500">Google</span> Cloud</h3>
                  <h3 className="text-lg font-bold text-neutral-600 flex items-center gap-2"><span className="text-indigo-500">Stripe</span> Connect</h3>
                  <h3 className="text-lg font-bold text-neutral-600 flex items-center gap-2">HIPAA <span className="text-green-500">Compliant</span></h3>
                  <h3 className="text-lg font-bold text-neutral-600 flex items-center gap-2">SSL <span className="text-orange-500">Secure 256-bit</span></h3>
              </div>
          </div>
      </section>

      {/* =========================================
          KEY FEATURES (Diferenciais)
      ========================================= */}
      <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
              <div className="text-center max-w-3xl mx-auto mb-16">
                  <span className="text-primary font-bold uppercase tracking-wider text-xs">Por que a VitaSyn?</span>
                  <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-6 mt-2 tracking-tight">Tudo que você precisa.<br/>Nada que te atrapalhe.</h2>
                  <p className="text-lg text-neutral-500">Desenvolvemos ferramentas específicas para otimizar a rotina clínica.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FeatureCard 
                      icon={<Icons.Wallet />} 
                      title="Gestão Financeira Automática" 
                      desc="Split de pagamento inteligente. O paciente paga online e o valor (líquido de taxas) vai direto para sua conta bancária em D+2. Fim da inadimplência." 
                  />
                  <FeatureCard 
                      icon={<Icons.Video />} 
                      title="Vídeo Chamada Integrada" 
                      desc="Sala de atendimento segura e criptografada (HIPAA compliant), sem necessidade de instalar aplicativos externos como Zoom ou WhatsApp." 
                  />
                  <FeatureCard 
                      icon={<Icons.Shield />} 
                      title="Prontuário Eletrônico" 
                      desc="Histórico do paciente centralizado e seguro. Acesse anotações, evoluções e documentos de qualquer lugar." 
                  />
                  <FeatureCard 
                      icon={<Icons.Calendar />} 
                      title="Agenda Inteligente" 
                      desc="Defina seus horários de atendimento e deixe que os pacientes agendem sozinhos. Sincronização automática com Google Calendar." 
                  />
                  <FeatureCard 
                      icon={<Icons.Lightning />} 
                      title="Visibilidade Profissional" 
                      desc="Tenha um perfil público otimizado que funciona como seu site pessoal, aumentando sua autoridade e captação de pacientes." 
                  />
                  <FeatureCard 
                      icon={<Icons.Chart />} 
                      title="Analytics de Carreira" 
                      desc="Visualize seu crescimento. Relatórios detalhados de faturamento, número de atendimentos e taxa de retorno." 
                  />
              </div>
          </div>
      </section>

      {/* =========================================
          COMPARISON TABLE
      ========================================= */}
      <section className="py-24 bg-[#F9FAFB] border-y border-neutral-100">
          <div className="max-w-5xl mx-auto px-6">
              <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-neutral-900 mb-4">Compare e Decida</h2>
                  <p className="text-neutral-500">Veja por que a VitaSyn é a escolha inteligente para sua carreira.</p>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
                  <div className="grid grid-cols-4 gap-4 p-6 bg-neutral-50 border-b border-neutral-100">
                      <div className="col-span-1"></div>
                      <div className="col-span-1 text-center font-bold text-lg text-neutral-900 flex flex-col items-center gap-2">
                            <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold text-sm">V</div>
                            VitaSyn
                      </div>
                      <div className="col-span-1 text-center font-bold text-neutral-500 text-sm">Consultório Físico</div>
                      <div className="col-span-1 text-center font-bold text-neutral-500 text-sm">Plataformas Genéricas</div>
                  </div>
                  
                  <div className="p-6 space-y-2">
                      <ComparisonRow 
                        feature="Custo Fixo Mensal" 
                        vitasyn="R$ 0,00" 
                        traditional="R$ 2.000+" 
                        generic="R$ 100 - R$ 300" 
                      />
                      <ComparisonRow 
                        feature="Taxa por Consulta" 
                        vitasyn="15%" 
                        traditional="0%" 
                        generic="20% - 30%" 
                      />
                      <ComparisonRow 
                        feature="Prontuário Digital" 
                        vitasyn={<Icons.Check />} 
                        traditional={<Icons.X />} 
                        generic={<Icons.Check />} 
                      />
                       <ComparisonRow 
                        feature="Vídeo Integrado (Seguro)" 
                        vitasyn={<Icons.Check />} 
                        traditional="-" 
                        generic={<Icons.X />} 
                      />
                      <ComparisonRow 
                        feature="Gestão Financeira (Split)" 
                        vitasyn={<Icons.Check />} 
                        traditional={<Icons.X />} 
                        generic={<Icons.X />} 
                      />
                      <ComparisonRow 
                        feature="Marketing Pessoal" 
                        vitasyn={<Icons.Check />} 
                        traditional={<Icons.X />} 
                        generic="Limitado" 
                      />
                  </div>
                  
                  <div className="p-6 bg-neutral-50 border-t border-neutral-100 text-center">
                      <Link to="/auth?role=professional&mode=signup">
                        <Button size="lg" className="px-12 shadow-xl shadow-primary/20">Escolher VitaSyn</Button>
                      </Link>
                  </div>
              </div>
          </div>
      </section>

      {/* =========================================
          HOW IT WORKS (Professional Only)
      ========================================= */}
      <section className="py-24 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-neutral-900 mb-4">Começar é simples e rápido.</h2>
                  <p className="text-neutral-500">Três passos para digitalizar sua prática clínica.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <StepCard 
                    number="1" 
                    title="Crie seu Perfil" 
                    desc="Cadastre-se com seu registro profissional (CRP/CRN/CREFITO). Personalize sua bio, foto e especialidades em minutos." 
                />
                <StepCard 
                    number="2" 
                    title="Defina sua Agenda" 
                    desc="Configure seus horários de atendimento e o valor da sua consulta. Você tem controle total sobre sua disponibilidade." 
                />
                <StepCard 
                    number="3" 
                    title="Comece a Atender" 
                    desc="Receba agendamentos, atenda via vídeo na plataforma e receba os pagamentos automaticamente em sua conta." 
                />
              </div>
          </div>
      </section>

      {/* =========================================
          PRICING (Transparent Commission)
      ========================================= */}
      <section className="py-24 bg-[#F9FAFB]">
          <div className="max-w-4xl mx-auto px-6">
              <div className="bg-neutral-900 rounded-[2.5rem] p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-neutral-900/20">
                  
                  {/* Decor */}
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-[120px] opacity-20"></div>

                  <div className="relative z-10">
                      <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-widest mb-6">
                          Modelo Pioneiro
                      </span>
                      <h2 className="text-4xl md:text-5xl font-bold mb-6">Sem mensalidade. <br/>Sem letras miúdas.</h2>
                      <p className="text-lg text-neutral-300 max-w-xl mx-auto mb-10">
                          Acreditamos que só devemos ganhar quando você ganha. Por isso, eliminamos os custos fixos para democratizar o acesso à tecnologia de ponta.
                      </p>

                      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
                          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 w-full md:w-64">
                              <p className="text-sm text-neutral-400 font-bold uppercase mb-2">Adesão / Mensalidade</p>
                              <p className="text-4xl font-bold text-white">R$ 0</p>
                              <p className="text-xs text-neutral-500 mt-2">Custo fixo zero.</p>
                          </div>
                          <div className="text-2xl text-neutral-600 hidden md:block">+</div>
                          <div className="bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm border border-primary/30 rounded-2xl p-6 w-full md:w-64 relative">
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  TAXA ÚNICA
                              </div>
                              <p className="text-sm text-primary-200 font-bold uppercase mb-2">Por Consulta Realizada</p>
                              <p className="text-4xl font-bold text-white">15%</p>
                              <p className="text-xs text-neutral-400 mt-2">Inclui taxas de cartão e plataforma.</p>
                          </div>
                      </div>

                      <Link to="/auth?role=professional&mode=signup">
                        <Button size="lg" className="rounded-xl h-14 px-12 text-lg font-bold shadow-xl shadow-primary/40 bg-white text-neutral-900 hover:bg-neutral-100 border-none">
                            Começar Gratuitamente
                        </Button>
                      </Link>
                      <p className="text-xs text-neutral-500 mt-4">
                          Não pedimos cartão de crédito para cadastro.
                      </p>
                  </div>
              </div>
          </div>
      </section>

      {/* =========================================
          FAQ (Objection Handling)
      ========================================= */}
      <section className="py-24 bg-white">
          <div className="max-w-3xl mx-auto px-6">
              <h2 className="text-3xl font-bold text-neutral-900 mb-12 text-center">Dúvidas Comuns</h2>
              <div className="space-y-4">
                  {FAQS.map((faq, idx) => (
                      <div key={idx} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-sm">
                          <button 
                            onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                            className="w-full flex items-center justify-between p-6 text-left"
                          >
                              <span className="font-bold text-neutral-900">{faq.q}</span>
                              <div className={`transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`}>
                                  <Icons.ChevronDown />
                              </div>
                          </button>
                          {openFaq === idx && (
                              <div className="p-6 pt-0 text-neutral-600 leading-relaxed border-t border-neutral-100 bg-neutral-50/50">
                                  {faq.a}
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* =========================================
          FOOTER
      ========================================= */}
      <footer className="bg-white border-t border-neutral-100 py-16">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
              <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center gap-2 mb-6">
                      <div className="w-10 h-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center font-bold text-xl">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 8C4 8 8 16 9 18C10 20 12 20 13 18C14 16 20 4 20 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xl text-neutral-900 leading-none">VitaSyn</span>
                        <span className="text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5">Beta</span>
                      </div>
                  </div>
                  <p className="text-neutral-500 mb-6 max-w-xs">
                      Tecnologia de ponta para <strong>Psicólogos, Nutricionistas e Fisioterapeutas</strong> que desejam liderar o futuro da saúde digital.
                  </p>
              </div>
              
              <div>
                  <h4 className="font-bold text-neutral-900 mb-4">Produto</h4>
                  <ul className="space-y-3 text-sm text-neutral-500">
                      <li><span className="cursor-pointer hover:text-primary">Funcionalidades</span></li>
                      <li><span className="cursor-pointer hover:text-primary">Segurança</span></li>
                      <li><span className="cursor-pointer hover:text-primary">Preços</span></li>
                  </ul>
              </div>

              <div>
                  <h4 className="font-bold text-neutral-900 mb-4">Legal</h4>
                  <ul className="space-y-3 text-sm text-neutral-500">
                      <li><span className="cursor-pointer hover:text-primary">Termos de Uso</span></li>
                      <li><span className="cursor-pointer hover:text-primary">Privacidade</span></li>
                      <li><span className="cursor-pointer hover:text-primary">Política de Dados</span></li>
                  </ul>
              </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-neutral-100 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-xs text-neutral-400">
              <p>© 2025 VitaSyn Health Tech. Todos os direitos reservados.</p>
              <p>Feito para impulsionar carreiras.</p>
          </div>
      </footer>
    </div>
  );
};

export default LandingPage;
