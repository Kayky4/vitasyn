
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { UserRole, Consultation } from '../../types';
import { Button } from '../../components/ui/Button';
import { auth, db } from '../../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore/lite';

// --- Assets & Icons ---
const Icons = {
    Search: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Calendar: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Clock: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Video: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    FileText: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    Refresh: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    Star: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
    ChevronRight: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
};

// --- Sub-Components ---

const EmptyState = ({ onAction }: { onAction: () => void }) => (
    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-neutral-200">
        <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-300 animate-in zoom-in duration-500">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h3 className="text-xl font-bold text-neutral-900 mb-2">Sua jornada começa aqui</h3>
        <p className="text-neutral-500 max-w-md mx-auto mb-8 leading-relaxed">
            Você ainda não tem histórico de consultas. Agende seu primeiro atendimento e comece a cuidar de você.
        </p>
        <Button onClick={onAction} className="shadow-lg shadow-primary/20">
            Encontrar Especialista
        </Button>
    </div>
);

const HeroCard = ({ consultation }: { consultation: Consultation }) => {
    if (!consultation) return null;
    
    const start = new Date(consultation.start_at);
    const now = new Date();
    const diffMinutes = Math.floor((start.getTime() - now.getTime()) / 60000);
    const isImminent = diffMinutes < 60 && diffMinutes > -60;

    return (
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
             <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500">Próximo Compromisso</h2>
             </div>
             
             <div className="group relative overflow-hidden rounded-3xl bg-neutral-900 text-white shadow-2xl shadow-neutral-900/20">
                 {/* Background Art */}
                 <div className="absolute top-0 right-0 w-80 h-80 bg-primary/30 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none group-hover:bg-primary/40 transition-colors duration-500"></div>
                 
                 <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                     <div className="flex items-start gap-6">
                         <div className="relative shrink-0">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-neutral-800 border-2 border-neutral-700 overflow-hidden shadow-lg">
                                <img 
                                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${consultation.professionalName}`} 
                                    alt="Pro" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-3 -right-3 bg-white text-neutral-900 p-2 rounded-xl shadow-lg border border-neutral-100">
                                <Icons.Video />
                            </div>
                         </div>
                         
                         <div>
                             <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${isImminent ? 'bg-red-500/20 border-red-500/30 text-red-200' : 'bg-white/10 border-white/10 text-neutral-300'}`}>
                                    {isImminent ? 'Começa em breve' : 'Confirmado'}
                                </span>
                             </div>
                             <h3 className="text-2xl md:text-3xl font-bold mb-1 leading-tight">{consultation.professionalName}</h3>
                             <p className="text-neutral-400 font-medium">Videoconsulta • Terapia</p>
                             
                             <div className="flex items-center gap-4 mt-4 text-sm font-medium text-neutral-300">
                                 <div className="flex items-center gap-1.5">
                                     <Icons.Calendar />
                                     <span>{start.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'long' })}</span>
                                 </div>
                                 <div className="w-1 h-1 rounded-full bg-neutral-600"></div>
                                 <div className="flex items-center gap-1.5">
                                     <Icons.Clock />
                                     <span>{start.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                 </div>
                             </div>
                         </div>
                     </div>

                     <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                         {consultation.meeting?.meetLink ? (
                             <a href={consultation.meeting.meetLink} target="_blank" rel="noreferrer" className="w-full md:w-auto">
                                <Button className="w-full h-12 bg-white text-neutral-900 hover:bg-neutral-100 border-none shadow-lg shadow-white/5 whitespace-nowrap px-8">
                                    Entrar na Sala
                                </Button>
                             </a>
                         ) : (
                             <Button disabled variant="secondary" className="w-full md:w-auto bg-white/10 border-transparent text-neutral-400">
                                 Link em breve
                             </Button>
                         )}
                     </div>
                 </div>
             </div>
        </div>
    );
};

const TimelineItem: React.FC<{ consultation: Consultation; isLast: boolean; onRebook: (id: string) => void }> = ({ consultation, isLast, onRebook }) => {
    const start = new Date(consultation.start_at);
    const statusColor = consultation.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-emerald-50 text-emerald-600';
    const statusLabel = consultation.status === 'cancelled' ? 'Cancelado' : 'Realizada';

    return (
        <div className="flex gap-4 md:gap-6 group">
            {/* Left: Date Column */}
            <div className="flex flex-col items-center min-w-[60px] md:min-w-[80px] pt-1 text-center">
                <span className="text-xs font-bold uppercase text-neutral-400 mb-0.5">{start.toLocaleDateString('pt-BR', { month: 'short' })}</span>
                <span className="text-2xl font-bold text-neutral-900 leading-none mb-1">{start.getDate()}</span>
                <span className="text-xs font-medium text-neutral-500">{start.toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                
                {/* Connecting Line */}
                {!isLast && <div className="w-px h-full bg-gradient-to-b from-neutral-200 to-transparent mt-3 group-hover:from-primary/30 transition-colors"></div>}
            </div>

            {/* Right: Card Content */}
            <div className="flex-1 pb-8">
                <div className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20 group-hover:translate-x-1">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                             <img 
                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${consultation.professionalName}`} 
                                className="w-10 h-10 rounded-full bg-neutral-100 border border-white shadow-sm"
                                alt="Avatar"
                             />
                             <div>
                                 <h4 className="font-bold text-neutral-900 text-sm md:text-base">{consultation.professionalName}</h4>
                                 <div className="flex items-center gap-2 text-xs text-neutral-500">
                                     <span>{start.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                     <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                                     <span>Videoconsulta</span>
                                 </div>
                             </div>
                        </div>
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-transparent ${statusColor}`}>
                            {statusLabel}
                        </span>
                    </div>

                    {/* Actions Footer */}
                    <div className="pt-4 mt-2 border-t border-neutral-50 flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar">
                         <button 
                            onClick={() => onRebook(consultation.professionalId)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 transition-colors whitespace-nowrap"
                         >
                             <Icons.Refresh />
                             Reagendar
                         </button>
                         
                         <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-colors whitespace-nowrap">
                             <Icons.FileText />
                             Ver Receita
                         </button>

                         <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-colors whitespace-nowrap ml-auto">
                             <Icons.Star />
                             Avaliar
                         </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Page ---

const PatientHistory = () => {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('history');

  useEffect(() => {
    const fetchHistory = async () => {
      if (!auth.currentUser) return;
      try {
          const q = query(
              collection(db, 'consultations'),
              where('patientId', '==', auth.currentUser.uid)
          );
          const snap = await getDocs(q);
          const list: Consultation[] = [];
          snap.forEach(doc => list.push({ id: doc.id, ...doc.data() } as Consultation));
          
          list.sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime());
          setConsultations(list);
      } catch (error) {
          console.error(error);
      } finally {
          setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Filter & Logic
  const now = new Date();
  
  // Separation logic
  const upcomingList = useMemo(() => 
      consultations
        .filter(c => new Date(c.start_at) >= now && c.status !== 'cancelled')
        .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()), // Asc for upcoming
  [consultations, now]);

  const historyList = useMemo(() => 
      consultations
        .filter(c => new Date(c.start_at) < now || c.status === 'cancelled')
        .filter(c => 
            c.professionalName.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (c.status === 'cancelled' && 'cancelado'.includes(searchQuery.toLowerCase()))
        ),
  [consultations, now, searchQuery]);

  const nextAppointment = upcomingList[0];

  // Grouping History by Month
  const groupedHistory = useMemo(() => {
      const groups: Record<string, Consultation[]> = {};
      historyList.forEach(c => {
          const date = new Date(c.start_at);
          const key = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
          if (!groups[key]) groups[key] = [];
          groups[key].push(c);
      });
      return groups;
  }, [historyList]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans">
      <Navbar userRole={UserRole.PATIENT} isAuthenticated={true} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
                <button onClick={() => navigate('/patient/dashboard')} className="text-neutral-500 hover:text-neutral-900 text-sm mb-2 flex items-center gap-1 transition-colors">
                    ← Voltar ao Início
                </button>
                <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Timeline de Saúde</h1>
                <p className="text-neutral-500 mt-1">Gerencie suas consultas, reagendamentos e documentos médicos.</p>
            </div>
            
            {/* Context Stats (Desktop) */}
            <div className="hidden md:flex gap-6">
                <div className="text-right">
                    <p className="text-xs font-bold uppercase text-neutral-400">Total de Consultas</p>
                    <p className="text-xl font-bold text-neutral-900">{consultations.length}</p>
                </div>
                <div className="w-px bg-neutral-200"></div>
                <div className="text-right">
                    <p className="text-xs font-bold uppercase text-neutral-400">Este Ano</p>
                    <p className="text-xl font-bold text-primary">{consultations.filter(c => new Date(c.start_at).getFullYear() === now.getFullYear()).length}</p>
                </div>
            </div>
        </div>

        {/* --- Loading State --- */}
        {loading ? (
             <div className="space-y-6">
                 <div className="h-48 bg-neutral-200 animate-pulse rounded-3xl"></div>
                 <div className="h-32 bg-neutral-100 animate-pulse rounded-2xl"></div>
                 <div className="h-32 bg-neutral-100 animate-pulse rounded-2xl"></div>
             </div>
        ) : consultations.length === 0 ? (
            <EmptyState onAction={() => navigate('/patient/dashboard')} />
        ) : (
            <>
                {/* --- 1. Hero Card (The Next Step) --- */}
                {activeTab === 'history' && nextAppointment && (
                    <HeroCard consultation={nextAppointment} />
                )}

                {/* --- 2. Controls & Search --- */}
                <div className="sticky top-20 md:top-24 z-30 bg-[#F9FAFB]/95 backdrop-blur-sm pb-6 pt-2">
                    <div className="bg-white p-2 rounded-2xl border border-neutral-200 shadow-sm flex flex-col md:flex-row gap-2">
                        {/* Tabs */}
                        <div className="flex bg-neutral-100 p-1 rounded-xl shrink-0">
                            <button 
                                onClick={() => setActiveTab('history')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                            >
                                Histórico
                            </button>
                            <button 
                                onClick={() => setActiveTab('upcoming')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'upcoming' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                            >
                                Agendadas
                                {upcomingList.length > 0 && <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">{upcomingList.length}</span>}
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative flex-1">
                            <input 
                                type="text" 
                                placeholder="Buscar por médico ou status..."
                                className="w-full h-full pl-10 pr-4 py-2 bg-transparent rounded-xl focus:bg-neutral-50 outline-none text-sm font-medium transition-colors"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                                <Icons.Search />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 3. Timeline Content --- */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'upcoming' ? (
                        /* Upcoming List View */
                        <div className="space-y-4">
                            {upcomingList.length === 0 ? (
                                <div className="text-center py-12 text-neutral-400">
                                    <p>Nenhuma consulta agendada para o futuro.</p>
                                    <Button variant="ghost" className="mt-2 text-primary" onClick={() => navigate('/patient/dashboard')}>Agendar Agora</Button>
                                </div>
                            ) : (
                                upcomingList.map((c, i) => (
                                    <TimelineItem 
                                        key={c.id} 
                                        consultation={c} 
                                        isLast={i === upcomingList.length - 1}
                                        onRebook={(pid) => navigate(`/book/${pid}`)}
                                    />
                                ))
                            )}
                        </div>
                    ) : (
                        /* History Grouped View */
                        <div className="space-y-8">
                             {Object.keys(groupedHistory).length === 0 ? (
                                 <div className="text-center py-12 text-neutral-400">
                                     <p>Nenhum histórico encontrado com estes filtros.</p>
                                 </div>
                             ) : (
                                 Object.keys(groupedHistory).map((monthKey) => (
                                     <div key={monthKey}>
                                         <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-6 pl-2 sticky top-40 z-10">
                                             {monthKey}
                                         </h3>
                                         <div>
                                             {groupedHistory[monthKey].map((c, i) => (
                                                 <TimelineItem 
                                                     key={c.id} 
                                                     consultation={c} 
                                                     isLast={i === groupedHistory[monthKey].length - 1}
                                                     onRebook={(pid) => navigate(`/book/${pid}`)}
                                                 />
                                             ))}
                                         </div>
                                     </div>
                                 ))
                             )}
                        </div>
                    )}
                </div>
            </>
        )}

      </main>
    </div>
  );
};

export default PatientHistory;
