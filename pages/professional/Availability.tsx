
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { UserRole } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore/lite';

// --- Types & Constants ---

type TimeSlot = {
  id: string;
  start: string;
  end: string;
  error?: boolean; // UI state for conflict
};

type DayConfig = {
  active: boolean;
  slots: TimeSlot[];
};

type AvailabilityState = Record<string, DayConfig>;

const WEEKDAYS = [
  { id: 'monday', label: 'Segunda-feira', short: 'Seg' },
  { id: 'tuesday', label: 'Terça-feira', short: 'Ter' },
  { id: 'wednesday', label: 'Quarta-feira', short: 'Qua' },
  { id: 'thursday', label: 'Quinta-feira', short: 'Qui' },
  { id: 'friday', label: 'Sexta-feira', short: 'Sex' },
  { id: 'saturday', label: 'Sábado', short: 'Sáb' },
  { id: 'sunday', label: 'Domingo', short: 'Dom' },
];

const DEFAULT_SLOT = { start: '09:00', end: '12:00' };

// --- Icons ---
const Icons = {
    Plus: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
    Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    Copy: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>,
    Clock: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    ChevronDown: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>,
    Alert: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
};

// --- Helper Components ---

const TimeInput = ({ value, onChange, error }: { value: string, onChange: (val: string) => void, error?: boolean }) => (
    <div className="relative">
        <input 
            type="time" 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full pl-3 pr-2 py-2 bg-white border rounded-lg text-sm font-medium text-neutral-900 focus:ring-2 outline-none transition-all cursor-pointer ${
                error 
                ? 'border-danger/50 focus:border-danger focus:ring-danger/20 text-danger' 
                : 'border-neutral-200 focus:border-primary focus:ring-primary/20 hover:border-neutral-300'
            }`}
        />
        {error && <div className="absolute right-8 top-1/2 -translate-y-1/2 text-danger"><Icons.Alert /></div>}
    </div>
);

const CopyModal = ({ isOpen, onClose, onConfirm, sourceDayLabel }: any) => {
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    
    useEffect(() => {
        // Reset selection when opened, select weekdays by default minus source
        if (isOpen) setSelectedDays(WEEKDAYS.filter(d => d.label !== sourceDayLabel && d.id !== 'saturday' && d.id !== 'sunday').map(d => d.id));
    }, [isOpen, sourceDayLabel]);

    const toggleDay = (id: string) => {
        setSelectedDays(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-neutral-100">
                <div className="p-5 border-b border-neutral-100">
                    <h3 className="font-bold text-neutral-900">Replicar Horários</h3>
                    <p className="text-xs text-neutral-500 mt-1">Copiar configuração de <span className="font-bold text-primary">{sourceDayLabel}</span> para:</p>
                </div>
                <div className="p-5 grid grid-cols-2 gap-3">
                    {WEEKDAYS.filter(d => d.label !== sourceDayLabel).map(day => (
                        <button 
                            key={day.id}
                            onClick={() => toggleDay(day.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                selectedDays.includes(day.id) 
                                ? 'bg-primary text-white shadow-md shadow-primary/20' 
                                : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100'
                            }`}
                        >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedDays.includes(day.id) ? 'border-white bg-white' : 'border-neutral-300'}`}>
                                {selectedDays.includes(day.id) && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                            </div>
                            {day.label}
                        </button>
                    ))}
                </div>
                <div className="p-5 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-3">
                    <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
                    <Button size="sm" onClick={() => onConfirm(selectedDays)}>Aplicar Cópia</Button>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

const ProfessionalAvailability = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State
  const [availability, setAvailability] = useState<AvailabilityState>({});
  const [settings, setSettings] = useState({ sessionDuration: 50, bufferTime: 10 });
  
  // UI State
  const [expandedDay, setExpandedDay] = useState<string | null>('monday'); // Accordion
  const [copyModal, setCopyModal] = useState<{ isOpen: boolean, sourceDay: string | null }>({ isOpen: false, sourceDay: null });

  // Load Data
  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;
      try {
        const docRef = doc(db, 'professionals', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // --- MIGRATION LOGIC (Single Slot -> Multi Slot) ---
          const rawAvail = data.availability || {};
          const newAvail: AvailabilityState = {};
          
          WEEKDAYS.forEach(day => {
            const dayData = rawAvail[day.id];
            if (dayData) {
                // Se já tem slots (novo formato), usa. Se não, converte start/end (velho formato).
                if (dayData.slots) {
                    newAvail[day.id] = dayData;
                } else {
                    newAvail[day.id] = {
                        active: dayData.active,
                        slots: dayData.active ? [{ id: 'migrated-1', start: dayData.start, end: dayData.end }] : []
                    };
                }
            } else {
                newAvail[day.id] = { active: false, slots: [] };
            }
          });
          
          setAvailability(newAvail);
          if (data.sessionDuration) setSettings({ sessionDuration: data.sessionDuration, bufferTime: data.bufferTime || 0 });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Logic Helpers ---

  const validateSlots = (slots: TimeSlot[]) => {
      // Simple check: start < end. In real app, check overlaps.
      return slots.map(s => ({
          ...s,
          error: s.start >= s.end
      }));
  };

  const handleToggleDay = (dayId: string) => {
      setAvailability(prev => {
          const isActive = !prev[dayId].active;
          return {
              ...prev,
              [dayId]: {
                  active: isActive,
                  // If activating and no slots, add default
                  slots: isActive && prev[dayId].slots.length === 0 
                      ? [{ id: Math.random().toString(), ...DEFAULT_SLOT }] 
                      : prev[dayId].slots
              }
          };
      });
      // Auto expand if activating
      if (!availability[dayId].active) setExpandedDay(dayId);
  };

  const handleUpdateSlot = (dayId: string, slotId: string, field: 'start' | 'end', value: string) => {
      setAvailability(prev => ({
          ...prev,
          [dayId]: {
              ...prev[dayId],
              slots: validateSlots(prev[dayId].slots.map(s => s.id === slotId ? { ...s, [field]: value } : s))
          }
      }));
  };

  const handleAddSlot = (dayId: string) => {
      setAvailability(prev => ({
          ...prev,
          [dayId]: {
              ...prev[dayId],
              slots: [...prev[dayId].slots, { id: Math.random().toString(), start: '13:00', end: '17:00' }]
          }
      }));
  };

  const handleRemoveSlot = (dayId: string, slotId: string) => {
      setAvailability(prev => ({
          ...prev,
          [dayId]: {
              ...prev[dayId],
              slots: prev[dayId].slots.filter(s => s.id !== slotId)
          }
      }));
  };

  const handleCopyConfirm = (targetDays: string[]) => {
      if (!copyModal.sourceDay) return;
      const sourceConfig = availability[copyModal.sourceDay];

      setAvailability(prev => {
          const next = { ...prev };
          targetDays.forEach(target => {
              next[target] = {
                  active: sourceConfig.active,
                  slots: sourceConfig.slots.map(s => ({ ...s, id: Math.random().toString() })) // Clone w/ new IDs
              };
          });
          return next;
      });
      setCopyModal({ isOpen: false, sourceDay: null });
      alert(`Configuração copiada para ${targetDays.length} dias.`);
  };

  const handleSave = async () => {
      if (!auth.currentUser) return;
      setSaving(true);
      try {
          const docRef = doc(db, 'professionals', auth.currentUser.uid);
          
          // Clean up slots before saving (remove error flags)
          const cleanAvailability: any = {};
          Object.keys(availability).forEach(key => {
              cleanAvailability[key] = {
                  active: availability[key].active,
                  slots: availability[key].slots.map(({ id, start, end }) => ({ id, start, end }))
              };
          });

          await updateDoc(docRef, {
              availability: cleanAvailability,
              sessionDuration: settings.sessionDuration,
              bufferTime: settings.bufferTime
          });
          alert("Disponibilidade atualizada!");
          navigate('/professional/dashboard');
      } catch (e) {
          console.error(e);
          alert("Erro ao salvar.");
      } finally {
          setSaving(false);
      }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      <Navbar userRole={UserRole.PROFESSIONAL} isAuthenticated={true} />
      
      <CopyModal 
          isOpen={copyModal.isOpen} 
          onClose={() => setCopyModal({isOpen: false, sourceDay: null})} 
          onConfirm={handleCopyConfirm}
          sourceDayLabel={copyModal.sourceDay ? WEEKDAYS.find(d => d.id === copyModal.sourceDay)?.label : ''}
      />

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
                <button onClick={() => navigate(-1)} className="text-neutral-500 hover:text-neutral-900 text-sm mb-2 flex items-center gap-1">
                    ← Voltar
                </button>
                <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Gerenciar Disponibilidade</h1>
                <p className="text-neutral-500 mt-1">Configure seus horários de atendimento e regras de agendamento.</p>
            </div>
            <div className="flex items-center gap-3">
                 <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold mr-2 border border-blue-100">
                     <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                     Horário de Brasília (GMT-3)
                 </div>
                 <Button onClick={handleSave} isLoading={saving} className="shadow-xl shadow-primary/20">Salvar Alterações</Button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Global Settings */}
            <div className="lg:col-span-4 space-y-6">
                <Card className="p-6 border-l-4 border-l-primary shadow-lg">
                    <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
                        <Icons.Clock />
                        Regras de Sessão
                    </h3>
                    
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Duração da Consulta</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={settings.sessionDuration}
                                    onChange={(e) => setSettings({...settings, sessionDuration: parseInt(e.target.value) || 0})}
                                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none font-bold text-neutral-900"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-500 font-medium">minutos</span>
                            </div>
                            <p className="text-xs text-neutral-400 mt-1">Tempo total que o paciente bloqueia na sua agenda.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Intervalo entre Sessões (Buffer)</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={settings.bufferTime}
                                    onChange={(e) => setSettings({...settings, bufferTime: parseInt(e.target.value) || 0})}
                                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none font-bold text-neutral-900"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-500 font-medium">minutos</span>
                            </div>
                            <p className="text-xs text-neutral-400 mt-1">Descanso automático adicionado após cada consulta.</p>
                        </div>
                    </div>
                </Card>

                <div className="bg-neutral-900 rounded-xl p-6 text-neutral-400 text-sm hidden lg:block">
                    <p className="leading-relaxed">
                        <strong className="text-white block mb-2">Dica Pro:</strong>
                        Use intervalos múltiplos para definir seu horário de almoço. Por exemplo, adicione um slot das 08:00 às 12:00 e outro das 13:00 às 18:00.
                    </p>
                </div>
            </div>

            {/* Right Column: Weekly Schedule */}
            <div className="lg:col-span-8">
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                    {WEEKDAYS.map((day) => {
                        const config = availability[day.id] || { active: false, slots: [] };
                        const isExpanded = expandedDay === day.id;

                        return (
                            <div key={day.id} className={`border-b border-neutral-100 last:border-0 transition-all duration-300 ${config.active ? 'bg-white' : 'bg-neutral-50/50'}`}>
                                
                                {/* Header Row */}
                                <div className="flex items-center justify-between px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer" 
                                                checked={config.active}
                                                onChange={() => handleToggleDay(day.id)}
                                            />
                                            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                        <button 
                                            onClick={() => setExpandedDay(isExpanded ? null : day.id)}
                                            className="flex items-center gap-3 text-left focus:outline-none group"
                                        >
                                            <span className={`font-bold text-lg ${config.active ? 'text-neutral-900' : 'text-neutral-400 group-hover:text-neutral-600'}`}>
                                                {day.label}
                                            </span>
                                            {config.active && (
                                                <span className="text-xs font-medium px-2 py-0.5 bg-neutral-100 rounded-full text-neutral-500 group-hover:bg-neutral-200 transition-colors">
                                                    {config.slots.length} turnos
                                                </span>
                                            )}
                                        </button>
                                    </div>

                                    {config.active && (
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => setCopyModal({ isOpen: true, sourceDay: day.id })}
                                                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                title="Copiar para outros dias"
                                            >
                                                <Icons.Copy />
                                                Copiar
                                            </button>
                                            <button 
                                                onClick={() => setExpandedDay(isExpanded ? null : day.id)}
                                                className={`p-2 rounded-full hover:bg-neutral-100 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                            >
                                                <Icons.ChevronDown />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Expanded Content (Slots) */}
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded && config.active ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="px-6 pb-6 pt-0 pl-16 md:pl-20">
                                        <div className="space-y-3">
                                            {config.slots.map((slot, index) => (
                                                <div key={slot.id} className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2" style={{ animationDelay: `${index * 50}ms` }}>
                                                    <div className="flex-1 grid grid-cols-2 gap-3 max-w-sm">
                                                        <TimeInput 
                                                            value={slot.start} 
                                                            onChange={(val) => handleUpdateSlot(day.id, slot.id, 'start', val)} 
                                                            error={slot.error}
                                                        />
                                                        <div className="relative">
                                                            <div className="absolute -left-2 top-1/2 -translate-y-1/2 text-neutral-300 pointer-events-none font-bold">-</div>
                                                            <TimeInput 
                                                                value={slot.end} 
                                                                onChange={(val) => handleUpdateSlot(day.id, slot.id, 'end', val)}
                                                                error={slot.error}
                                                            />
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleRemoveSlot(day.id, slot.id)}
                                                        className="p-2.5 text-neutral-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Remover intervalo"
                                                    >
                                                        <Icons.Trash />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="mt-4 flex gap-4">
                                            <button 
                                                onClick={() => handleAddSlot(day.id)}
                                                className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-700 hover:bg-primary/5 px-3 py-2 rounded-lg transition-colors"
                                            >
                                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Icons.Plus />
                                                </div>
                                                Adicionar Intervalo
                                            </button>
                                            
                                            {/* Mobile Copy Button */}
                                            <button 
                                                onClick={() => setCopyModal({ isOpen: true, sourceDay: day.id })}
                                                className="sm:hidden flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 px-3 py-2 rounded-lg"
                                            >
                                                <Icons.Copy />
                                                Copiar Dia
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
      </main>
    </div>
  );
};

export default ProfessionalAvailability;
