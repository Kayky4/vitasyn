import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { UserRole, ProfessionalProfile } from '../types';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore/lite';

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [professional, setProfessional] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // State de agendamento
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  // Mock Dates (Em um app real, viriam da disponibilidade do profissional)
  const dates = [
      { label: 'Seg, 24 Out', value: '2023-10-24' },
      { label: 'Ter, 25 Out', value: '2023-10-25' },
      { label: 'Qua, 26 Out', value: '2023-10-26' }
  ];
  const times = ['09:00', '10:00', '14:00', '15:30'];

  useEffect(() => {
      const fetchPro = async () => {
          if (!id) return;
          try {
              const docRef = doc(db, 'professionals', id);
              const snap = await getDoc(docRef);
              if (snap.exists()) {
                  setProfessional(snap.data() as ProfessionalProfile);
              }
          } catch (e) {
              console.error(e);
          } finally {
              setLoading(false);
          }
      };
      fetchPro();
  }, [id]);

  const handlePayment = async () => {
    if (!auth.currentUser || !professional || !selectedDate || !selectedTime) return;
    
    setProcessing(true);
    
    try {
        // Mock Payment Delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Construir datas ISO
        const startAt = new Date(`${selectedDate}T${selectedTime}:00`);
        const endAt = new Date(startAt);
        endAt.setHours(endAt.getHours() + 1); // Duração padrão 1h

        // Salvar consulta no Firestore
        await addDoc(collection(db, 'consultations'), {
            patientId: auth.currentUser.uid,
            patientName: auth.currentUser.displayName || 'Paciente', // Fallback nome
            professionalId: professional.id,
            professionalName: professional.name,
            start_at: startAt.toISOString(),
            end_at: endAt.toISOString(),
            status: 'paid', // Simulando pagamento sucesso
            price_cents: professional.price_default_cents,
            meeting: {
                meetLink: 'https://meet.google.com/abc-defg-hij' // Mock link
            },
            created_at: new Date().toISOString()
        });

        // Add Notification
        await addDoc(collection(db, 'notifications'), {
            userId: auth.currentUser.uid,
            type: 'success',
            message: `Consulta confirmada com ${professional.name} para ${selectedDate} às ${selectedTime}.`,
            read: false,
            created_at: new Date().toISOString()
        });

        alert("Pagamento confirmado e consulta agendada!");
        navigate('/patient/dashboard');

    } catch (e) {
        console.error(e);
        alert("Erro ao processar agendamento.");
    } finally {
        setProcessing(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  if (!professional) return <div className="p-12 text-center">Profissional não encontrado.</div>;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar userRole={UserRole.PATIENT} isAuthenticated={true} />
      
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="text-neutral-500 hover:text-neutral-900 mb-4 text-sm">← Voltar</button>
          <div className="flex items-center gap-4 mb-2">
             <img src={professional.avatarUrl} className="w-12 h-12 rounded-full" alt={professional.name} />
             <div>
                <h1 className="text-3xl font-bold text-neutral-900">Agendar Consulta</h1>
                <p className="text-neutral-500">{professional.name} • {professional.professionalType}</p>
             </div>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Step 1: Date & Time */}
          <Card className={`transition-opacity duration-300 ${step === 1 ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <h2 className="font-bold text-lg mb-4">1. Selecione um Horário</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">Data</label>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {dates.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setSelectedDate(d.value)}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all whitespace-nowrap ${selectedDate === d.value ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary' : 'border-neutral-200 hover:border-primary/50'}`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            
            {selectedDate && (
              <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                 <label className="block text-sm font-medium text-neutral-700 mb-2">Horário</label>
                 <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                   {times.map(t => (
                     <button
                       key={t}
                       onClick={() => setSelectedTime(t)}
                       className={`px-4 py-2 rounded-lg border text-sm transition-all ${selectedTime === t ? 'bg-neutral-900 text-white border-neutral-900 shadow-md' : 'border-neutral-200 hover:border-neutral-400'}`}
                     >
                       {t}
                     </button>
                   ))}
                 </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button disabled={!selectedDate || !selectedTime} onClick={() => setStep(2)}>Continuar</Button>
            </div>
          </Card>

          {/* Step 2: Summary & Payment */}
          {step === 2 && (
            <Card className="animate-in fade-in slide-in-from-bottom-4 shadow-xl ring-1 ring-black/5">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="font-bold text-lg">2. Pagamento</h2>
                 <button onClick={() => setStep(1)} className="text-sm text-primary hover:underline">Alterar horário</button>
              </div>
              
              <div className="bg-neutral-50 p-6 rounded-xl mb-6 space-y-3 text-sm border border-neutral-100">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Profissional</span>
                  <span className="font-medium text-neutral-900">{professional.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Data</span>
                  <span className="font-medium text-neutral-900">{dates.find(d => d.value === selectedDate)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Horário</span>
                  <span className="font-medium text-neutral-900">{selectedTime}</span>
                </div>
                <div className="h-px bg-neutral-200 my-2"></div>
                <div className="flex justify-between text-lg font-bold text-neutral-900">
                  <span>Total</span>
                  <span>R$ {(professional.price_default_cents / 100).toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <Button className="w-full h-12 text-base shadow-lg shadow-primary/30" onClick={handlePayment} isLoading={processing}>
                Confirmar Pagamento e Agendar
              </Button>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-neutral-400">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                 <span className="text-xs">Ambiente seguro. Suas informações estão protegidas.</span>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default BookingPage;