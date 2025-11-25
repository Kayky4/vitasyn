
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { UserRole, ProfessionalProfile, Consultation } from '../../types';
import { Button } from '../../components/ui/Button';
import { auth, db } from '../../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore/lite';

// --- Assets & Icons ---
const Icons = {
  Search: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  MapPin: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Star: () => <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>,
  Video: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  Calendar: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Clock: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Filter: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>,
  Lightning: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
};

const CATEGORIES = [
  { id: 'Todos', label: 'Todos', icon: '🔍' },
  { id: 'Psicólogo', label: 'Psicologia', icon: '🧠' },
  { id: 'Nutricionista', label: 'Nutrição', icon: '🥑' },
  { id: 'Fisioterapeuta', label: 'Fisioterapia', icon: '🦴' },
  { id: 'Cardiologista', label: 'Cardiologia', icon: '❤️' },
];

// --- Sub-Components ---

const GreetingHeader = ({ userName }: { userName: string }) => {
    const hours = new Date().getHours();
    const greeting = hours < 12 ? 'Bom dia' : hours < 18 ? 'Boa tarde' : 'Boa noite';

    return (
        <div className="mb-6 md:mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <p className="text-neutral-500 font-medium text-sm mb-1">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">
                {greeting}, <span className="text-primary">{userName.split(' ')[0]}</span>.
            </h1>
            <p className="text-neutral-400 mt-2 text-sm md:text-base">Como podemos cuidar de você hoje?</p>
        </div>
    );
};

const SearchBar = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => (
    <div className="relative group z-20">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <div className="text-neutral-400 group-focus-within:text-primary transition-colors">
                <Icons.Search />
            </div>
        </div>
        <input 
            type="text"
            className="block w-full pl-12 pr-4 py-4 bg-white border-2 border-neutral-100 rounded-2xl leading-5 placeholder-neutral-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 shadow-lg shadow-neutral-100/50 text-neutral-900 font-medium"
            placeholder="Buscar por médico, especialidade ou sintoma..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
        <div className="absolute inset-y-0 right-2 flex items-center">
            <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors">
                <Icons.Filter />
            </button>
        </div>
    </div>
);

const AppointmentTicket = ({ appointment }: { appointment: Consultation }) => {
    if (!appointment) {
        return (
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl group cursor-pointer hover:scale-[1.01] transition-transform">
                <div className="relative z-10 max-w-sm">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10 text-2xl">
                        ✨
                    </div>
                    <h3 className="text-xl font-bold mb-2">Sua saúde em dia</h3>
                    <p className="text-neutral-400 text-sm mb-6 leading-relaxed">Você não tem consultas agendadas. Que tal fazer um check-up preventivo?</p>
                    <div className="inline-flex items-center gap-2 text-sm font-bold text-primary-300 group-hover:text-white transition-colors">
                        Encontrar Especialista →
                    </div>
                </div>
                {/* Abstract Shapes */}
                <div className="absolute right-0 top-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
            </div>
        );
    }

    const start = new Date(appointment.start_at);
    const now = new Date();
    const diffMins = Math.floor((start.getTime() - now.getTime()) / 60000);
    
    let statusBadge = { text: 'Agendado', color: 'bg-blue-500' };
    if (diffMins < 0) statusBadge = { text: 'Em Andamento', color: 'bg-green-500' };
    else if (diffMins < 60) statusBadge = { text: `Em ${diffMins} min`, color: 'bg-amber-500' };

    return (
        <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl shadow-primary/5 border border-neutral-100 group">
            {/* Top Section (Color Bar) */}
            <div className="h-2 bg-gradient-to-r from-primary to-accent"></div>
            
            <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <span className={`w-2 h-2 rounded-full ${statusBadge.color} animate-pulse`}></span>
                             <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">{statusBadge.text}</span>
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 line-clamp-1">{appointment.professionalName}</h3>
                        <p className="text-sm text-neutral-500">Videoconsulta</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-2xl font-bold text-primary">{start.getDate()}</span>
                        <span className="text-xs font-bold uppercase text-neutral-400">{start.toLocaleDateString('pt-BR', { month: 'short' })}</span>
                    </div>
                </div>

                {/* Ticket Details */}
                <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-xl text-primary shadow-sm">
                            <Icons.Clock />
                        </div>
                        <div>
                            <p className="text-xs text-neutral-400 font-bold uppercase">Horário</p>
                            <p className="text-sm font-bold text-neutral-900">{start.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-neutral-200"></div>
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-white rounded-xl text-primary shadow-sm">
                            <Icons.Video />
                        </div>
                        <div>
                            <p className="text-xs text-neutral-400 font-bold uppercase">Canal</p>
                            <p className="text-sm font-bold text-neutral-900">Google Meet</p>
                        </div>
                    </div>
                </div>

                {appointment.meeting?.meetLink ? (
                    <a href={appointment.meeting.meetLink} target="_blank" rel="noreferrer" className="block w-full">
                        <Button className="w-full shadow-lg shadow-primary/20">Entrar na Sala</Button>
                    </a>
                ) : (
                    <Button disabled variant="secondary" className="w-full">Link em breve</Button>
                )}
            </div>
        </div>
    );
};

const DoctorCard = ({ pro, compact = false }: { pro: ProfessionalProfile, compact?: boolean }) => {
    const navigate = useNavigate();
    
    // Simulação de status
    const isAvailable = Math.random() > 0.5;

    return (
        <div 
            onClick={() => navigate(`/book/${pro.id}`)}
            className={`bg-white border border-neutral-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-neutral-200/50 transition-all duration-300 cursor-pointer group flex ${compact ? 'flex-row items-center p-3 gap-4' : 'flex-col h-full'}`}
        >
            {/* Image Section */}
            <div className={`relative ${compact ? 'w-20 h-20 shrink-0' : 'h-48 w-full bg-neutral-100'}`}>
                <img 
                    src={pro.avatarUrl} 
                    alt={pro.name} 
                    className={`w-full h-full object-cover ${compact ? 'rounded-xl' : ''}`}
                />
                {!compact && (
                    <div className="absolute top-3 right-3">
                         <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1">
                             <Icons.Star />
                             <span>4.9</span>
                         </div>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className={`flex flex-col ${compact ? 'flex-1 min-w-0' : 'p-5 flex-1'}`}>
                {/* Header Info */}
                <div className="mb-1">
                    <div className="flex justify-between items-start">
                        <h3 className={`font-bold text-neutral-900 group-hover:text-primary transition-colors truncate ${compact ? 'text-base' : 'text-lg'}`}>
                            {pro.name}
                        </h3>
                        {compact && (
                            <div className="flex items-center gap-1 text-[10px] font-bold bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded">
                                ★ 4.9
                            </div>
                        )}
                    </div>
                    <p className="text-xs font-medium text-primary truncate">{pro.title || pro.professionalType}</p>
                </div>

                {/* Tags (Desktop only or if space permits) */}
                {!compact && (
                    <div className="flex flex-wrap gap-1 my-3">
                        {pro.specialties?.slice(0, 2).map(s => (
                            <span key={s} className="text-[10px] bg-neutral-50 text-neutral-500 px-2 py-1 rounded border border-neutral-100">{s}</span>
                        ))}
                    </div>
                )}

                {/* Footer / Price */}
                <div className={`mt-auto flex items-center justify-between ${compact ? 'mt-1' : 'pt-4 border-t border-neutral-50'}`}>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-neutral-400 uppercase font-bold">Consulta</span>
                        <span className="font-bold text-neutral-900 text-sm">
                            R$ {(pro.price_default_cents / 100).toFixed(2).replace('.', ',')}
                        </span>
                    </div>
                    
                    {compact ? (
                        <button className="bg-neutral-900 text-white rounded-lg p-2 hover:bg-neutral-800">
                             <span className="sr-only">Agendar</span>
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    ) : (
                        <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                             <Icons.Lightning />
                             {isAvailable ? 'Disponível hoje' : 'Agenda aberta'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const QuickAction = ({ icon, label, onClick, colorClass }: any) => (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group w-full">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-sm transition-transform group-hover:scale-110 group-active:scale-95 ${colorClass}`}>
            {icon}
        </div>
        <span className="text-xs font-medium text-neutral-600 group-hover:text-neutral-900 text-center">{label}</span>
    </button>
);

// --- Main Page ---

const PatientDashboard = () => {
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Paciente');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([]);
  const [nextAppointment, setNextAppointment] = useState<Consultation | null>(null);

  // Load Data
  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;

      try {
        // 1. User Profile
        const userSnap = await getDocs(query(collection(db, 'users'), where('__name__', '==', auth.currentUser.uid))); // Optimized fetch
        if (!userSnap.empty) {
            const data = userSnap.docs[0].data();
            setUserName(data.profile?.name || data.name || 'Paciente');
        }

        // 2. Professionals
        const prosSnap = await getDocs(collection(db, 'professionals'));
        const prosList: ProfessionalProfile[] = [];
        prosSnap.forEach(doc => prosList.push(doc.data() as ProfessionalProfile));
        setProfessionals(prosList);

        // 3. Appointments
        const apptQuery = query(
            collection(db, 'consultations'), 
            where('patientId', '==', auth.currentUser.uid)
        );
        const apptSnap = await getDocs(apptQuery);
        const now = new Date();
        let closest: Consultation | null = null;
        let minDiff = Infinity;

        apptSnap.forEach(doc => {
            const data = doc.data();
            const start = new Date(data.start_at);
            if (start >= now && data.status !== 'cancelled') {
                const diff = start.getTime() - now.getTime();
                if (diff < minDiff) {
                    minDiff = diff;
                    closest = { id: doc.id, ...data } as Consultation;
                }
            }
        });
        setNextAppointment(closest);

      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter Logic
  const filteredPros = useMemo(() => {
    return professionals.filter(p => {
        const matchesCategory = selectedCategory === 'Todos' || p.professionalType === selectedCategory || p.specialties?.includes(selectedCategory);
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              p.professionalType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              p.specialties?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });
  }, [professionals, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-24 md:pb-12">
      <Navbar userRole={UserRole.PATIENT} isAuthenticated={true} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* === LEFT COLUMN (Main Content) === */}
            <div className="lg:col-span-8 space-y-8">
                
                {/* 1. Header & Search */}
                <div>
                    <GreetingHeader userName={userName} />
                    <SearchBar value={searchQuery} onChange={setSearchQuery} />
                </div>

                {/* 2. Categories Rail (Sticky on mobile scroll could be nice, but keeping simple) */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-neutral-900">Especialidades</h2>
                        <button className="text-xs font-bold text-primary hover:underline">Ver todas</button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`flex flex-col items-center gap-3 min-w-[80px] group transition-all duration-300 ${selectedCategory === cat.id ? 'opacity-100 scale-105' : 'opacity-70 hover:opacity-100'}`}
                            >
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm border transition-colors ${
                                    selectedCategory === cat.id 
                                    ? 'bg-neutral-900 border-neutral-900 text-white shadow-lg' 
                                    : 'bg-white border-neutral-100 group-hover:border-primary/30'
                                }`}>
                                    {cat.icon}
                                </div>
                                <span className={`text-xs font-medium ${selectedCategory === cat.id ? 'text-neutral-900 font-bold' : 'text-neutral-500'}`}>
                                    {cat.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Professionals List */}
                <div className="min-h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-neutral-900">
                            {searchQuery ? `Resultados para "${searchQuery}"` : 
                             selectedCategory === 'Todos' ? 'Recomendados para você' : `Especialistas em ${selectedCategory}`}
                        </h2>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[1,2,3,4].map(i => <div key={i} className="h-40 bg-neutral-100 animate-pulse rounded-2xl"></div>)}
                        </div>
                    ) : filteredPros.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                            {filteredPros.map(pro => (
                                <React.Fragment key={pro.id}>
                                    {/* Mobile: Horizontal Card */}
                                    <div className="block md:hidden">
                                        <DoctorCard pro={pro} compact={true} />
                                    </div>
                                    {/* Desktop: Vertical Card */}
                                    <div className="hidden md:block h-full">
                                        <DoctorCard pro={pro} />
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-neutral-200">
                             <div className="text-4xl mb-4">🔍</div>
                             <h3 className="font-bold text-neutral-900">Nenhum profissional encontrado</h3>
                             <p className="text-neutral-500 text-sm mt-1">Tente mudar os filtros ou busque por outro termo.</p>
                             <Button variant="ghost" onClick={() => {setSelectedCategory('Todos'); setSearchQuery('');}} className="mt-4 text-primary">
                                 Limpar filtros
                             </Button>
                        </div>
                    )}
                </div>

            </div>

            {/* === RIGHT COLUMN (Sidebar / Concierge) === */}
            <div className="lg:col-span-4 space-y-8">
                
                {/* 1. The Ticket (Sticky Context) */}
                <div className="lg:sticky lg:top-24 space-y-8">
                    <div>
                        <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                             <Icons.Clock />
                             Seu Próximo Compromisso
                        </h2>
                        <AppointmentTicket appointment={nextAppointment!} />
                    </div>

                    {/* 2. Quick Actions Widget */}
                    <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm">
                        <h3 className="text-sm font-bold text-neutral-900 mb-4 uppercase tracking-wider opacity-80">Acesso Rápido</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <QuickAction 
                                label="Histórico" 
                                icon={<Icons.Calendar />} 
                                colorClass="bg-blue-50 text-blue-600" 
                                onClick={() => navigate('/history')}
                            />
                            <QuickAction 
                                label="Receitas" 
                                icon="📄" 
                                colorClass="bg-purple-50 text-purple-600" 
                                onClick={() => {}} // Feature futura
                            />
                             <QuickAction 
                                label="Suporte" 
                                icon="💬" 
                                colorClass="bg-green-50 text-green-600" 
                                onClick={() => {}}
                            />
                        </div>
                    </div>

                    {/* 3. Daily Tip / Wellness Widget */}
                    <div className="bg-neutral-900 rounded-3xl p-6 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <span className="bg-white/20 text-xs font-bold px-2 py-1 rounded-md mb-3 inline-block">Dica do Dia</span>
                            <h4 className="font-bold text-lg mb-2">Hidratação é chave</h4>
                            <p className="text-neutral-400 text-sm mb-4 leading-relaxed">Beber água regularmente melhora a concentração e reduz a fadiga.</p>
                        </div>
                        <div className="absolute -bottom-4 -right-4 text-8xl opacity-10 rotate-12">💧</div>
                    </div>
                </div>

            </div>
        </div>

      </main>
    </div>
  );
};

export default PatientDashboard;
