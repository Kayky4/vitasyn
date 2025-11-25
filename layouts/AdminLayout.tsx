
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { auth } from '../lib/firebase';

const AdminSidebarItem = ({ to, icon: Icon, label, active }: any) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      active 
      ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-900/20' 
      : 'text-neutral-500 hover:bg-white hover:text-neutral-900 hover:shadow-sm'
    }`}
  >
    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-900'}`} />
    <span className="font-medium text-sm">{label}</span>
  </Link>
);

const Icons = {
  Grid: ({ className }: any) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Users: ({ className }: any) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Bell: ({ className }: any) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  CreditCard: ({ className }: any) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  Logout: ({ className }: any) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
}

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#F9FAFB] border-r border-neutral-200 fixed inset-y-0 z-50 flex flex-col">
        <div className="h-20 flex items-center px-6 border-b border-neutral-200 bg-white">
          <div className="w-8 h-8 bg-neutral-900 text-white rounded-lg flex items-center justify-center font-bold text-lg mr-3">V</div>
          <div>
            <span className="font-bold text-lg text-neutral-900 block leading-none">VitaSyn</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Admin Panel</span>
          </div>
        </div>

        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Geral</p>
          <AdminSidebarItem 
            to="/admin/dashboard" 
            label="Visão Geral" 
            icon={Icons.Grid} 
            active={location.pathname === '/admin/dashboard'} 
          />
          <AdminSidebarItem 
            to="/admin/users" 
            label="Usuários" 
            icon={Icons.Users} 
            active={location.pathname === '/admin/users'} 
          />
          <AdminSidebarItem 
            to="/admin/communications" 
            label="Comunicados" 
            icon={Icons.Bell} 
            active={location.pathname === '/admin/communications'} 
          />
          <AdminSidebarItem 
            to="/admin/finance" 
            label="Financeiro" 
            icon={Icons.CreditCard} 
            active={location.pathname === '/admin/finance'} 
          />
        </div>

        <div className="p-4 border-t border-neutral-200 bg-white">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left text-red-600 hover:bg-red-50 transition-colors"
          >
            <Icons.Logout className="w-5 h-5" />
            <span className="font-medium text-sm">Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-neutral-200 sticky top-0 z-40 px-8 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-800">
            {location.pathname === '/admin/dashboard' && 'Dashboard Operacional'}
            {location.pathname === '/admin/users' && 'Gestão de Usuários'}
            {location.pathname === '/admin/communications' && 'Central de Comunicação'}
            {location.pathname === '/admin/finance' && 'Controle Financeiro'}
          </h2>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3">
                 <div className="w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold border-2 border-neutral-200">
                    A
                 </div>
                 <div className="text-sm">
                     <p className="font-bold text-neutral-900 leading-none">Administrador</p>
                     <p className="text-xs text-neutral-500">Super User</p>
                 </div>
             </div>
          </div>
        </header>

        <main className="p-8">
            {children}
        </main>
      </div>
    </div>
  );
};
