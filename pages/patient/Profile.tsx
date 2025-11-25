
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { UserRole, UserProfile } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore/lite';

// --- Icons ---
const Icons = {
  User: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Heart: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  Shield: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Scale: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>,
  Plus: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
};

// --- Helper Components ---

const TagInput = ({ tags = [], onAdd, onRemove, placeholder, icon }: any) => {
    const [input, setInput] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && input.trim()) {
            e.preventDefault();
            if (!tags.includes(input.trim())) {
                onAdd(input.trim());
            }
            setInput('');
        }
    };

    return (
        <div className="bg-white border border-neutral-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag: string) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-medium animate-in zoom-in duration-200">
                        {tag}
                        <button onClick={() => onRemove(tag)} className="hover:text-red-500 transition-colors"><Icons.Trash /></button>
                    </span>
                ))}
            </div>
            <div className="flex items-center gap-3 px-2">
                {icon && <div className="text-neutral-400">{icon}</div>}
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={tags.length === 0 ? placeholder : "Adicionar outro..."}
                    className="w-full bg-transparent outline-none text-sm py-2"
                />
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 w-full p-4 rounded-xl transition-all duration-300 group text-left ${
            active 
            ? 'bg-primary text-white shadow-lg shadow-primary/30' 
            : 'bg-transparent text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
        }`}
    >
        <Icon />
        <span className="font-bold text-sm">{label}</span>
        {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>}
    </button>
);

const PatientProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'clinical' | 'account'>('personal');
  
  // Data State
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Load Data
  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) {
        navigate('/auth');
        return;
      }
      try {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            const profileData = data.profile || data;
            
            // Ensure clinical structure exists
            const clinicalData = profileData.clinical || {
                height: '',
                weight: '',
                bloodType: '',
                allergies: [],
                medications: []
            };

            setProfile({ 
                uid: auth.currentUser.uid, 
                ...profileData,
                clinical: clinicalData
            });
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // Handlers
  const handleSave = async () => {
    if (!auth.currentUser || !profile) return;
    setSaving(true);

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
          'profile.name': profile.name,
          'profile.phone': profile.phone,
          'profile.birthDate': profile.birthDate,
          'profile.gender': profile.gender,
          'profile.clinical': profile.clinical
      });
      // Show simplistic toast/alert
      const btn = document.getElementById('save-btn');
      if(btn) {
          const original = btn.innerText;
          btn.innerText = "Salvo com Sucesso!";
          btn.classList.add('bg-green-500');
          setTimeout(() => {
              btn.innerText = original;
              btn.classList.remove('bg-green-500');
          }, 2000);
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  // Clinical Helpers
  const updateClinical = (field: string, value: any) => {
      if(!profile) return;
      setProfile({
          ...profile,
          clinical: { ...profile.clinical, [field]: value }
      });
  };

  const calculateBMI = () => {
      const h = Number(profile?.clinical?.height) / 100;
      const w = Number(profile?.clinical?.weight);
      if (h > 0 && w > 0) return (w / (h * h)).toFixed(1);
      return null;
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (!profile) return null;

  const bmi = calculateBMI();

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24 md:pb-12">
      <Navbar userRole={UserRole.PATIENT} isAuthenticated={true} />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        
        {/* --- Header Mobile (Tabs) --- */}
        <div className="md:hidden flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar">
             {[
                 { id: 'personal', label: 'Pessoal', icon: Icons.User },
                 { id: 'clinical', label: 'Clínico', icon: Icons.Heart },
                 { id: 'account', label: 'Conta', icon: Icons.Shield },
             ].map(tab => (
                 <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${
                        activeTab === tab.id 
                        ? 'bg-neutral-900 text-white shadow-md' 
                        : 'bg-white text-neutral-500 border border-neutral-100'
                    }`}
                 >
                     <tab.icon />
                     {tab.label}
                 </button>
             ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* === LEFT COLUMN: Identity & Nav (Desktop) === */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* Identity Card */}
                <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-xl shadow-neutral-100/50 text-center relative overflow-hidden group">
                     <div className="absolute top-0 left-0 w-full h-24 bg-gradient-primary opacity-10 group-hover:opacity-20 transition-opacity"></div>
                     
                     <div className="relative z-10 -mt-2">
                        <div className="w-28 h-28 mx-auto rounded-full p-1 bg-white shadow-lg mb-4">
                            <img 
                                src={profile.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}`} 
                                alt="Avatar" 
                                className="w-full h-full rounded-full object-cover bg-neutral-100"
                            />
                        </div>
                        <h2 className="text-xl font-bold text-neutral-900">{profile.name}</h2>
                        <p className="text-neutral-500 text-sm mb-4">{profile.email}</p>
                        
                        {/* Completion Bar */}
                        <div className="bg-neutral-50 rounded-xl p-3 text-left">
                            <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-neutral-500">Perfil Health ID</span>
                                <span className="text-primary">85%</span>
                            </div>
                            <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                                <div className="h-full w-[85%] bg-primary rounded-full"></div>
                            </div>
                        </div>
                     </div>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex flex-col gap-2">
                    <TabButton 
                        active={activeTab === 'personal'} 
                        onClick={() => setActiveTab('personal')} 
                        icon={Icons.User} 
                        label="Dados Pessoais" 
                    />
                    <TabButton 
                        active={activeTab === 'clinical'} 
                        onClick={() => setActiveTab('clinical')} 
                        icon={Icons.Heart} 
                        label="Ficha Clínica (Health ID)" 
                    />
                    <TabButton 
                        active={activeTab === 'account'} 
                        onClick={() => setActiveTab('account')} 
                        icon={Icons.Shield} 
                        label="Segurança e Conta" 
                    />
                </div>
            </div>

            {/* === RIGHT COLUMN: Content Forms === */}
            <div className="lg:col-span-8">
                
                {/* --- TAB: PERSONAL --- */}
                {activeTab === 'personal' && (
                    <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6 md:p-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-neutral-900">Dados Pessoais</h2>
                                <p className="text-neutral-500 text-sm">Informações básicas para sua identificação.</p>
                            </div>
                            <div className="hidden md:block p-3 bg-neutral-50 rounded-xl text-neutral-400">
                                <Icons.User />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Nome Completo</label>
                                <input 
                                    type="text" 
                                    value={profile.name}
                                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-neutral-900"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">CPF</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={profile.cpf || ''}
                                        disabled
                                        className="w-full px-4 py-3 bg-neutral-100 border border-neutral-200 rounded-xl text-neutral-500 cursor-not-allowed font-mono"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Icons.Shield />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Telefone</label>
                                <input 
                                    type="tel" 
                                    value={profile.phone || ''}
                                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                                    placeholder="(00) 00000-0000"
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-neutral-900"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Data de Nascimento</label>
                                <input 
                                    type="date" 
                                    value={profile.birthDate || ''}
                                    onChange={(e) => setProfile({...profile, birthDate: e.target.value})}
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-neutral-900"
                                />
                            </div>

                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Gênero</label>
                                <div className="flex gap-4">
                                    {['Feminino', 'Masculino', 'Outro'].map(g => (
                                        <button
                                            key={g}
                                            onClick={() => setProfile({...profile, gender: g})}
                                            className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${
                                                profile.gender === g 
                                                ? 'bg-neutral-900 text-white border-neutral-900' 
                                                : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50'
                                            }`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB: CLINICAL (Health ID) --- */}
                {activeTab === 'clinical' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        
                        {/* Bioimpedance Card */}
                        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                            
                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md text-emerald-400">
                                    <Icons.Scale />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Biometria</h3>
                                    <p className="text-neutral-400 text-xs">Dados essenciais para triagem.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-8 relative z-10">
                                <div>
                                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide block mb-2">Peso (kg)</label>
                                    <input 
                                        type="number" 
                                        value={profile.clinical?.weight}
                                        onChange={(e) => updateClinical('weight', e.target.value)}
                                        placeholder="0"
                                        className="w-full bg-transparent text-3xl font-bold border-b border-white/20 focus:border-primary outline-none pb-1 placeholder-neutral-700"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide block mb-2">Altura (cm)</label>
                                    <input 
                                        type="number" 
                                        value={profile.clinical?.height}
                                        onChange={(e) => updateClinical('height', e.target.value)}
                                        placeholder="0"
                                        className="w-full bg-transparent text-3xl font-bold border-b border-white/20 focus:border-primary outline-none pb-1 placeholder-neutral-700"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide block mb-2">IMC Calc.</label>
                                    <div className="text-3xl font-bold text-emerald-400">
                                        {bmi || '--'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Forms */}
                        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6 md:p-8">
                             
                             {/* Blood Type */}
                             <div className="mb-8">
                                 <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide block mb-3">Tipo Sanguíneo</label>
                                 <div className="flex flex-wrap gap-3">
                                     {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                                         <button
                                            key={type}
                                            onClick={() => updateClinical('bloodType', type)}
                                            className={`w-12 h-12 rounded-full font-bold text-sm border transition-all ${
                                                profile.clinical?.bloodType === type
                                                ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-200'
                                                : 'bg-white text-neutral-500 border-neutral-200 hover:border-red-300 hover:text-red-500'
                                            }`}
                                         >
                                             {type}
                                         </button>
                                     ))}
                                 </div>
                             </div>

                             {/* Allergies */}
                             <div className="mb-8">
                                 <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide block mb-3">Alergias Conhecidas</label>
                                 <TagInput 
                                     tags={profile.clinical?.allergies} 
                                     onAdd={(tag: string) => updateClinical('allergies', [...(profile.clinical?.allergies || []), tag])}
                                     onRemove={(tag: string) => updateClinical('allergies', profile.clinical?.allergies?.filter((t: string) => t !== tag))}
                                     placeholder="Ex: Penicilina, Amendoim (Pressione Enter)"
                                     icon={<span className="text-red-400">⚠️</span>}
                                 />
                             </div>

                             {/* Medications */}
                             <div>
                                 <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide block mb-3">Medicamentos em Uso</label>
                                 <TagInput 
                                     tags={profile.clinical?.medications} 
                                     onAdd={(tag: string) => updateClinical('medications', [...(profile.clinical?.medications || []), tag])}
                                     onRemove={(tag: string) => updateClinical('medications', profile.clinical?.medications?.filter((t: string) => t !== tag))}
                                     placeholder="Ex: Losartana 50mg (Pressione Enter)"
                                     icon={<span className="text-blue-400">💊</span>}
                                 />
                             </div>

                        </div>
                    </div>
                )}

                {/* --- TAB: ACCOUNT --- */}
                {activeTab === 'account' && (
                    <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6 md:p-8 animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
                         <div>
                             <h2 className="text-2xl font-bold text-neutral-900 mb-6">Segurança da Conta</h2>
                             
                             <div className="space-y-4">
                                 <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                                     <div>
                                         <p className="font-bold text-sm text-neutral-900">Senha de Acesso</p>
                                         <p className="text-xs text-neutral-500">Alterada pela última vez há 3 meses.</p>
                                     </div>
                                     <Button variant="secondary" size="sm">Alterar</Button>
                                 </div>

                                 <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                                     <div>
                                         <p className="font-bold text-sm text-neutral-900">Autenticação de 2 Fatores (2FA)</p>
                                         <p className="text-xs text-neutral-500">Adicione uma camada extra de segurança.</p>
                                     </div>
                                     <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-200 cursor-pointer">
                                         <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition"/>
                                     </div>
                                 </div>
                             </div>
                         </div>

                         <div>
                             <h2 className="text-lg font-bold text-neutral-900 mb-4">Métodos de Pagamento</h2>
                             <div className="p-4 border-2 border-dashed border-neutral-200 rounded-xl flex flex-col items-center justify-center text-center hover:bg-neutral-50 transition-colors cursor-pointer group">
                                 <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-white group-hover:shadow-sm">
                                     <Icons.Plus />
                                 </div>
                                 <p className="text-sm font-bold text-neutral-600">Adicionar Cartão de Crédito</p>
                                 <p className="text-xs text-neutral-400">Processado via Stripe Seguro</p>
                             </div>
                         </div>
                    </div>
                )}
            </div>
        </div>

        {/* --- STICKY FOOTER ACTION --- */}
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 p-4 z-40 md:static md:bg-transparent md:border-0 md:p-0 md:mt-8 md:flex md:justify-end">
             <div className="max-w-7xl mx-auto md:mx-0 w-full md:w-auto">
                 <Button 
                    id="save-btn"
                    onClick={handleSave} 
                    isLoading={saving}
                    className="w-full md:w-auto shadow-xl shadow-primary/20 md:px-12 h-12 text-base"
                 >
                     Salvar Alterações
                 </Button>
             </div>
        </div>

      </main>
    </div>
  );
};

export default PatientProfile;
