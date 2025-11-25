
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { UserRole, Consultation } from '../../types';
import { Button } from '../../components/ui/Button';
import { auth, db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore/lite';

// --- Icons (Phosphor / Heroicons Style) ---
const Icons = {
  Video: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  Calendar: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  TrendingUp: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Wallet: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Clock: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  ChevronRight: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>,
  MoreVertical: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
};

// --- Components ---

const StatCard = ({ title, value, trend, icon: Icon, delay }: any) => (
  <div className={`bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-500 animate-in fade-in slide-in-from-bottom-4`} style={{ animationDelay: `${delay}ms` }}>
    <div className="flex justify-between items-start mb-4">
      <div className="p-2.5 bg-neutral-50 rounded-xl text-neutral-600">
        <Icon />
      </div>
      {trend && (
        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
          <Icons.TrendingUp />
          {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-sm font-medium text-neutral-500">{title}</p>
      <h3 className="text-2xl font-bold text-neutral-900 mt-1 tracking-tight">{value}</h3>
    </div>
  </div>
);

const NextAppointmentHero = ({ appointment }: { appointment: Consultation }) => {
  if (!appointment) return null;

  const start = new Date(appointment.start_at);
  const now = new Date();
  const diffMinutes = Math.floor((start.getTime() - now.getTime()) / 60000);
  
  let timeStatus = "";
  if (diffMinutes < 0) timeStatus = "Em andamento";
  else if (diffMinutes < 60) timeStatus = `Começa em ${diffMinutes} min`;
  else timeStatus = `Hoje às ${start.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;

  return (
    <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl p-6 md:p-8 text-white shadow-2xl shadow-neutral-900/20 relative overflow-hidden group">
      {/* Abstract Shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2">
            <span className="animate-pulse w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Próximo Atendimento</span>
          </div>
          <span className="bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs font-medium">
            {timeStatus}
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
          <div className="relative">
             <div className="w-20 h-20 rounded-2xl bg-gradient-primary p-[2px]">
                <div className="w-full h-full rounded-2xl bg-neutral-800 overflow-hidden">
                    <img 
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${appointment.patientName}`} 
                        alt="Patient" 
                        className="w-full h-full object-cover"
                    />
                </div>
             </div>
             {/* Platform Icon Badge */}
             <div className="absolute -bottom-2 -right-2 bg-white text-neutral-900 p-1.5 rounded-lg shadow-lg">
                <Icons.Video />
             </div>
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">{appointment.patientName}</h2>
            <p className="text-neutral-400 text-sm mb-3 line-clamp-1">{appointment.patientId === 'manual' ? 'Agendamento Interno' : 'Videoconsulta • Terapia Individual'}</p>
            <div className="flex items-center gap-4 text-xs font-medium text-neutral-400">
                <div className="flex items-center gap-1.5">
                    <Icons.Calendar />
                    <span>{start.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Icons.Clock />
                    <span>60 min</span>
                </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
            {appointment.meeting?.meetLink ? (
                <a href={appointment.meeting.meetLink} target="_blank" rel="noreferrer" className="flex-1">
                    <Button className="w-full bg-white text-neutral-900 hover:bg-neutral-100 border-none h-12 shadow-xl shadow-white/5">
                        Entrar na Sala Agora
                    </Button>
                </a>
            ) : (
                <Button disabled className="flex-1 bg-white/10 text-neutral-400 border-white/5">
                    Link não gerado
                </Button>
            )}
            <Button variant="secondary" className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-white/30 h-12">
                Ver Prontuário
            </Button>
        </div>
      </div>
    </div>
  );
};

const TimelineItem: React.FC<{ appointment: Consultation; isLast: boolean }> = ({ appointment, isLast }) => {
    const start = new Date(appointment.start_at);
    const isManual = appointment.patientId === 'manual';

    return (
        <div className="flex gap-4 group">
            {/* Time Column */}
            <div className="flex flex-col items-center min-w-[60px] pt-1">
                <span className="text-sm font-bold text-neutral-900">{start.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                {!isLast && <div className="w-px h-full bg-neutral-200 mt-2 group-hover:bg-primary/30 transition-colors"></div>}
            </div>

            {/* Card Content */}
            <div className="flex-1 pb-8">
                <div className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer hover:scale-[1.01] ${
                    isManual 
                    ? 'bg-red-50/50 border-red-100 hover:border-red-200' 
                    : 'bg-white border-neutral-100 hover:border-primary/30 hover:shadow-md'
                }`}>
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                                isManual ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-primary'
                            }`}>
                                {isManual ? 'Bloqueio' : 'Consulta'}
                            </span>
                        </div>
                        <button className="text-neutral-300 hover:text-neutral-600">
                            <Icons.MoreVertical />
                        </button>
                    </div>
                    <h4 className="font-bold text-neutral-900">{appointment.patientName}</h4>
                    {!isManual && <p className="text-xs text-neutral-500 mt-1">Retorno • Online</p>}
                </div>
            </div>
        </div>
    );
};

const Scratchpad = () => {
    const [note, setNote] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('vitasyn_scratchpad');
        if (saved) setNote(saved);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setNote(val);
        localStorage.setItem('vitasyn_scratchpad', val);
    };

    return (
        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-200/20 to-transparent rounded-bl-full pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                    <Icons.Edit />
                    Anotações Rápidas
                </h3>
            </div>
            <textarea
                className="w-full bg-transparent border-none resize-none focus:ring-0 text-sm text-amber-900 placeholder-amber-900/40 h-32 leading-relaxed"
                placeholder="Digite lembretes rápidos aqui... (Salvo automaticamente)"
                value={note}
                onChange={handleChange}
            ></textarea>
        </div>
    );
};

// --- Main Page ---

const ProfessionalDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow'>('today');
  
  // Stats
  const [stats, setStats] = useState({ 
      earnings: 0, 
      count: 0, 
      views: 128 // Mock
  });

  useEffect(() => {
      const fetchData = async () => {
          if (!auth.currentUser) return;

          try {
              // Buscar consultas (ordenadas)
              const q = query(
                  collection(db, 'consultations'), 
                  where('professionalId', '==', auth.currentUser.uid)
              );
              
              const snap = await getDocs(q);
              const list: Consultation[] = [];
              let totalEarned = 0;
              let totalCount = 0;

              snap.forEach(doc => {
                  const data = doc.data() as any;
                  list.push({ id: doc.id, ...data });
                  
                  if (data.status === 'paid' || data.status === 'completed') {
                      totalEarned += (data.price_cents || 0);
                  }
                  totalCount++;
              });

              // Client side sort (para garantir)
              list.sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
              
              setAppointments(list);
              setStats({ ...stats, earnings: totalEarned, count: totalCount });
          } catch (e) {
              console.error(e);
          } finally {
              setLoading(false);
          }
      };
      fetchData();
  }, []);

  // Filter Logic
  const todayDate = new Date();
  const tomorrowDate = new Date();
  tomorrowDate.setDate(todayDate.getDate() + 1);

  const isSameDate = (d1: Date, d2: Date) => 
      d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

  const dayAppointments = useMemo(() => {
      const targetDate = activeTab === 'today' ? todayDate : tomorrowDate;
      return appointments.filter(a => isSameDate(new Date(a.start_at), targetDate));
  }, [appointments, activeTab]);

  const nextAppointment = useMemo(() => {
      const now = new Date();
      return appointments.find(a => new Date(a.start_at) > now && a.status !== 'cancelled');
  }, [appointments]);

  const getGreeting = () => {
      const h = new Date().getHours();
      if (h < 12) return 'Bom dia';
      if (h < 18) return 'Boa tarde';
      return 'Boa noite';
  };

  const dayProgress = useMemo(() => {
      const startWork = 8 * 60; // 08:00
      const endWork = 18 * 60; // 18:00
      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      
      const total = endWork - startWork;
      const progress = currentMins - startWork;
      
      const pct = Math.min(100, Math.max(0, (progress / total) * 100));
      return pct;
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-neutral-900 pb-20">
      <Navbar userRole={UserRole.PROFESSIONAL} isAuthenticated={true} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* --- Header Section --- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
                <p className="text-neutral-500 font-medium mb-1">
                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">
                    {getGreeting()}, <span className="text-primary">Dr(a). Admin</span>
                </h1>
            </div>
            
            <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-neutral-100">
                <div className="px-4 py-2">
                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-1">Dia de Trabalho</p>
                    <div className="w-32 h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000" style={{ width: `${dayProgress}%` }}></div>
                    </div>
                </div>
                <div className="h-8 w-px bg-neutral-100"></div>
                <Button variant="ghost" className="text-sm font-medium" onClick={() => navigate('/professional/calendar')}>
                    Ver Agenda Completa
                </Button>
            </div>
        </header>

        {/* --- Metrics Grid --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatCard 
                title="Ganhos Acumulados" 
                value={`R$ ${(stats.earnings / 100).toFixed(2).replace('.', ',')}`} 
                trend="12% vs. mês passado"
                icon={Icons.Wallet}
                delay={0}
            />
            <StatCard 
                title="Pacientes Atendidos" 
                value={stats.count} 
                trend="5 novos hoje"
                icon={Icons.Users}
                delay={100}
            />
            <StatCard 
                title="Visitas ao Perfil" 
                value={stats.views} 
                icon={Icons.TrendingUp}
                delay={200}
            />
        </section>

        {/* --- Main Content Grid (Bento) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column (Main Focus) */}
            <div className="lg:col-span-8 space-y-8">
                
                {/* 1. Next Up Hero */}
                {nextAppointment ? (
                    <NextAppointmentHero appointment={nextAppointment} />
                ) : (
                    <div className="bg-white rounded-3xl p-8 border border-neutral-100 text-center shadow-sm">
                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-300">
                            <Icons.Video />
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900">Tudo limpo por agora</h3>
                        <p className="text-neutral-500">Você não tem consultas iminentes.</p>
                    </div>
                )}

                {/* 2. Agenda Timeline */}
                <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
                        <h3 className="font-bold text-lg text-neutral-900">Sua Agenda</h3>
                        
                        {/* Tabs */}
                        <div className="flex bg-neutral-100/50 p-1 rounded-lg">
                            <button 
                                onClick={() => setActiveTab('today')}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'today' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}
                            >
                                Hoje
                            </button>
                            <button 
                                onClick={() => setActiveTab('tomorrow')}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'tomorrow' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}
                            >
                                Amanhã
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="space-y-4 animate-pulse">
                                {[1,2,3].map(i => <div key={i} className="h-20 bg-neutral-50 rounded-xl"></div>)}
                            </div>
                        ) : dayAppointments.length > 0 ? (
                            <div className="flex flex-col">
                                {dayAppointments.map((apt, idx) => (
                                    <TimelineItem 
                                        key={apt.id} 
                                        appointment={apt} 
                                        isLast={idx === dayAppointments.length - 1} 
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-neutral-400 font-medium">Agenda livre para {activeTab === 'today' ? 'hoje' : 'amanhã'}.</p>
                                <Button variant="ghost" size="sm" className="mt-2 text-primary" onClick={() => navigate('/professional/calendar')}>
                                    Gerenciar Bloqueios
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Right Column (Tools & Sidebar) */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* Scratchpad Widget */}
                <Scratchpad />

                {/* Quick Actions Menu */}
                <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm">
                    <h3 className="font-bold text-neutral-900 mb-4">Acesso Rápido</h3>
                    <div className="space-y-2">
                        <button 
                            onClick={() => navigate('/professional/availability')}
                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 transition-colors text-left group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    <Icons.Clock />
                                </div>
                                <span className="font-medium text-sm text-neutral-700">Editar Disponibilidade</span>
                            </div>
                            <Icons.ChevronRight />
                        </button>

                        <button 
                            onClick={() => navigate('/professional/finance')}
                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 transition-colors text-left group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
                                    <Icons.Wallet />
                                </div>
                                <span className="font-medium text-sm text-neutral-700">Finanças & Integrações</span>
                            </div>
                            <Icons.ChevronRight />
                        </button>

                        <button 
                             onClick={() => navigate('/professional/profile')}
                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 transition-colors text-left group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-pink-50 text-pink-600 rounded-lg group-hover:bg-pink-100 transition-colors">
                                    <Icons.Users />
                                </div>
                                <span className="font-medium text-sm text-neutral-700">Meu Perfil Público</span>
                            </div>
                            <Icons.ChevronRight />
                        </button>
                    </div>
                </div>

                {/* Promo / Tip Card */}
                <div className="bg-neutral-900 rounded-2xl p-6 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h4 className="font-bold text-lg mb-2">VitaSyn Premium</h4>
                        <p className="text-neutral-400 text-sm mb-4">Assine o plano Pro para taxas menores e suporte prioritário 24/7.</p>
                        <button className="text-xs font-bold uppercase tracking-wider bg-white text-neutral-900 px-4 py-2 rounded-lg hover:bg-neutral-200 transition-colors">
                            Ver Planos
                        </button>
                    </div>
                    {/* Decor */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                </div>

            </div>
        </div>

      </main>
    </div>
  );
};

export default ProfessionalDashboard;
