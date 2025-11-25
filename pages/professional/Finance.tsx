
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { UserRole, Transaction, TransactionType, TransactionStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { auth } from '../../lib/firebase';

// --- Icons ---
const Icons = {
    Eye: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    EyeOff: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>,
    ArrowUp: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>,
    ArrowDown: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>,
    Stripe: () => <svg className="w-5 h-5" viewBox="0 0 40 40" fill="currentColor"><path d="M33.9 18.6c0-2.5-2-4.5-5.3-4.5-3.9 0-6.9 2.2-6.9 2.2l-1.3-3.1s2.6-1.6 7.5-1.6c6.8 0 10.9 3.8 10.9 9.1 0 7.6-10.3 7.7-10.3 11.4 0 1.4 1.5 2 3.6 2 3.2 0 6.5-1.8 6.5-1.8l1.2 3.4s-3.3 2.3-8 2.3c-7 0-10.7-3.7-10.7-9.3 0-8.1 10.3-8.2 10.3-11.5 0-1.3-1.4-2-3.5-2-2.8 0-5.1 1.3-5.1 1.3l-1.3-3.4c1.9-1.3 5.2-1.9 8-1.9z"/></svg>,
    Calendar: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
};

// --- Mock Data Generators ---
const generateMockTransactions = (count: number): Transaction[] => {
    const types = [TransactionType.PAYMENT, TransactionType.PAYMENT, TransactionType.PAYMENT, TransactionType.PAYOUT];
    const statuses = [TransactionStatus.COMPLETED, TransactionStatus.COMPLETED, TransactionStatus.PROCESSING];
    const names = ['Consulta - Maria Silva', 'Consulta - João Santos', 'Consulta - Ana Oliveira', 'Transferência para Conta'];
    
    return Array.from({ length: count }).map((_, i) => {
        const type = types[i % types.length];
        const isPayout = type === TransactionType.PAYOUT;
        return {
            id: `txn_${Math.random().toString(36).substr(2, 9)}`,
            type: type,
            amount_cents: isPayout ? 45000 : 15000,
            status: statuses[i % statuses.length],
            created_at: new Date(Date.now() - i * 86400000).toISOString(),
            description: names[i % names.length],
            related_entity_name: isPayout ? 'Banco Itaú' : names[i % names.length].split(' - ')[1]
        };
    });
};

// --- Sub-Components ---

// 1. Digital Wallet Card
const WalletCard = ({ balance, pending, onWithdraw, stripeConnected }: any) => {
    const [hidden, setHidden] = useState(false);
    const [counter, setCounter] = useState(0);

    // Count up animation
    useEffect(() => {
        const interval = setInterval(() => {
            setCounter(prev => {
                const diff = balance - prev;
                if (Math.abs(diff) < 100) return balance;
                return prev + diff * 0.1;
            });
        }, 20);
        return () => clearInterval(interval);
    }, [balance]);

    const displayBalance = hidden ? '••••••' : `R$ ${(counter / 100).toFixed(2).replace('.', ',')}`;
    const displayPending = hidden ? '••••' : `R$ ${(pending / 100).toFixed(2).replace('.', ',')}`;

    return (
        <div className="relative overflow-hidden rounded-2xl bg-[#0F172A] p-6 md:p-8 text-white shadow-2xl shadow-neutral-900/20 group">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col h-full justify-between min-h-[180px]">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 text-neutral-400 text-sm font-medium mb-1">
                            <span>Saldo Disponível</span>
                            <button onClick={() => setHidden(!hidden)} className="hover:text-white transition-colors">
                                {hidden ? <Icons.Eye /> : <Icons.EyeOff />}
                            </button>
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight text-white">{displayBalance}</h2>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/5">
                        <span className="text-xs font-bold uppercase tracking-widest text-neutral-300">VitaSyn Wallet</span>
                    </div>
                </div>

                <div className="mt-8 flex items-end justify-between">
                    <div>
                        <p className="text-xs text-neutral-500 font-bold uppercase tracking-wide mb-1">A liberar (Pendentes)</p>
                        <p className="text-lg font-medium text-emerald-400 flex items-center gap-1">
                            {displayPending}
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        </p>
                    </div>
                    
                    <Button 
                        disabled={balance <= 0 || !stripeConnected} 
                        onClick={onWithdraw}
                        className={`shadow-lg shadow-white/5 border border-white/10 ${!stripeConnected ? 'opacity-50' : 'hover:scale-105'} transition-all`}
                        variant="secondary"
                    >
                        Solicitar Saque
                    </Button>
                </div>
            </div>
        </div>
    );
};

// 2. SVG Revenue Chart
const RevenueChart = () => {
    // Mock data points for chart (0-100 scale)
    const points = [20, 45, 30, 60, 55, 80, 70, 90, 85, 100];
    const width = 100;
    const height = 50;
    
    // Create SVG Path
    const stepX = width / (points.length - 1);
    const pathData = points.map((p, i) => 
        `${i === 0 ? 'M' : 'L'} ${i * stepX} ${height - (p / 100 * height)}`
    ).join(' ');

    // Fill area path
    const fillPath = `${pathData} L ${width} ${height} L 0 ${height} Z`;

    return (
        <Card className="p-6 md:p-8 flex flex-col justify-between h-full min-h-[300px]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-bold text-neutral-900 text-lg">Receita Recorrente</h3>
                    <p className="text-sm text-neutral-500">Últimos 30 dias</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-3 py-1 rounded-md text-xs font-bold bg-neutral-900 text-white shadow-sm">30D</button>
                    <button className="px-3 py-1 rounded-md text-xs font-bold text-neutral-400 hover:bg-neutral-100">90D</button>
                </div>
            </div>

            <div className="flex-1 relative w-full h-full min-h-[150px]">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#3A5AFE" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#3A5AFE" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d={fillPath} fill="url(#chartGradient)" />
                    <path d={pathData} fill="none" stroke="#3A5AFE" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
            
            <div className="mt-4 flex justify-between text-xs text-neutral-400 font-medium">
                <span>01 Out</span>
                <span>15 Out</span>
                <span>30 Out</span>
            </div>
        </Card>
    );
};

// 3. Transaction List Item
const TransactionRow: React.FC<{ txn: Transaction }> = ({ txn }) => {
    const isIncome = txn.type === TransactionType.PAYMENT;
    const isCompleted = txn.status === TransactionStatus.COMPLETED;
    
    return (
        <div className="flex items-center justify-between p-4 border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50 transition-colors group">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isIncome ? 'bg-green-50 text-green-600' : 'bg-neutral-100 text-neutral-600'}`}>
                    {isIncome ? <Icons.ArrowDown /> : <Icons.ArrowUp />}
                </div>
                <div>
                    <p className="font-bold text-sm text-neutral-900">{txn.description}</p>
                    <p className="text-xs text-neutral-500">{new Date(txn.created_at).toLocaleDateString()} • {new Date(txn.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                </div>
            </div>
            <div className="text-right">
                <p className={`font-bold text-sm ${isIncome ? 'text-neutral-900' : 'text-neutral-500'}`}>
                    {isIncome ? '+' : '-'} R$ {(txn.amount_cents / 100).toFixed(2).replace('.', ',')}
                </p>
                <div className="mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        isCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                        {txn.status === 'completed' ? 'Pago' : 'Processando'}
                    </span>
                </div>
            </div>
        </div>
    );
};

// 4. Connection Status Widget
const ConnectionStatus = ({ stripe, google }: any) => (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 space-y-4">
        <h3 className="font-bold text-neutral-900 text-sm">Integrações Ativas</h3>
        
        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-100">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stripe ? 'bg-[#635BFF] text-white' : 'bg-neutral-200 text-neutral-400'}`}>
                    <Icons.Stripe />
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-neutral-900">Stripe Connect</span>
                    <span className={`text-[10px] font-medium ${stripe ? 'text-green-600' : 'text-red-500'}`}>
                        {stripe ? '• Ativo' : '• Desconectado'}
                    </span>
                </div>
            </div>
            {!stripe && <button className="text-xs font-bold text-primary hover:underline">Conectar</button>}
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-100">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${google ? 'bg-blue-500 text-white' : 'bg-neutral-200 text-neutral-400'}`}>
                    <Icons.Calendar />
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-neutral-900">Google Calendar</span>
                    <span className={`text-[10px] font-medium ${google ? 'text-green-600' : 'text-neutral-500'}`}>
                        {google ? '• Sincronizado' : '• Inativo'}
                    </span>
                </div>
            </div>
            {!google && <button className="text-xs font-bold text-primary hover:underline">Ativar</button>}
        </div>
    </div>
);

// --- Main Page Component ---

const ProfessionalFinance = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState({ available: 0, pending: 0 });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [connections, setConnections] = useState({ stripe: false, google: false });

    useEffect(() => {
        // Simulation of data fetching
        const loadData = async () => {
            if (!auth.currentUser) return;
            
            // Mock backend latency
            setTimeout(() => {
                setBalance({ available: 245050, pending: 45000 }); // R$ 2.450,50
                setTransactions(generateMockTransactions(8));
                
                // Check if user has connected account (Mock)
                setConnections({ stripe: false, google: true }); // Simulating Stripe disconnected to show UI state
                setLoading(false);
            }, 800);
        };
        loadData();
    }, []);

    const handleWithdraw = () => {
        alert("Solicitação de saque enviada para processamento (D+1).");
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

    return (
        <div className="min-h-screen bg-[#F9FAFB] pb-20">
            <Navbar userRole={UserRole.PROFESSIONAL} isAuthenticated={true} />
            
            <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                
                {/* Header */}
                <div className="mb-8">
                    <button onClick={() => navigate(-1)} className="text-neutral-500 hover:text-neutral-900 text-sm mb-2 flex items-center gap-1">
                        ← Voltar para Painel
                    </button>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Gestão Financeira</h1>
                            <p className="text-neutral-500 mt-1">Acompanhe seus ganhos, saques e conexões bancárias.</p>
                        </div>
                        {/* Status Alert if Stripe Disconnected */}
                        {!connections.stripe && (
                            <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                <div>
                                    <p className="text-sm font-bold">Configure seus recebimentos</p>
                                    <p className="text-xs opacity-90">Conecte sua conta Stripe para sacar.</p>
                                </div>
                                <Button size="sm" variant="danger" className="ml-2 h-8 text-xs">Conectar</Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column (Transactions & Charts) */}
                    <div className="lg:col-span-8 space-y-8 order-2 lg:order-1">
                        
                        {/* Revenue Chart */}
                        <div className="h-80">
                            <RevenueChart />
                        </div>

                        {/* Transactions List */}
                        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
                                <h3 className="font-bold text-neutral-900 text-lg">Extrato Recente</h3>
                                <button className="text-primary text-sm font-medium hover:underline">Ver tudo</button>
                            </div>
                            <div>
                                {transactions.map(txn => (
                                    <TransactionRow key={txn.id} txn={txn} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Wallet & Tools) */}
                    <div className="lg:col-span-4 space-y-8 order-1 lg:order-2">
                        
                        {/* Wallet Card */}
                        <WalletCard 
                            balance={balance.available} 
                            pending={balance.pending} 
                            onWithdraw={handleWithdraw}
                            stripeConnected={connections.stripe}
                        />

                        {/* Integration Status */}
                        <ConnectionStatus 
                            stripe={connections.stripe} 
                            google={connections.google} 
                        />

                        {/* Tip Card */}
                        <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl p-6 border border-neutral-200">
                            <h4 className="font-bold text-neutral-900 mb-2 text-sm">Previsibilidade de Caixa</h4>
                            <p className="text-xs text-neutral-500 leading-relaxed">
                                Os pagamentos de consultas realizadas hoje estarão disponíveis para saque em D+2 (2 dias úteis) após a confirmação do atendimento.
                            </p>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default ProfessionalFinance;
