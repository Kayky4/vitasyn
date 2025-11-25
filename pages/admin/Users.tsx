
import React, { useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { UserRole, UserStatus } from '../../types';

// Mock Data
const MOCK_USERS = [
    { id: '1', name: 'Ana Silva', email: 'ana@example.com', role: UserRole.PATIENT, status: UserStatus.ACTIVE, plan: 'Free', joined: '2023-01-15' },
    { id: '2', name: 'Dr. Roberto', email: 'roberto@clinic.com', role: UserRole.PROFESSIONAL, status: UserStatus.ACTIVE, plan: 'Pro', joined: '2023-02-10' },
    { id: '3', name: 'Marcos Oliveira', email: 'marcos@example.com', role: UserRole.PATIENT, status: UserStatus.SUSPENDED, plan: 'Plus', joined: '2023-03-05' },
    { id: '4', name: 'Dra. Julia', email: 'julia@med.com', role: UserRole.PROFESSIONAL, status: UserStatus.PENDING, plan: 'Basic', joined: '2023-10-01' },
    { id: '5', name: 'Pedro Santos', email: 'pedro@example.com', role: UserRole.PATIENT, status: UserStatus.ACTIVE, plan: 'Free', joined: '2023-06-20' },
];

const Badge = ({ status }: { status: UserStatus }) => {
    const colors = {
        [UserStatus.ACTIVE]: 'bg-green-100 text-green-700',
        [UserStatus.SUSPENDED]: 'bg-red-100 text-red-700',
        [UserStatus.PENDING]: 'bg-yellow-100 text-yellow-700',
        [UserStatus.ARCHIVED]: 'bg-neutral-100 text-neutral-500',
    };
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${colors[status]}`}>
            {status}
        </span>
    );
};

const AdminUsers = () => {
    const [filterRole, setFilterRole] = useState('all');
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState(MOCK_USERS);

    const filteredUsers = users.filter(u => {
        const matchRole = filterRole === 'all' || u.role === filterRole;
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        return matchRole && matchSearch;
    });

    const toggleStatus = (id: string) => {
        setUsers(users.map(u => {
            if (u.id === id) {
                return { 
                    ...u, 
                    status: u.status === UserStatus.ACTIVE ? UserStatus.SUSPENDED : UserStatus.ACTIVE 
                };
            }
            return u;
        }));
    };

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Buscar por nome ou email..." 
                        className="px-4 py-2 border border-neutral-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select 
                        className="px-4 py-2 border border-neutral-200 rounded-lg bg-white focus:outline-none"
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                    >
                        <option value="all">Todos os Tipos</option>
                        <option value={UserRole.PATIENT}>Pacientes</option>
                        <option value={UserRole.PROFESSIONAL}>Profissionais</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" className="text-xs">Exportar CSV</Button>
                    <Button className="text-xs">+ Novo Usuário</Button>
                </div>
            </div>

            <Card className="overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-500">
                        <tr>
                            <th className="px-6 py-4 font-bold">Usuário</th>
                            <th className="px-6 py-4 font-bold">Role</th>
                            <th className="px-6 py-4 font-bold">Plano</th>
                            <th className="px-6 py-4 font-bold">Status</th>
                            <th className="px-6 py-4 font-bold">Data Entrada</th>
                            <th className="px-6 py-4 font-bold text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-neutral-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="font-bold text-neutral-900">{user.name}</p>
                                        <p className="text-xs text-neutral-500">{user.email}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${user.role === UserRole.PROFESSIONAL ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                        {user.role === UserRole.PROFESSIONAL ? 'Profissional' : 'Paciente'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-neutral-600 font-medium">{user.plan}</td>
                                <td className="px-6 py-4">
                                    <Badge status={user.status} />
                                </td>
                                <td className="px-6 py-4 text-neutral-500">{new Date(user.joined).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="text-neutral-400 hover:text-primary font-medium text-xs">Editar</button>
                                        <button 
                                            onClick={() => toggleStatus(user.id)}
                                            className={`font-medium text-xs ${user.status === UserStatus.ACTIVE ? 'text-red-400 hover:text-red-600' : 'text-green-400 hover:text-green-600'}`}
                                        >
                                            {user.status === UserStatus.ACTIVE ? 'Suspender' : 'Ativar'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div className="p-8 text-center text-neutral-400">Nenhum usuário encontrado.</div>
                )}
            </Card>
        </AdminLayout>
    );
};

export default AdminUsers;
