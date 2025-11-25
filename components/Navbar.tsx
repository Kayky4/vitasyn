
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserRole, Notification } from '../types';
import { Button } from './ui/Button';
import { auth, db } from '../lib/firebase';
import { collection, query, where, doc, writeBatch, getDocs, getDoc, updateDoc } from 'firebase/firestore/lite';

interface NavbarProps {
  userRole: UserRole | null;
  isAuthenticated: boolean;
}

// --- Icons Set ---
const Icons = {
  Dashboard: ({ active, className }: { active?: boolean, className?: string }) => (
    <svg className={className || `w-6 h-6 ${active ? 'text-primary' : 'text-neutral-400'}`} fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Calendar: ({ active, className }: { active?: boolean, className?: string }) => (
    <svg className={className || `w-6 h-6 ${active ? 'text-primary' : 'text-neutral-400'}`} fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Finance: ({ active, className }: { active?: boolean, className?: string }) => (
    <svg className={className || `w-6 h-6 ${active ? 'text-primary' : 'text-neutral-400'}`} fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  User: ({ active, className }: { active?: boolean, className?: string }) => (
    <svg className={className || `w-6 h-6 ${active ? 'text-primary' : 'text-neutral-400'}`} fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  History: ({ active, className }: { active?: boolean, className?: string }) => (
    <svg className={className || `w-6 h-6 ${active ? 'text-primary' : 'text-neutral-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
       <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Bell: ({ active, className }: { active?: boolean, className?: string }) => (
    <svg className={className || `w-6 h-6 ${active ? 'text-neutral-900' : 'text-neutral-600'}`} fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  Search: ({ className }: { className?: string }) => (
    <svg className={className || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Menu: ({ className }: { className?: string }) => (
    <svg className={className || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Check: () => (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
  ),
  Admin: ({ active, className }: { active?: boolean, className?: string }) => (
    <svg className={className || `w-6 h-6 ${active ? 'text-primary' : 'text-neutral-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
       <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
};

// --- Helper Components ---

const ToggleSwitch = ({ checked, onChange, label, isLoading }: { checked: boolean, onChange: () => void, label?: string, isLoading?: boolean }) => (
  <button 
    onClick={onChange}
    disabled={isLoading}
    className={`flex items-center gap-3 group focus:outline-none ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
  >
    {label && <span className={`text-sm font-medium transition-colors ${checked ? 'text-success' : 'text-neutral-500'}`}>{label}</span>}
    <div className={`w-12 h-7 rounded-full p-1 transition-all duration-300 ease-in-out relative ${checked ? 'bg-success shadow-inner' : 'bg-neutral-200'}`}>
      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
    </div>
  </button>
);

// --- Main Navbar Component ---

export const Navbar: React.FC<NavbarProps> = ({ userRole, isAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // States
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Data States
  const [userName, setUserName] = useState('Usuário');
  const [userAvatar, setUserAvatar] = useState('');
  const [isOnline, setIsOnline] = useState(false); // New: Online Status
  const [statusLoading, setStatusLoading] = useState(false);
  const [detectedRole, setDetectedRole] = useState<UserRole | null>(userRole);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Refs
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Scroll Detection for Glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Data
  useEffect(() => {
    if (!isAuthenticated || !auth.currentUser) return;
    const uid = auth.currentUser.uid;

    const fetchData = async () => {
        try {
            // Check Professional First
            const proRef = doc(db, 'professionals', uid);
            const proSnap = await getDoc(proRef);

            if (proSnap.exists()) {
                const data = proSnap.data();
                setUserName(data.name || 'Doutor(a)');
                setUserAvatar(data.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${uid}`);
                setIsOnline(data.isOnline || false);
                setDetectedRole(UserRole.PROFESSIONAL);
            } else {
                // Check User/Patient/Admin
                const userRef = doc(db, 'users', uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    const profile = data.profile || data;
                    setUserName(profile.name || 'Usuário');
                    setUserAvatar(profile.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${uid}`);
                    
                    if (data.role === 'admin' || profile.role === 'admin') {
                        setDetectedRole(UserRole.ADMIN);
                    } else {
                        setDetectedRole(UserRole.PATIENT);
                    }
                }
            }
        } catch (e) {
            console.error("Error fetching navbar data", e);
        }
    };
    fetchData();

    // Fetch Notifications
    const q = query(collection(db, 'notifications'), where('userId', '==', uid));
    getDocs(q).then((snapshot) => {
      const notifs: Notification[] = [];
      let unread = 0;
      snapshot.forEach((doc) => {
        const data = doc.data() as Omit<Notification, 'id'>;
        notifs.push({ id: doc.id, ...data });
        if (!data.read) unread++;
      });
      notifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setNotifications(notifs.slice(0, 10));
      setUnreadCount(unread);
    });
  }, [isAuthenticated]);

  const toggleOnlineStatus = async () => {
      if (!auth.currentUser || detectedRole !== UserRole.PROFESSIONAL) return;
      setStatusLoading(true);
      const newState = !isOnline;
      try {
          // Optimistic Update
          setIsOnline(newState);
          await updateDoc(doc(db, 'professionals', auth.currentUser.uid), {
              isOnline: newState
          });
      } catch (e) {
          console.error("Error updating status", e);
          setIsOnline(!newState); // Revert
      } finally {
          setStatusLoading(false);
      }
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/auth');
  };

  const markAllAsRead = async () => {
      if (!auth.currentUser) return;
      const batch = writeBatch(db);
      notifications.filter(n => !n.read).forEach(n => batch.update(doc(db, 'notifications', n.id), { read: true }));
      try { await batch.commit(); setUnreadCount(0); setNotifications(prev => prev.map(n => ({...n, read: true}))); } catch(e){}
  };

  // --- Navigation Configuration ---
  const getNavLinks = () => {
      if (detectedRole === UserRole.PROFESSIONAL) {
          return [
              { path: '/professional/dashboard', label: 'Dashboard', icon: Icons.Dashboard },
              { path: '/professional/calendar', label: 'Agenda', icon: Icons.Calendar },
              { path: '/professional/finance', label: 'Financeiro', icon: Icons.Finance },
              { path: '/professional/profile', label: 'Perfil', icon: Icons.User },
          ];
      } else if (detectedRole === UserRole.ADMIN) {
          return [
              { path: '/admin/dashboard', label: 'Painel Admin', icon: Icons.Admin },
              { path: '/admin/users', label: 'Usuários', icon: Icons.User },
              { path: '/admin/communications', label: 'Avisos', icon: Icons.Bell },
          ];
      } else {
          // Patient
          return [
              { path: '/patient/dashboard', label: 'Início', icon: Icons.Dashboard },
              { path: '/history', label: 'Consultas', icon: Icons.History },
              { path: '/patient/profile', label: 'Perfil', icon: Icons.User },
          ];
      }
  };

  const navLinks = getNavLinks();

  const getDashboardLink = () => {
      if (detectedRole === UserRole.ADMIN) return "/admin/dashboard";
      if (detectedRole === UserRole.PROFESSIONAL) return "/professional/dashboard";
      return "/patient/dashboard";
  };

  // --- Render Components ---

  const NotificationBell = () => (
      <div className="relative" ref={notifRef}>
        <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-full transition-all duration-200 hover:bg-neutral-100 ${showNotifications ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500'}`}
        >
            <Icons.Bell active={showNotifications || unreadCount > 0} />
            {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-danger rounded-full border-2 border-white animate-pulse"></span>
            )}
        </button>
        
        {/* Dropdown (Keeping simple structure) */}
        {showNotifications && (
             <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">
                 <div className="px-4 py-3 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                     <h3 className="font-bold text-sm">Notificações</h3>
                     {unreadCount > 0 && <button onClick={markAllAsRead} className="text-xs text-primary font-medium">Ler todas</button>}
                 </div>
                 <div className="max-h-64 overflow-y-auto">
                     {notifications.length === 0 ? <p className="p-4 text-center text-xs text-neutral-400">Nada por aqui.</p> : 
                        notifications.map(n => (
                            <div key={n.id} className={`p-3 border-b border-neutral-50 text-sm ${!n.read ? 'bg-blue-50/30' : ''}`}>
                                <p className={!n.read ? 'font-semibold text-neutral-800' : 'text-neutral-500'}>{n.message}</p>
                            </div>
                        ))
                     }
                 </div>
             </div>
        )}
      </div>
  );

  const UserAvatarButton = ({ onClick }: { onClick: () => void }) => (
      <button onClick={onClick} className="group relative focus:outline-none">
          <div className={`w-9 h-9 rounded-full p-[2px] transition-all duration-300 ${isOnline && detectedRole === UserRole.PROFESSIONAL ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-neutral-200 to-neutral-300 group-hover:from-primary group-hover:to-primary-300'}`}>
              <img src={userAvatar} alt="Profile" className="w-full h-full rounded-full object-cover border-2 border-white bg-white" />
          </div>
      </button>
  );

  return (
    <>
      {/* ==================================================================
          DESKTOP HEADER (MD+)
          Glassmorphism, Full Navigation, Professional Toggle
         ================================================================== */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 hidden md:block ${isScrolled ? 'bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm' : 'bg-transparent border-b border-transparent'}`}>
         <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            
            {/* Left: Brand & Context */}
            <div className="flex items-center gap-8">
                <Link to={isAuthenticated ? getDashboardLink() : "/"} className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-bold text-2xl group-hover:scale-105 transition-transform shadow-lg shadow-primary/30">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 8C4 8 8 16 9 18C10 20 12 20 13 18C14 16 20 4 20 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-lg leading-none tracking-tight text-neutral-900">VitaSyn</span>
                        <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] self-start mt-0.5">Beta</span>
                    </div>
                </Link>

                {/* Desktop Nav Links */}
                {isAuthenticated && (
                    <div className="hidden lg:flex items-center gap-1 bg-neutral-100/50 p-1 rounded-full border border-neutral-200/50 backdrop-blur-sm">
                        {navLinks.map(link => {
                            const isActive = location.pathname.startsWith(link.path);
                            return (
                                <Link 
                                    key={link.path} 
                                    to={link.path}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isActive ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200/50'}`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-5">
                {!isAuthenticated ? (
                    <div className="flex items-center gap-3">
                         <Link to="/auth?mode=login"><Button variant="ghost" size="sm">Entrar</Button></Link>
                         <Link to="/auth?mode=signup"><Button size="sm">Criar Conta</Button></Link>
                    </div>
                ) : (
                    <>
                        {/* Professional Status Switch */}
                        {detectedRole === UserRole.PROFESSIONAL && (
                            <div className="flex items-center gap-3 pr-4 border-r border-neutral-200">
                                <ToggleSwitch 
                                    checked={isOnline} 
                                    onChange={toggleOnlineStatus} 
                                    label={isOnline ? "Você está Online" : "Offline"} 
                                    isLoading={statusLoading}
                                />
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <NotificationBell />
                            
                            <div className="relative" ref={profileRef}>
                                <div className="flex items-center gap-3 cursor-pointer p-1 rounded-full hover:bg-neutral-100 transition-colors pr-3" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                                    <UserAvatarButton onClick={() => {}} />
                                    <div className="text-left hidden xl:block">
                                        <p className="text-sm font-bold text-neutral-900 leading-none">{userName}</p>
                                        <p className="text-[10px] font-medium text-neutral-400 mt-0.5">Minha Conta</p>
                                    </div>
                                    <Icons.Menu className="w-4 h-4 text-neutral-400" />
                                </div>

                                {/* Desktop Profile Dropdown */}
                                {showProfileMenu && (
                                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-neutral-100 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">
                                        <div className="px-4 py-2 border-b border-neutral-50 mb-1">
                                            <p className="text-xs font-bold text-neutral-400 uppercase">Logado como</p>
                                            <p className="text-sm font-bold text-neutral-900 truncate">{userName}</p>
                                        </div>
                                        {navLinks.map(link => (
                                            <Link key={link.path} to={link.path} className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900">
                                                <link.icon className="w-4 h-4" />
                                                {link.label}
                                            </Link>
                                        ))}
                                        <div className="border-t border-neutral-100 my-1"></div>
                                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-red-50 flex items-center gap-2">
                                            <span>Sair da conta</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
         </div>
      </nav>

      {/* ==================================================================
          MOBILE HEADER (Top Bar - SM Only)
          Minimalist: Brand + Notifications + User
         ================================================================== */}
      <div className={`md:hidden fixed top-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-100 transition-all ${!isAuthenticated ? '' : 'h-16'}`}>
         <div className="flex items-center justify-between px-4 h-16">
            <Link to="/" className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold text-xl">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 8C4 8 8 16 9 18C10 20 12 20 13 18C14 16 20 4 20 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                 </div>
                 <div className="flex flex-col">
                    <span className="font-bold text-base leading-none text-neutral-900">VitaSyn</span>
                    <span className="text-[8px] font-bold text-primary uppercase tracking-widest mt-0.5">Beta</span>
                 </div>
            </Link>
            
            <div className="flex items-center gap-3">
                {!isAuthenticated ? (
                     <Link to="/auth"><Button size="sm">Entrar</Button></Link>
                ) : (
                    <>
                        {detectedRole === UserRole.PROFESSIONAL && (
                            <button 
                                onClick={toggleOnlineStatus}
                                className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border transition-colors ${isOnline ? 'bg-green-50 border-green-200 text-green-700' : 'bg-neutral-50 border-neutral-200 text-neutral-500'}`}
                            >
                                {isOnline ? 'Online' : 'Offline'}
                            </button>
                        )}
                        <NotificationBell />
                        <UserAvatarButton onClick={() => setShowProfileMenu(!showProfileMenu)} />
                    </>
                )}
            </div>
         </div>

         {/* Mobile Profile Menu (Fullscreen Overlay if needed, or simple dropdown) */}
         {showProfileMenu && (
             <div className="absolute top-16 right-4 w-64 bg-white rounded-xl shadow-2xl border border-neutral-100 py-2 z-50 animate-in slide-in-from-top-2 fade-in">
                 <div className="px-4 py-3 bg-neutral-50 mb-2">
                     <p className="font-bold text-neutral-900">{userName}</p>
                     <p className="text-xs text-neutral-500 capitalize">
                         {detectedRole === UserRole.PROFESSIONAL ? 'Profissional de Saúde' : (detectedRole === UserRole.ADMIN ? 'Administrador' : 'Paciente')}
                     </p>
                 </div>
                 <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-danger font-medium hover:bg-neutral-50">
                     Sair do Aplicativo
                 </button>
             </div>
         )}
      </div>

      {/* ==================================================================
          MOBILE BOTTOM NAVIGATION (Bottom Tab Bar - SM Only)
          Fixed at bottom, icon driven
         ================================================================== */}
      {isAuthenticated && detectedRole !== UserRole.ADMIN && (
          <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-neutral-200 pb-safe safe-area-bottom">
              <div className="grid grid-cols-4 h-16 items-center">
                  {navLinks.map((link) => {
                      const isActive = location.pathname === link.path; // Exact match for bottom nav usually better, or startsWith
                      // Exception for dashboard home
                      const activeState = link.path === '/professional/dashboard' || link.path === '/patient/dashboard' 
                        ? location.pathname === link.path 
                        : location.pathname.startsWith(link.path);

                      return (
                          <Link 
                            key={link.path} 
                            to={link.path}
                            className="flex flex-col items-center justify-center gap-1 h-full w-full focus:outline-none active:scale-95 transition-transform"
                          >
                              <div className={`relative p-1.5 rounded-xl transition-all ${activeState ? 'bg-primary/10 text-primary' : 'text-neutral-400'}`}>
                                  <link.icon className="w-6 h-6" active={activeState} />
                                  {activeState && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></span>}
                              </div>
                              <span className={`text-[10px] font-medium ${activeState ? 'text-primary' : 'text-neutral-400'}`}>
                                  {link.label}
                              </span>
                          </Link>
                      );
                  })}
              </div>
          </nav>
      )}
      
      {/* Spacer for Fixed Header on Desktop */}
      <div className="hidden md:block h-20"></div>
      
      {/* Spacer for Fixed Header on Mobile */}
      <div className="md:hidden h-16"></div>
      
    </>
  );
};
