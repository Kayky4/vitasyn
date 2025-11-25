
import React, { useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const AdminCommunications = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [target, setTarget] = useState('all');
    const [priority, setPriority] = useState('normal');

    const handleSend = () => {
        alert(`Notificação enviada para: ${target}\nPrioridade: ${priority}\nConteúdo: ${title}`);
        setTitle('');
        setMessage('');
    };

    return (
        <AdminLayout>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Create Notification */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900">Novo Comunicado</h2>
                        <p className="text-neutral-500">Envie notificações para usuários da plataforma.</p>
                    </div>

                    <Card className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-neutral-700 mb-1">Título</label>
                            <input 
                                type="text" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="Ex: Manutenção Programada"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-neutral-700 mb-1">Mensagem</label>
                            <textarea 
                                rows={4}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                placeholder="Digite o conteúdo do aviso..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-1">Público Alvo</label>
                                <select 
                                    value={target}
                                    onChange={(e) => setTarget(e.target.value)}
                                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg bg-white"
                                >
                                    <option value="all">Todos os Usuários</option>
                                    <option value="patients">Apenas Pacientes</option>
                                    <option value="professionals">Apenas Profissionais</option>
                                    <option value="subscribers">Assinantes Pagos</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-neutral-700 mb-1">Prioridade</label>
                                <select 
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg bg-white"
                                >
                                    <option value="normal">Normal</option>
                                    <option value="high">Alta (Push Notification)</option>
                                    <option value="critical">Crítica (Banner Fixo)</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button onClick={handleSend} className="w-full">Enviar Comunicado</Button>
                        </div>
                    </Card>
                </div>

                {/* History */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900">Histórico Recente</h2>
                        <p className="text-neutral-500">Últimos comunicados enviados.</p>
                    </div>

                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="p-4 flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                                </div>
                                <div>
                                    <div className="flex justify-between items-start w-full">
                                        <h4 className="font-bold text-neutral-900">Atualização nos Termos de Uso</h4>
                                        <span className="text-xs text-neutral-400">2 dias atrás</span>
                                    </div>
                                    <p className="text-sm text-neutral-600 mt-1">Enviado para: Todos os Usuários</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded font-bold">Entregue: 98%</span>
                                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold">Lido: 45%</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminCommunications;
