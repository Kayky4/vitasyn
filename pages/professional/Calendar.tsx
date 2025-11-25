
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { UserRole, Consultation, ProfessionalProfile } from '../../types';
import { Button } from '../../components/ui/Button';
import { auth, db } from '../../lib/firebase';
import { collection, query, where, addDoc, deleteDoc, updateDoc, doc, getDocs, getDoc } from 'firebase/firestore/lite';

// --- Constants & Config ---
const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 06:00 até 21:00 (Extendido)
const CELL_HEIGHT = 80; // Altura da célula de 1 hora
const PIXELS_PER_MINUTE = CELL_HEIGHT / 60;
const MINUTES_SNAP = 15;
const WEEKDAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

type ViewMode = 'day' | '3day' | 'week' | 'agenda';

// --- Icons ---
const Icons = {
    Calendar: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    List: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
    ChevronLeft: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>,
    ChevronRight: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
    Video: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    Lock: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    Plus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
};

// --- Helpers ---
const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear();
};

const parseTimeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    if (parts.length < 2) return 0;
    const [h, m] = parts.map(Number);
    return h * 60 + m;
};

// --- Hooks ---
const useLongPress = (callback: (e: React.TouchEvent | React.MouseEvent) => void, ms = 500) => {
    const [startLongPress, setStartLongPress] = useState(false);
    
    useEffect(() => {
      let timerId: ReturnType<typeof setTimeout>;
      if (startLongPress) {
        timerId = setTimeout(() => {
            // @ts-ignore
            callback();
        }, ms);
      } else {
        // @ts-ignore
        clearTimeout(timerId);
      }
      return () => clearTimeout(timerId);
    }, [callback, ms, startLongPress]);
  
    return {
      onMouseDown: () => setStartLongPress(true),
      onMouseUp: () => setStartLongPress(false),
      onMouseLeave: () => setStartLongPress(false),
      onTouchStart: () => setStartLongPress(true),
      onTouchEnd: () => setStartLongPress(false),
    };
};

// --- Sub-Components ---

const Toast = ({ message, type, onClose }: { message: string, type: 'error' | 'success', onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-24 right-6 z-[70] px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-5 fade-in duration-300 border ${type === 'error' ? 'bg-white border-red-100 text-red-600' : 'bg-neutral-900 border-neutral-800 text-white'}`}>
            <span className="font-medium text-sm">{message}</span>
        </div>
    );
};

// Modal de Criação/Edição
const EventModal = ({ isOpen, onClose, onSave, initialDate, eventToEdit }: any) => {
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [title, setTitle] = useState('Bloqueio de Agenda');
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
      if (!isOpen) return;
  
      if (eventToEdit) {
          const start = new Date(eventToEdit.start_at);
          const end = new Date(eventToEdit.end_at);
          const localDate = start.getFullYear() + '-' + String(start.getMonth() + 1).padStart(2, '0') + '-' + String(start.getDate()).padStart(2, '0');
          setDate(localDate);
          setStartTime(start.getHours().toString().padStart(2, '0') + ':' + start.getMinutes().toString().padStart(2, '0'));
          setEndTime(end.getHours().toString().padStart(2, '0') + ':' + end.getMinutes().toString().padStart(2, '0'));
          setTitle(eventToEdit.patientName || 'Bloqueio de Agenda');
      } else {
          if (initialDate) {
              const localDate = initialDate.getFullYear() + '-' + String(initialDate.getMonth() + 1).padStart(2, '0') + '-' + String(initialDate.getDate()).padStart(2, '0');
              setDate(localDate);
              const h = initialDate.getHours().toString().padStart(2, '0');
              const m = initialDate.getMinutes().toString().padStart(2, '0');
              setStartTime(`${h}:${m}`);
              const endD = new Date(initialDate);
              endD.setHours(endD.getHours() + 1);
              const eh = endD.getHours().toString().padStart(2, '0');
              const em = endD.getMinutes().toString().padStart(2, '0');
              setEndTime(`${eh}:${em}`);
          }
          setTitle('Bloqueio de Agenda');
      }
    }, [isOpen, eventToEdit, initialDate]); 
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      const startD = new Date(`${date}T${startTime}`);
      const endD = new Date(`${date}T${endTime}`);
  
      if (isNaN(startD.getTime()) || isNaN(endD.getTime()) || endD <= startD) {
          alert("Horário inválido.");
          setLoading(false);
          return;
      }
  
      await onSave({ start: startD, end: endD, title, id: eventToEdit?.id });
      setLoading(false);
      onClose();
    };
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/40 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center">
            <h3 className="font-bold text-lg text-neutral-900">{eventToEdit ? 'Editar Bloqueio' : 'Novo Bloqueio'}</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500">✕</button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1">Título</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1">Data</label>
              <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-2 bg-white border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1">Início</label>
                  <input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full px-4 py-2 bg-white border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1">Término</label>
                  <input type="time" required value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full px-4 py-2 bg-white border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
            </div>
            <div className="pt-4 flex gap-3 justify-end">
              <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button type="submit" isLoading={loading}>{eventToEdit ? 'Salvar' : 'Criar'}</Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

const EventDetails = ({ event, onClose, onDelete }: { event: Consultation, onClose: () => void, onDelete: (id: string) => void }) => {
    if (!event) return null;
    const isManual = event.patientId === 'manual';
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/30 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={onClose}>
             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className={`h-24 relative ${isManual ? 'bg-neutral-100' : 'bg-gradient-primary'}`}>
                    <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-neutral-900 rounded-full p-1.5 backdrop-blur-sm transition-colors">✕</button>
                    <div className="absolute -bottom-6 left-6">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${isManual ? 'bg-white text-neutral-500 border border-neutral-100' : 'bg-white text-primary'}`}>
                             {isManual ? <Icons.Lock /> : <Icons.Video />}
                        </div>
                    </div>
                </div>
                <div className="pt-8 px-6 pb-6">
                    <h3 className="text-sm font-bold uppercase text-neutral-400 mb-1 tracking-wide">{isManual ? 'Bloqueio' : 'Consulta'}</h3>
                    <h2 className="text-xl font-bold text-neutral-900 mb-4">{event.patientName}</h2>
                    <div className="text-sm text-neutral-600 space-y-1 mb-6">
                        <p>📅 {new Date(event.start_at).toLocaleDateString()}</p>
                        <p>⏰ {new Date(event.start_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {new Date(event.end_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                    </div>
                    {isManual ? (
                         <Button variant="danger" className="w-full" onClick={() => onDelete(event.id)}>Excluir Bloqueio</Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button className="w-full" onClick={() => window.open(event.meeting?.meetLink, '_blank')}>Entrar na Sala</Button>
                        </div>
                    )}
                </div>
             </div>
        </div>
    );
};

// --- Agenda List View (Mobile Optimized) ---
const AgendaListView = ({ events, currentDate, onNext, onPrev }: any) => {
    const sorted = [...events].sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
    
    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex justify-between items-center">
                 <button onClick={onPrev} className="p-2 hover:bg-white rounded-lg transition-colors"><Icons.ChevronLeft /></button>
                 <span className="font-bold text-neutral-900">{currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                 <button onClick={onNext} className="p-2 hover:bg-white rounded-lg transition-colors"><Icons.ChevronRight /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {sorted.length === 0 ? (
                    <div className="text-center py-12 text-neutral-400">
                        <p>Agenda livre neste dia.</p>
                    </div>
                ) : (
                    sorted.map((apt: Consultation) => {
                         const start = new Date(apt.start_at);
                         const end = new Date(apt.end_at);
                         const isManual = apt.patientId === 'manual';
                         return (
                             <div key={apt.id} className="flex gap-4 group">
                                 <div className="flex flex-col items-center w-14 pt-1">
                                     <span className="text-sm font-bold text-neutral-900">{start.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                     <span className="text-xs text-neutral-400">{end.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                     <div className="h-full w-px bg-neutral-100 my-2 group-last:hidden"></div>
                                 </div>
                                 <div className={`flex-1 p-4 rounded-xl border mb-2 ${isManual ? 'bg-neutral-50 border-neutral-200' : 'bg-white border-primary/20 shadow-sm'}`}>
                                     <div className="flex justify-between items-start">
                                         <h4 className={`font-bold ${isManual ? 'text-neutral-600' : 'text-neutral-900'}`}>{apt.patientName}</h4>
                                         {isManual ? <Icons.Lock /> : <div className="text-primary"><Icons.Video /></div>}
                                     </div>
                                     <p className="text-xs text-neutral-500 mt-1">{isManual ? 'Horário Bloqueado' : 'Videoconsulta'}</p>
                                 </div>
                             </div>
                         );
                    })
                )}
            </div>
        </div>
    );
};

// --- Main Calendar Component ---

const ProfessionalCalendar = () => {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    
    // View State
    const [viewMode, setViewMode] = useState<ViewMode>('week');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Consultation[]>([]);
    const [availability, setAvailability] = useState<any>(null);
    
    // Interaction State
    const [toast, setToast] = useState<{msg: string, type: 'error' | 'success'} | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [modalInitialDate, setModalInitialDate] = useState<Date | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<Consultation | null>(null);
    
    // Responsive Layout Logic
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 640) { // Mobile
                setViewMode(prev => (prev === 'agenda' ? 'agenda' : 'day'));
            } else if (width < 1024) { // Tablet
                setViewMode('3day');
            } else { // Desktop
                setViewMode('week');
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Calculate visible days based on viewMode
    const visibleDays = useMemo(() => {
        const start = new Date(currentDate);
        const days = [];
        
        if (viewMode === 'day' || viewMode === 'agenda') {
            days.push(new Date(start));
        } else if (viewMode === '3day') {
             // Tenta centralizar ou mostrar próximos 2
             days.push(new Date(start));
             days.push(addDays(start, 1));
             days.push(addDays(start, 2));
        } else {
             // Week view: Find start of week (Sunday or Monday)
             const day = start.getDay();
             // Assuming Sunday start for now
             const diff = start.getDate() - day;
             const sunday = new Date(start);
             sunday.setDate(diff);

             for (let i = 0; i < 7; i++) {
                 days.push(addDays(sunday, i));
             }
        }
        return days;
    }, [currentDate, viewMode]);

    // Data Fetching
    useEffect(() => {
        if (!auth.currentUser) return;
        const fetch = async () => {
            try {
                // Fetch Appointments
                const q = query(collection(db, 'consultations'), where('professionalId', '==', auth.currentUser!.uid));
                const snap = await getDocs(q);
                const list: Consultation[] = [];
                snap.forEach(d => list.push({ id: d.id, ...d.data() } as Consultation));
                setAppointments(list);

                // Fetch Availability
                const docRef = doc(db, 'professionals', auth.currentUser!.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setAvailability(docSnap.data().availability || {});
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    // Navigation Handlers
    const navigateTime = (direction: 'next' | 'prev') => {
        const jump = viewMode === 'week' ? 7 : viewMode === '3day' ? 3 : 1;
        setCurrentDate(addDays(currentDate, direction === 'next' ? jump : -jump));
    };

    // Slot Check (UPDATED FOR MULTI-SLOT SUPPORT)
    const isSlotAvailable = (day: Date, hour: number) => {
        if (!availability) return true; // Default open if no config loaded yet
        
        const key = WEEKDAY_KEYS[day.getDay()];
        const config = availability[key];
        
        if (!config || !config.active) return false;

        const slotMin = hour * 60;
        
        // Handle New Multi-Slot Format
        if (config.slots && Array.isArray(config.slots) && config.slots.length > 0) {
            return config.slots.some((slot: any) => {
                const startMin = parseTimeToMinutes(slot.start);
                const endMin = parseTimeToMinutes(slot.end);
                return slotMin >= startMin && slotMin < endMin;
            });
        }

        // Handle Legacy Single-Slot Format
        if (config.start && config.end) {
            const startMin = parseTimeToMinutes(config.start);
            const endMin = parseTimeToMinutes(config.end);
            return slotMin >= startMin && slotMin < endMin;
        }

        return false;
    };

    // CRUD Handlers
    const handleSaveBlock = async (data: any) => {
        if (!auth.currentUser) return;
        try {
            const newEvent = {
                professionalId: auth.currentUser.uid,
                professionalName: 'Agenda',
                patientId: 'manual',
                patientName: data.title,
                start_at: data.start.toISOString(),
                end_at: data.end.toISOString(),
                status: 'paid',
                price_cents: 0,
                created_at: new Date().toISOString()
            };
            const ref = await addDoc(collection(db, 'consultations'), newEvent);
            setAppointments([...appointments, { id: ref.id, ...newEvent } as Consultation]);
            setToast({ msg: 'Bloqueio criado com sucesso', type: 'success' });
        } catch (e) {
            setToast({ msg: 'Erro ao criar bloqueio', type: 'error' });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'consultations', id));
            setAppointments(appointments.filter(a => a.id !== id));
            setSelectedEvent(null);
            setToast({ msg: 'Removido com sucesso', type: 'success' });
        } catch (e) {
            setToast({ msg: 'Erro ao remover', type: 'error' });
        }
    };

    // Create Modal Trigger
    const openCreate = (d: Date, h: number) => {
        const date = new Date(d);
        date.setHours(h);
        date.setMinutes(0);
        setModalInitialDate(date);
        setIsCreateOpen(true);
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex flex-col h-screen overflow-hidden">
            <Navbar userRole={UserRole.PROFESSIONAL} isAuthenticated={true} />
            
            {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
            
            <EventModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSave={handleSaveBlock} initialDate={modalInitialDate} />
            <EventDetails event={selectedEvent!} onClose={() => setSelectedEvent(null)} onDelete={handleDelete} />

            {/* --- Toolbar --- */}
            <div className="px-4 py-4 md:px-8 border-b border-neutral-200 bg-white flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 z-20 shadow-sm">
                
                {/* Left: Navigation & Date */}
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                    <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
                        <button onClick={() => navigateTime('prev')} className="p-1.5 hover:bg-white rounded-md transition-shadow text-neutral-600"><Icons.ChevronLeft /></button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide hover:bg-white rounded-md transition-shadow text-neutral-600">Hoje</button>
                        <button onClick={() => navigateTime('next')} className="p-1.5 hover:bg-white rounded-md transition-shadow text-neutral-600"><Icons.ChevronRight /></button>
                    </div>
                    
                    {/* Date Picker Trigger */}
                    <div className="relative">
                        <h2 className="text-xl font-bold text-neutral-900 cursor-pointer flex items-center gap-2 hover:text-primary transition-colors">
                            {visibleDays[0].toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                            <span className="text-neutral-400 text-sm font-normal hidden sm:inline-block">▼</span>
                        </h2>
                        <input 
                            type="date" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={(e) => {
                                if(e.target.valueAsDate) setCurrentDate(e.target.valueAsDate);
                            }}
                        />
                    </div>
                </div>

                {/* Right: View Toggles & Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex bg-neutral-100 p-1 rounded-lg w-full md:w-auto">
                         {['day', '3day', 'week'].map(mode => (
                             <button 
                                key={mode}
                                onClick={() => setViewMode(mode as ViewMode)}
                                className={`flex-1 md:flex-none px-3 py-1.5 text-xs font-bold uppercase rounded-md transition-all ${viewMode === mode ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-400 hover:text-neutral-600 hidden md:block'}`}
                             >
                                 {mode === 'day' ? 'Dia' : mode === '3day' ? '3 Dias' : 'Semana'}
                             </button>
                         ))}
                         <button 
                            onClick={() => setViewMode('agenda')}
                            className={`flex-1 md:flex-none px-3 py-1.5 text-xs font-bold uppercase rounded-md transition-all md:hidden ${viewMode === 'agenda' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-400'}`}
                         >
                             Lista
                         </button>
                    </div>
                    
                    <Button onClick={() => openCreate(new Date(), 9)} className="whitespace-nowrap shadow-lg shadow-primary/20">
                        <span className="hidden sm:inline">+ Novo Bloqueio</span>
                        <span className="sm:hidden"><Icons.Plus /></span>
                    </Button>
                </div>
            </div>

            {/* --- Main Content --- */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
                
                {viewMode === 'agenda' ? (
                    <div className="flex-1 p-4 overflow-hidden">
                        <AgendaListView 
                            events={appointments.filter(a => isSameDay(new Date(a.start_at), currentDate))} 
                            currentDate={currentDate} 
                            onNext={() => navigateTime('next')}
                            onPrev={() => navigateTime('prev')}
                        />
                    </div>
                ) : (
                    <div ref={containerRef} className="flex-1 overflow-y-auto overflow-x-hidden bg-white flex relative">
                        
                        {/* Time Column */}
                        <div className="w-16 flex-shrink-0 border-r border-neutral-100 bg-white sticky left-0 z-30">
                            <div className="h-12 border-b border-neutral-100"></div> {/* Header Spacer */}
                            {HOURS.map(h => (
                                <div key={h} className="relative border-b border-transparent" style={{ height: CELL_HEIGHT }}>
                                    <span className="absolute -top-3 right-3 text-xs font-medium text-neutral-400 bg-white px-1">
                                        {h}:00
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Days Columns */}
                        <div className="flex-1 flex min-w-0">
                            {visibleDays.map((day, dayIdx) => {
                                const isToday = isSameDay(day, new Date());
                                const dayEvents = appointments.filter(a => isSameDay(new Date(a.start_at), day));

                                return (
                                    <div key={dayIdx} className="flex-1 border-r border-neutral-100 min-w-[100px] relative">
                                        
                                        {/* Day Header */}
                                        <div className={`sticky top-0 h-12 flex flex-col items-center justify-center border-b border-neutral-100 z-20 ${isToday ? 'bg-primary/5' : 'bg-white/95 backdrop-blur-sm'}`}>
                                            <span className={`text-[10px] font-bold uppercase ${isToday ? 'text-primary' : 'text-neutral-500'}`}>
                                                {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                                            </span>
                                            <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${isToday ? 'bg-primary text-white shadow-md shadow-primary/30' : 'text-neutral-900'}`}>
                                                {day.getDate()}
                                            </div>
                                        </div>

                                        {/* Slots Grid */}
                                        <div className="relative">
                                            {/* Background Availability Pattern */}
                                            {HOURS.map(h => {
                                                const available = isSlotAvailable(day, h);
                                                return (
                                                    <div 
                                                        key={h} 
                                                        onClick={() => openCreate(day, h)}
                                                        className={`border-b border-neutral-100 cursor-pointer transition-colors hover:bg-primary/5 ${!available ? 'bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIi8+CjxwYXRoIGQ9Ik0wIDhMOCAwTTEgOUw5IDFNMCA4TDggME0tMSAxTDEgLTEiIHN0cm9rZT0iI2Y1ZjVmNSIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjwvc3ZnPg==")]' : ''}`}
                                                        style={{ height: CELL_HEIGHT }}
                                                    >
                                                    </div>
                                                );
                                            })}

                                            {/* Current Time Indicator */}
                                            {isToday && (
                                                <div 
                                                    className="absolute left-0 right-0 border-t-2 border-red-500 z-10 pointer-events-none shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                                                    style={{ 
                                                        top: ((new Date().getHours() - HOURS[0]) * 60 + new Date().getMinutes()) * PIXELS_PER_MINUTE 
                                                    }}
                                                >
                                                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full absolute -top-[6px] -left-[5px] border-2 border-white"></div>
                                                </div>
                                            )}

                                            {/* Events */}
                                            {dayEvents.map(apt => {
                                                const start = new Date(apt.start_at);
                                                const end = new Date(apt.end_at);
                                                const startMin = (start.getHours() - HOURS[0]) * 60 + start.getMinutes();
                                                const duration = (end.getTime() - start.getTime()) / (1000 * 60);
                                                const isManual = apt.patientId === 'manual';

                                                if (start.getHours() < HOURS[0]) return null; // Skip if before start time

                                                return (
                                                    <div
                                                        key={apt.id}
                                                        onClick={(e) => { e.stopPropagation(); setSelectedEvent(apt); }}
                                                        className={`absolute left-1 right-1 rounded-lg border-l-4 p-2 text-xs shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer overflow-hidden ${
                                                            isManual 
                                                            ? 'bg-neutral-50 border-neutral-400 text-neutral-700' 
                                                            : 'bg-blue-50 border-primary text-primary'
                                                        }`}
                                                        style={{
                                                            top: startMin * PIXELS_PER_MINUTE,
                                                            height: Math.max(duration * PIXELS_PER_MINUTE, 32)
                                                        }}
                                                    >
                                                        <div className="font-bold truncate flex items-center gap-1">
                                                            {isManual && <Icons.Lock />}
                                                            {apt.patientName}
                                                        </div>
                                                        <div className="opacity-80 truncate">
                                                            {start.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {end.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfessionalCalendar;
