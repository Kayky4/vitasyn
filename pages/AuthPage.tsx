
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore/lite';
import { auth, db } from '../lib/firebase';
import { UserRole } from '../types';
import { Button } from '../components/ui/Button';

// --- Icons ---
const Icons = {
  Check: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
  Google: () => <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>,
  Apple: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74s2.57-.99 3.87-.82c1.61.18 2.38.83 2.84 1.35-2.52 1.32-2.09 5.2.33 6.13-.57 1.76-1.46 3.48-2.12 5.57zM11.9 6.8c.28-1.57 1.34-2.73 2.52-2.8.25 1.71-1.63 3.32-2.52 2.8z"/></svg>,
  Patient: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  Doctor: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
  Admin: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Eye: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  EyeOff: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>,
  ArrowRight: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>,
  Lock: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
};

// --- Sub-Components ---

const FloatingInput = ({ label, id, type = "text", value, onChange, required, icon, ...props }: any) => {
    const [focused, setFocused] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const isPassword = type === "password";
    const actualType = isPassword ? (showPass ? "text" : "password") : type;

    return (
        <div className="relative mb-5 group">
            <input
                id={id}
                type={actualType}
                value={value}
                onChange={onChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className={`peer w-full px-4 pt-6 pb-2 bg-neutral-50 border-b-2 rounded-t-lg outline-none transition-all duration-300 placeholder-transparent text-neutral-900 font-medium ${
                    focused || value ? 'border-primary bg-white' : 'border-neutral-200 hover:border-neutral-300'
                }`}
                placeholder={label}
                required={required}
                {...props}
            />
            <label
                htmlFor={id}
                className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                    focused || value
                        ? 'top-1.5 text-[10px] font-bold uppercase tracking-wider text-primary'
                        : 'top-4 text-sm text-neutral-500'
                }`}
            >
                {label}
            </label>
            
            {/* Password Toggle */}
            {isPassword && (
                <button 
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                >
                    {showPass ? <Icons.EyeOff /> : <Icons.Eye />}
                </button>
            )}
            
            {/* Custom Icon (non-password) */}
            {icon && !isPassword && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">
                    {icon}
                </div>
            )}
        </div>
    );
};

const RoleCard = ({ selected, onClick, role, title, desc, icon: Icon }: any) => (
    <button
        type="button"
        onClick={onClick}
        className={`relative flex flex-col items-start p-5 rounded-2xl border-2 transition-all duration-300 w-full text-left group ${
            selected 
            ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-[1.02]' 
            : 'border-neutral-100 bg-white hover:border-neutral-200 hover:bg-neutral-50'
        }`}
    >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors ${
            selected ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200'
        }`}>
            <Icon />
        </div>
        <h3 className={`font-bold text-sm mb-1 ${selected ? 'text-neutral-900' : 'text-neutral-700'}`}>{title}</h3>
        <p className="text-xs text-neutral-500 leading-relaxed">{desc}</p>
        
        {/* Checkmark */}
        {selected && (
            <div className="absolute top-4 right-4 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center animate-in fade-in zoom-in">
                <Icons.Check />
            </div>
        )}
    </button>
);

const SocialButton = ({ icon: Icon, label, onClick }: any) => (
    <button 
        type="button" 
        onClick={onClick}
        className="flex items-center justify-center gap-3 w-full py-3 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-neutral-200"
    >
        <Icon />
        <span className="text-sm font-medium text-neutral-700">{label}</span>
    </button>
);

// --- Main Page ---

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // UI State
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1); // 1: Credentials/Role, 2: Details
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data State
  const [role, setRole] = useState<UserRole>(UserRole.PATIENT);
  const [formData, setFormData] = useState({
      email: '',
      password: '',
      name: '',
      cpf: '',
      phone: '',
      birthDate: '',
      gender: '',
      professionalType: 'Psicólogo',
      registrationNumber: ''
  });

  // Password Strength
  const passStrength = formData.password.length > 7 ? (/[0-9]/.test(formData.password) ? 3 : 2) : (formData.password.length > 0 ? 1 : 0);
  const passColors = ['bg-neutral-200', 'bg-red-400', 'bg-yellow-400', 'bg-green-500'];

  // Init
  useEffect(() => {
    if (searchParams.get('mode') === 'signup') setIsLogin(false);
    const roleParam = searchParams.get('role');
    if (roleParam === 'professional') setRole(UserRole.PROFESSIONAL);
    if (roleParam === 'admin') setRole(UserRole.ADMIN);
  }, [searchParams]);

  // Handlers
  const updateField = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (error) setError('');
  };

  const handleSocialMock = () => {
      alert("A autenticação social estará disponível na versão 2.0. Por favor, use email e senha.");
  };

  const handleNextStep = () => {
      // Validation Step 1
      if (!formData.email || !formData.password || !formData.name) {
          setError('Por favor, preencha todos os campos obrigatórios.');
          return;
      }
      if (formData.password.length < 6) {
          setError('A senha deve ter no mínimo 6 caracteres.');
          return;
      }
      setError('');
      setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');

      try {
          if (isLogin) {
              // --- LOGIN LOGIC ---
              const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
              const user = userCredential.user;
              
              const userDocRef = doc(db, 'users', user.uid);
              const userDoc = await getDoc(userDocRef);
              
              if (!userDoc.exists()) throw new Error('Perfil não encontrado.');
              
              const userData = userDoc.data();
              const storedRole = userData.profile?.role || userData.role;

              if (storedRole === UserRole.ADMIN) {
                  navigate('/admin/dashboard');
              } else if (storedRole === UserRole.PROFESSIONAL) {
                  navigate('/professional/dashboard');
              } else {
                  navigate('/patient/dashboard');
              }
          } else {
              // --- SIGNUP LOGIC ---
              // Validation Step 2
              if (role === UserRole.PROFESSIONAL && (!formData.cpf || !formData.registrationNumber)) throw new Error("Dados profissionais incompletos.");
              if (role === UserRole.PATIENT && (!formData.cpf || !formData.phone)) throw new Error("Dados pessoais incompletos.");
              // Admin doesn't need extra validation

              const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
              const user = userCredential.user;

              // Prepare Data
              const baseProfile = {
                  name: formData.name,
                  email: formData.email,
                  role: role,
                  avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${formData.name}`
              };

              if (role === UserRole.ADMIN) {
                  await setDoc(doc(db, 'users', user.uid), {
                      profile: baseProfile,
                      role: UserRole.ADMIN,
                      credits: { balance_cents: 0 }
                  });
                  navigate('/admin/dashboard');

              } else if (role === UserRole.PATIENT) {
                  await setDoc(doc(db, 'users', user.uid), {
                      profile: {
                          ...baseProfile,
                          cpf: formData.cpf,
                          phone: formData.phone,
                          birthDate: formData.birthDate,
                          gender: formData.gender
                      },
                      credits: { balance_cents: 0 }
                  });
                  navigate('/patient/dashboard');

              } else {
                  // Professional
                  await setDoc(doc(db, 'users', user.uid), { profile: baseProfile, credits: { balance_cents: 0 } });
                  await setDoc(doc(db, 'professionals', user.uid), {
                      id: user.uid,
                      userRef: user.uid,
                      ...baseProfile,
                      professionalType: formData.professionalType,
                      registrationNumber: formData.registrationNumber,
                      cpf: formData.cpf,
                      title: formData.professionalType,
                      bio: `Olá, eu sou ${formData.name}.`,
                      specialties: [formData.professionalType],
                      price_default_cents: 15000,
                      availability: {},
                      onboarding_complete: false
                  });
                  navigate('/professional/dashboard');
              }
          }
      } catch (err: any) {
          console.error(err);
          let msg = "Ocorreu um erro.";
          if (err.code === 'auth/wrong-password') msg = "Senha incorreta.";
          if (err.code === 'auth/user-not-found') msg = "Usuário não encontrado.";
          if (err.code === 'auth/email-already-in-use') msg = "E-mail já cadastrado.";
          setError(msg);
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-neutral-900">
      
      {/* --- LEFT COLUMN: FORM INTERFACE --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 xl:p-24 relative animate-in fade-in slide-in-from-left-8 duration-700">
        
        <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-10">
                <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
                    <div className="w-8 h-8 bg-neutral-900 text-white rounded-lg flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">V</div>
                    <span className="font-bold text-xl tracking-tight">VitaSyn</span>
                </Link>
                <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
                    {isLogin ? 'Bem-vindo de volta' : (step === 1 ? 'Criar sua conta' : 'Finalizar cadastro')}
                </h1>
                <p className="text-neutral-500">
                    {isLogin 
                        ? 'Insira suas credenciais para acessar a plataforma.' 
                        : (step === 1 ? 'Comece sua jornada de saúde premium.' : 'Precisamos de mais alguns detalhes para sua segurança.')
                    }
                </p>
                {role === UserRole.ADMIN && !isLogin && (
                    <div className="mt-4 p-2 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wide rounded border border-red-100 inline-block">
                        Modo de Criação: Administrador
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2 animate-pulse">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* --- LOGIN FORM --- */}
                {isLogin && (
                    <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
                        <FloatingInput 
                            id="email" 
                            label="Endereço de E-mail" 
                            type="email" 
                            value={formData.email} 
                            onChange={(e: any) => updateField('email', e.target.value)} 
                        />
                        <div className="relative">
                            <FloatingInput 
                                id="password" 
                                label="Sua Senha" 
                                type="password" 
                                value={formData.password} 
                                onChange={(e: any) => updateField('password', e.target.value)} 
                            />
                            <div className="flex justify-end -mt-3 mb-6">
                                <button type="button" className="text-xs font-medium text-primary hover:underline">Esqueceu a senha?</button>
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-14 text-base shadow-xl shadow-primary/20" isLoading={isLoading}>
                            Entrar na Plataforma
                        </Button>
                    </div>
                )}

                {/* --- SIGNUP FORM (STEP 1) --- */}
                {!isLogin && step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
                        
                        {/* Role Selection (Only if NOT Admin mode via URL) */}
                        {role !== UserRole.ADMIN && (
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <RoleCard 
                                    selected={role === UserRole.PATIENT} 
                                    onClick={() => setRole(UserRole.PATIENT)}
                                    icon={Icons.Patient}
                                    title="Sou Paciente"
                                    desc="Busco especialistas para atendimento."
                                />
                                <RoleCard 
                                    selected={role === UserRole.PROFESSIONAL} 
                                    onClick={() => setRole(UserRole.PROFESSIONAL)}
                                    icon={Icons.Doctor}
                                    title="Sou Profissional"
                                    desc="Quero oferecer meus serviços."
                                />
                            </div>
                        )}

                        <FloatingInput 
                            id="name" 
                            label="Nome Completo" 
                            value={formData.name} 
                            onChange={(e: any) => updateField('name', e.target.value)} 
                        />
                        <FloatingInput 
                            id="email" 
                            label="Endereço de E-mail" 
                            type="email" 
                            value={formData.email} 
                            onChange={(e: any) => updateField('email', e.target.value)} 
                        />
                        
                        <div>
                            <FloatingInput 
                                id="password" 
                                label="Crie uma Senha" 
                                type="password" 
                                value={formData.password} 
                                onChange={(e: any) => updateField('password', e.target.value)} 
                            />
                            {/* Password Strength Indicator */}
                            <div className="flex gap-1 h-1 mt-1 px-1">
                                {[1,2,3].map(lvl => (
                                    <div key={lvl} className={`flex-1 rounded-full transition-colors duration-300 ${passStrength >= lvl ? passColors[passStrength] : 'bg-neutral-100'}`}></div>
                                ))}
                            </div>
                            <p className="text-[10px] text-neutral-400 mt-1 px-1 text-right">Mínimo 6 caracteres</p>
                        </div>

                        <Button type="button" onClick={handleNextStep} className="w-full h-14 text-base shadow-xl shadow-primary/20 mt-4 group">
                            Continuar Cadastro
                            <span className="ml-2 group-hover:translate-x-1 transition-transform"><Icons.ArrowRight /></span>
                        </Button>
                    </div>
                )}

                {/* --- SIGNUP FORM (STEP 2) --- */}
                {!isLogin && step === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
                        <button type="button" onClick={() => setStep(1)} className="text-sm text-neutral-500 hover:text-neutral-900 mb-2 flex items-center gap-1">
                             ← Voltar
                        </button>

                        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 mb-4">
                            <p className="text-xs font-bold text-neutral-500 uppercase mb-2">Resumo da Conta</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center font-bold text-lg text-primary">
                                    {formData.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-neutral-900">{formData.name}</p>
                                    <p className="text-xs text-neutral-500 capitalize">
                                        {role === UserRole.PROFESSIONAL ? 'Profissional de Saúde' : (role === UserRole.ADMIN ? 'Administrador' : 'Paciente')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {role === UserRole.PATIENT ? (
                            <>
                                <FloatingInput 
                                    id="cpf" 
                                    label="CPF" 
                                    value={formData.cpf} 
                                    onChange={(e: any) => updateField('cpf', e.target.value)} 
                                    placeholder="000.000.000-00"
                                />
                                <FloatingInput 
                                    id="phone" 
                                    label="Celular" 
                                    value={formData.phone} 
                                    onChange={(e: any) => updateField('phone', e.target.value)} 
                                    placeholder="(00) 00000-0000"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FloatingInput 
                                        id="birthDate" 
                                        label="Data de Nasc." 
                                        type="date"
                                        value={formData.birthDate} 
                                        onChange={(e: any) => updateField('birthDate', e.target.value)} 
                                    />
                                    <div className="relative mb-5">
                                        <select 
                                            value={formData.gender}
                                            onChange={(e) => updateField('gender', e.target.value)}
                                            className="w-full px-4 pt-6 pb-2 bg-neutral-50 border-b-2 border-neutral-200 rounded-t-lg outline-none text-neutral-900 font-medium appearance-none"
                                        >
                                            <option value="">Selecione</option>
                                            <option value="Masculino">Masculino</option>
                                            <option value="Feminino">Feminino</option>
                                            <option value="Outro">Outro</option>
                                        </select>
                                        <label className="absolute left-4 top-1.5 text-[10px] font-bold uppercase tracking-wider text-primary pointer-events-none">Gênero</label>
                                    </div>
                                </div>
                            </>
                        ) : role === UserRole.PROFESSIONAL ? (
                            <>
                                <div className="relative mb-5">
                                    <select 
                                        value={formData.professionalType}
                                        onChange={(e) => updateField('professionalType', e.target.value)}
                                        className="w-full px-4 pt-6 pb-2 bg-neutral-50 border-b-2 border-neutral-200 rounded-t-lg outline-none text-neutral-900 font-medium appearance-none"
                                    >
                                        <option value="Psicólogo">Psicólogo</option>
                                        <option value="Nutricionista">Nutricionista</option>
                                        <option value="Fisioterapeuta">Fisioterapeuta</option>
                                    </select>
                                    <label className="absolute left-4 top-1.5 text-[10px] font-bold uppercase tracking-wider text-primary pointer-events-none">Especialidade</label>
                                </div>
                                <FloatingInput 
                                    id="registration" 
                                    label="Registro Profissional (Ex: CRP)" 
                                    value={formData.registrationNumber} 
                                    onChange={(e: any) => updateField('registrationNumber', e.target.value)} 
                                />
                                <FloatingInput 
                                    id="cpf" 
                                    label="CPF (Para repasses financeiros)" 
                                    value={formData.cpf} 
                                    onChange={(e: any) => updateField('cpf', e.target.value)} 
                                />
                            </>
                        ) : (
                            // Admin simplified flow
                            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm mb-4">
                                <p>⚠️ Você está criando uma conta com privilégios administrativos totais.</p>
                            </div>
                        )}

                        <Button type="submit" className="w-full h-14 text-base shadow-xl shadow-primary/20" isLoading={isLoading}>
                            Concluir Cadastro
                        </Button>
                        <p className="text-center text-[10px] text-neutral-400 mt-2">
                            Ao criar conta, você concorda com nossos Termos de Uso e Política de Privacidade.
                        </p>
                    </div>
                )}

                {/* --- FOOTER: SWITCH MODE & SOCIAL --- */}
                <div className="mt-8">
                    <div className="relative flex py-5 items-center">
                        <div className="flex-grow border-t border-neutral-100"></div>
                        <span className="flex-shrink-0 mx-4 text-neutral-300 text-xs font-bold uppercase">Ou continue com</span>
                        <div className="flex-grow border-t border-neutral-100"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <SocialButton icon={Icons.Google} label="Google" onClick={handleSocialMock} />
                        <SocialButton icon={Icons.Apple} label="Apple" onClick={handleSocialMock} />
                    </div>

                    <p className="text-center text-sm text-neutral-500">
                        {isLogin ? 'Novo por aqui?' : 'Já tem uma conta?'}
                        <button 
                            type="button"
                            onClick={() => { setIsLogin(!isLogin); setStep(1); setError(''); }}
                            className="ml-1 font-bold text-primary hover:text-primary-700 transition-colors"
                        >
                            {isLogin ? 'Crie sua conta agora' : 'Faça login'}
                        </button>
                    </p>
                </div>
            </form>
        </div>
      </div>

      {/* --- RIGHT COLUMN: IMAGE & INSPIRATION (DESKTOP) --- */}
      <div className="hidden lg:flex w-1/2 bg-neutral-900 relative overflow-hidden items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=2864&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent"></div>

        {/* Content Overlay */}
        <div className="relative z-10 max-w-lg p-12 text-white">
            <div className="inline-block px-3 py-1 mb-6 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-widest">
                Plataforma #1 para Especialistas
            </div>
            <h2 className="text-5xl font-bold leading-tight mb-6">
                Redefinindo o futuro da <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Telessaúde Premium</span>.
            </h2>
            <p className="text-lg text-neutral-300 leading-relaxed mb-8">
                Junte-se a uma rede exclusiva de profissionais e pacientes que valorizam a excelência, segurança e tecnologia de ponta.
            </p>

            {/* Social Proof */}
            <div className="flex items-center gap-4 pt-8 border-t border-white/10">
                <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                        <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} className="w-10 h-10 rounded-full border-2 border-neutral-900 bg-white" alt="Avatar" />
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-neutral-900 bg-white text-neutral-900 flex items-center justify-center text-xs font-bold">
                        +2k
                    </div>
                </div>
                <div className="flex flex-col">
                    <div className="flex text-yellow-400 text-sm">★★★★★</div>
                    <span className="text-xs font-medium text-neutral-400">Avaliado por especialistas</span>
                </div>
            </div>
        </div>
      </div>

    </div>
  );
};

export default AuthPage;
