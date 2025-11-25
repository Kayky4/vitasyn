
import React from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const AdminFinancials = () => {
    return (
        <AdminLayout>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 bg-neutral-900 text-white">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Receita Recorrente (MRR)</p>
                    <h3 className="text-3xl font-bold mt-2">R$ 45.280,00</h3>
                    <p className="text-sm text-green-400 mt-1">+15% vs mês passado</p>
                </Card>
                <Card className="p-6">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Assinaturas Ativas</p>
                    <h3 className="text-3xl font-bold mt-2 text-neutral-900">842</h3>
                    <p className="text-sm text-neutral-500 mt-1">65% no plano Plus</p>
                </Card>
                <Card className="p-6">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Taxa de Churn</p>
                    <h3 className="text-3xl font-bold mt-2 text-neutral-900">2.4%</h3>
                    <p className="text-sm text-green-600 mt-1">-0.5% (Melhoria)</p>
                </Card>
            </div>

            <h2 className="text-xl font-bold text-neutral-900 mb-4">Gestão de Planos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { name: 'Free', price: 'R$ 0', users: 1200, color: 'border-t-neutral-200' },
                    { name: 'Plus', price: 'R$ 29,90', users: 540, color: 'border-t-primary' },
                    { name: 'Elite', price: 'R$ 89,90', users: 302, color: 'border-t-yellow-400' },
                ].map(plan => (
                    <Card key={plan.name} className={`p-6 border-t-4 ${plan.color}`}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-lg text-neutral-900">{plan.name}</h3>
                            <span className="font-bold text-neutral-900">{plan.price}</span>
                        </div>
                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-500">Usuários Ativos</span>
                                <span className="font-bold">{plan.users}</span>
                            </div>
                            <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-neutral-900 h-full" style={{ width: '60%' }}></div>
                            </div>
                        </div>
                        <Button variant="secondary" className="w-full text-xs">Editar Benefícios</Button>
                    </Card>
                ))}
            </div>
        </AdminLayout>
    );
};

export default AdminFinancials;
