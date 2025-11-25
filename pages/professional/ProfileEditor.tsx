
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { UserRole, ProfessionalProfile } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore/lite';

// Base de dados de sugestões por tipo
const SPECIALTY_OPTIONS: Record<string, string[]> = {
  'Psicólogo': [
    'Terapia Cognitivo-Comportamental (TCC)',
    'Psicanálise',
    'Ansiedade',
    'Depressão',
    'Terapia de Casal',
    'Neuropsicologia',
    'Luto',
    'Autismo',
    'TDAH',
    'Burnout'
  ],
  'Nutricionista': [
    'Nutrição Esportiva',
    'Emagrecimento',
    'Reeducação Alimentar',
    'Hipertrofia',
    'Nutrição Clínica',
    'Vegetarianismo',
    'Diabetes',
    'Saúde da Mulher',
    'Nutrição Infantil'
  ],
  'Fisioterapeuta': [
    'Ortopedia',
    'Traumatologia',
    'Fisioterapia Esportiva',
    'Pilates',
    'RPG',
    'Neurologia',
    'Geriatria',
    'Dores Crônicas',
    'Pós-Operatório'
  ]
};

const ProfessionalProfileEditor = () => {
  const navigate = useNavigate();
  
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState('');
  
  // Estado inicial vazio, será preenchido pelo useEffect
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);

  // Carregar dados do Firestore ao iniciar
  useEffect(() => {
    const fetchProfile = async () => {
        if (!auth.currentUser) {
            navigate('/auth');
            return;
        }

        try {
            const docRef = doc(db, 'professionals', auth.currentUser.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setProfile(docSnap.data() as ProfessionalProfile);
            } else {
                console.error("Perfil profissional não encontrado");
                // Fallback ou redirect
            }
        } catch (error) {
            console.error("Erro ao buscar perfil:", error);
        } finally {
            setLoadingData(false);
        }
    };

    fetchProfile();
  }, [navigate]);

  const handleSave = async () => {
    if (!profile || !auth.currentUser) return;
    
    setSaving(true);
    try {
        const docRef = doc(db, 'professionals', auth.currentUser.uid);
        
        // Atualizar apenas os campos permitidos
        await updateDoc(docRef, {
            name: profile.name,
            title: profile.title,
            bio: profile.bio,
            price_default_cents: profile.price_default_cents,
            specialties: profile.specialties,
            professionalType: profile.professionalType,
            registrationNumber: profile.registrationNumber
            // CPF não é atualizado aqui para segurança, pois é imutável
        });

        // Opcional: Mostrar toast de sucesso
        alert("Perfil atualizado com sucesso!"); // Simples feedback
        setTimeout(() => {
            navigate('/professional/dashboard');
        }, 500);
    } catch (error) {
        console.error("Erro ao salvar perfil:", error);
        alert("Erro ao salvar alterações.");
    } finally {
        setSaving(false);
    }
  };

  const addSpecialty = (tagToAdd: string) => {
    if (tagToAdd && profile) {
      if (!profile.specialties.includes(tagToAdd)) {
         setProfile({...profile, specialties: [...profile.specialties, tagToAdd]});
      }
      setNewSpecialty('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSpecialty(newSpecialty.trim());
    }
  };

  const removeSpecialty = (tag: string) => {
    if (profile) {
        setProfile({...profile, specialties: profile.specialties.filter(s => s !== tag)});
    }
  };

  if (loadingData || !profile) {
      return (
          <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
      );
  }

  // Filtrar sugestões que ainda não foram selecionadas
  const availableSuggestions = (SPECIALTY_OPTIONS[profile.professionalType] || [])
    .filter(s => !profile.specialties.includes(s));

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar userRole={UserRole.PROFESSIONAL} isAuthenticated={true} />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
           <button onClick={() => navigate(-1)} className="text-neutral-500 hover:text-neutral-900 text-sm mb-2 flex items-center gap-1">
               ← Voltar para Painel
            </button>
           <h1 className="text-3xl font-bold text-neutral-900">Editar Perfil Público</h1>
           <p className="text-neutral-500 mt-1">Gerencie suas informações visíveis e dados cadastrais.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form Column */}
          <div className="space-y-6">
            <Card className="p-8 shadow-lg">
                <div className="space-y-6">
                    {/* Foto */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Foto de Perfil</label>
                        <div className="flex items-center gap-6">
                            <img src={profile.avatarUrl} alt="Profile" className="w-20 h-20 rounded-full border-2 border-neutral-100 shadow-sm bg-white" />
                            <Button variant="secondary" size="sm">Alterar Foto</Button>
                        </div>
                    </div>

                    {/* Seção: Dados Pessoais */}
                    <div className="space-y-4 pt-2">
                        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-100 pb-2">Identificação</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Nome Completo</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-2 bg-white border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-neutral-900"
                                    value={profile.name}
                                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">CPF</label>
                                <input 
                                    type="text" 
                                    disabled
                                    className="w-full px-4 py-2 bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-500 cursor-not-allowed select-none"
                                    value={profile.cpf || 'Não informado'}
                                    title="O CPF não pode ser alterado. Contate o suporte."
                                />
                                <p className="text-[10px] text-neutral-400 mt-1">Dado sensível: somente leitura.</p>
                            </div>
                        </div>
                    </div>

                    {/* Seção: Dados Profissionais */}
                    <div className="space-y-4 pt-4">
                        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-100 pb-2">Dados Profissionais</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Tipo</label>
                                <select 
                                    className="w-full px-4 py-2 bg-white border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-neutral-900"
                                    value={profile.professionalType}
                                    onChange={(e) => setProfile({...profile, professionalType: e.target.value})}
                                >
                                    <option value="Psicólogo">Psicólogo</option>
                                    <option value="Nutricionista">Nutricionista</option>
                                    <option value="Fisioterapeuta">Fisioterapeuta</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Registro (CRM/CRP...)</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-2 bg-white border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-neutral-900"
                                    value={profile.registrationNumber}
                                    onChange={(e) => setProfile({...profile, registrationNumber: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Título de Exibição</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 bg-white border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-neutral-900"
                                value={profile.title}
                                onChange={(e) => setProfile({...profile, title: e.target.value})}
                                placeholder="Ex: Psicólogo Clínico Especialista em TCC"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Biografia</label>
                            <textarea 
                                rows={4}
                                className="w-full px-4 py-2 bg-white border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none resize-none text-neutral-900"
                                value={profile.bio}
                                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                            ></textarea>
                            <p className="text-xs text-neutral-400 mt-1 text-right">Descreva sua experiência e abordagem.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Preço da Consulta (em centavos)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">R$</span>
                                <input 
                                    type="number" 
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none font-medium text-neutral-900"
                                    value={profile.price_default_cents / 100}
                                    onChange={(e) => setProfile({...profile, price_default_cents: Math.round(parseFloat(e.target.value || '0') * 100)})}
                                />
                            </div>
                            <p className="text-xs text-neutral-400 mt-1">Valor que será exibido para os pacientes.</p>
                        </div>

                        {/* Specialties Section */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Especialidades</label>
                            
                            {/* Active Specialties */}
                            <div className="flex flex-wrap gap-2 mb-3 min-h-[30px]">
                                {profile.specialties.length === 0 && (
                                    <span className="text-neutral-400 text-sm italic py-1">Nenhuma especialidade selecionada.</span>
                                )}
                                {profile.specialties.map(tag => (
                                    <span key={tag} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 animate-in fade-in zoom-in duration-200">
                                        {tag}
                                        <button onClick={() => removeSpecialty(tag)} className="hover:text-primary-700 ml-1" title="Remover">×</button>
                                    </span>
                                ))}
                            </div>

                            <input 
                                type="text" 
                                placeholder="Digite e aperte Enter para adicionar uma personalizada..."
                                className="w-full px-4 py-2 bg-white border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-neutral-900 mb-4"
                                value={newSpecialty}
                                onChange={(e) => setNewSpecialty(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />

                            {/* Suggested Specialties */}
                            {availableSuggestions.length > 0 && (
                                <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                                            Sugestões para {profile.professionalType}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {availableSuggestions.map(s => (
                                            <button
                                                key={s}
                                                onClick={() => addSpecialty(s)}
                                                className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all active:scale-95"
                                            >
                                                + {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-neutral-100 flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => navigate(-1)}>Cancelar</Button>
                    <Button onClick={handleSave} isLoading={saving}>Salvar Alterações</Button>
                </div>
            </Card>
          </div>

          {/* Preview Column */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4">Preview do Card (Visão do Paciente)</h3>
                
                {/* Card Simulation */}
                <Card className="p-0 overflow-hidden shadow-xl transform transition-all hover:-translate-y-1">
                  <div className="h-32 bg-gradient-to-r from-primary-300 to-primary relative">
                    <div className="absolute -bottom-8 left-6">
                      <img src={profile.avatarUrl} alt="Profile" className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-white object-cover" />
                    </div>
                  </div>
                  <div className="p-6 pt-10">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-xl text-neutral-900">{profile.name}</h3>
                        <p className="text-primary font-medium">{profile.title}</p>
                      </div>
                      <span className="font-bold text-xl text-neutral-900">
                        R$ {(profile.price_default_cents / 100).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 my-4">
                        {profile.specialties.slice(0, 3).map(s => (
                            <span key={s} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-md">{s}</span>
                        ))}
                        {profile.specialties.length > 3 && (
                            <span className="text-xs bg-neutral-50 text-neutral-400 px-2 py-1 rounded-md">+{profile.specialties.length - 3}</span>
                        )}
                    </div>

                    <p className="text-neutral-500 text-sm mb-6 line-clamp-3">{profile.bio}</p>
                    
                    <Button className="w-full pointer-events-none opacity-90">Agendar Consulta</Button>
                  </div>
                </Card>
                
                <div className="mt-6 bg-white p-4 rounded-xl border border-neutral-100 shadow-sm">
                    <h4 className="text-sm font-bold text-neutral-900 mb-2">Verificação de Identidade</h4>
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>CPF: {profile.cpf ? '•'.repeat(11) : 'Pendente'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mt-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>Registro: {profile.registrationNumber}</span>
                    </div>
                </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfessionalProfileEditor;