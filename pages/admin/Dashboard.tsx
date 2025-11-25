
import React from 'react';
import { Card } from '../../components/ui/Card';
import { AdminLayout } from '../../layouts/AdminLayout';
import { Button } from '../../components/ui/Button';

// Mock Charts
const MiniChart = ({ color }: { color: string }) => (
    <div className="h-12 flex items-end gap-1 opacity-50">
        {[40, 60, 45, 70, 65, 85, 80].map((h, i) => (
            <div key={i} style={{ height: `${h}%` }} className={`w-full rounded-t-sm ${color}`}></div>
        ))}
    </div>
);

const StatCard = ({ title, value, subtext, trend, trendUp, colorClass, chartColor }: any) => (
    <Card className="p-6 flex flex-col justify-between h-36 relative overflow-hidden group">
        <div className="relative z-10">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-neutral-900 mb-2">{value}</h3>
            <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {trend}
                </span>
                <span className="text-xs text-neutral-400">{subtext}</span>
            </div>
        </div>
        <div className="absolute bottom-0 right-0 w-24">
            <MiniChart color={chartColor} />
        </div>
    </Card>
);

const ActivityRow = ({ user, action, time }: any) => (
    <div className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-500">
                {user.charAt(0)}
            </div>
            <div>
                <p className="text-sm font-medium text-neutral-900">{user}</p>
                <p className="text-xs text-neutral-500">{action}</p>
            </div>
        </div>
        <span className="text-xs text-neutral-400">{time}</span>
    </div>
);

const AdminDashboard = () => {
    return (
        <AdminLayout>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Total de Pacientes" 
                    value="2,450" 
                    subtext="vs. mês passado" 
                    trend="+12%" 
                    trendUp={true} 
                    chartColor="bg-blue-500"
                />
                <StatCard 
                    title="Profissionais Ativos" 
                    value="142" 
                    subtext="vs. mês passado" 
                    trend="+5%" 
                    trendUp={true} 
                    chartColor="bg-purple-500"
                />
                <StatCard 
                    title="Consultas Realizadas" 
                    value="856" 
                    subtext="este mês" 
                    trend="+8%" 
                    trendUp={true} 
                    chartColor="bg-emerald-500"
                />
                <StatCard 
                    title="Receita Mensal" 
                    value="R$ 124k" 
                    subtext="projeção" 
                    trend="-2%" 
                    trendUp={false} 
                    chartColor="bg-amber-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Area (Mock) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-neutral-900">Crescimento da Plataforma</h3>
                            <select className="bg-neutral-50 border-none text-sm font-medium rounded-lg text-neutral-500 p-2">
                                <option>Últimos 30 dias</option>
                                <option>Este Ano</option>
                            </select>
                        </div>
                        <div className="h-64 flex items-end justify-between gap-2 px-2">
                            {[30, 45, 35, 50, 40, 60, 55, 70, 65, 80, 75, 90, 85, 60, 70, 50, 60, 80, 90, 100].map((h, i) => (
                                <div key={i} className="w-full bg-primary/10 hover:bg-primary rounded-t-md transition-all duration-300 group relative" style={{ height: `${h}%` }}>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {h * 10}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-neutral-400 mt-4 px-2">
                            <span>01 Set</span>
                            <span>15 Set</span>
                            <span>30 Set</span>
                        </div>
                    </Card>

                    <div className="grid grid-cols-2 gap-6">
                         <Card className="p-6 border-l-4 border-l-red-500">
                             <h4 className="text-sm font-bold text-neutral-500 uppercase">Alertas de Sistema</h4>
                             <p className="text-xl font-bold text-neutral-900 mt-1">2 Reports</p>
                             <p className="text-xs text-neutral-400 mt-1">Usuários reportados aguardando análise.</p>
                         </Card>
                         <Card className="p-6 border-l-4 border-l-green-500">
                             <h4 className="text-sm font-bold text-neutral-500 uppercase">Saúde do Servidor</h4>
                             <p className="text-xl font-bold text-neutral-900 mt-1">99.9% Uptime</p>
                             <p className="text-xs text-neutral-400 mt-1">Nenhum incidente nas últimas 24h.</p>
                         </Card>
                    </div>
                </div>

                {/* Recent Activity */}
                <Card className="p-6">
                    <h3 className="font-bold text-neutral-900 mb-4">Atividade Recente</h3>
                    <div className="space-y-1">
                        <ActivityRow user="Dr. Silva" action="Atualizou disponibilidade" time="5 min" />
                        <ActivityRow user="Ana Martins" action="Novo cadastro (Paciente)" time="12 min" />
                        <ActivityRow user="Admin" action="Aprovou Dr. Ricardo" time="1h atrás" />
                        <ActivityRow user="Sistema" action="Backup diário concluído" time="2h atrás" />
                        <ActivityRow user="Carlos Souza" action="Upgrade para Elite" time="3h atrás" />
                        <ActivityRow user="Dra. Julia" action="Solicitou saque" time="5h atrás" />
                    </div>
                    <Button variant="ghost" className="w-full mt-4 text-xs">Ver Log Completo</Button>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
