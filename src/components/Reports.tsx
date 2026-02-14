import { useMemo, useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { PieChart, TrendingUp, DollarSign, Users, Filter } from 'lucide-react';
import { clsx } from 'clsx';

export default function Reports() {
    const { transactions, wallets } = useExpenses();
    const [dateRange, setDateRange] = useState<'all' | 'thisMonth' | 'lastMonth'>('all');

    // --- Filter Logic ---
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            // Date Filter
            if (dateRange !== 'all') {
                const date = new Date(t.date);
                const now = new Date();
                if (dateRange === 'thisMonth') {
                    if (date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear()) return false;
                } else if (dateRange === 'lastMonth') {
                    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    if (date.getMonth() !== lastMonth.getMonth() || date.getFullYear() !== lastMonth.getFullYear()) return false;
                }
            }
            // Person Filter (Payer or Involved?) - Let's stick to global for now, filtering by payer reduces utility of "Shared" view
            // If selectedPerson is set, we might want to see only transactions where they are involved.
            // But for high level reports, let's keep it simple first.
            return true;
        });
    }, [transactions, dateRange]);

    // --- Calculations ---

    // 1. Total Spent
    const totalSpent = filteredTransactions.reduce((acc, t) => acc + t.amount, 0);
    const totalTax = filteredTransactions.reduce((acc, t) => acc + (t.tax || 0), 0);

    // 2. Category Breakdown
    const categoryStats = useMemo(() => {
        const stats: Record<string, number> = {};
        filteredTransactions.forEach(t => {
            stats[t.category] = (stats[t.category] || 0) + t.amount;
        });
        return Object.entries(stats)
            .sort(([, a], [, b]) => b - a)
            .map(([name, value]) => ({
                name,
                value,
                percentage: (value / totalSpent) * 100
            }));
    }, [filteredTransactions, totalSpent]);

    // 3. Person Breakdown (Consumption / Cost)
    // Who "spent" the money (consumed the service), regardless of who paid.
    const consumptionStats = useMemo(() => {
        const stats: Record<string, number> = {};
        wallets.forEach(w => stats[w.id] = 0);

        filteredTransactions.forEach(t => {
            if (t.isShared) {
                // Find participants based on division flag and date
                const participants = wallets.filter(w => {
                    const created = w.created_at ? new Date(w.created_at) : new Date(0);
                    const txDate = new Date(t.date);
                    return w.includedInDivision && created <= txDate;
                });

                const count = participants.length > 0 ? participants.length : 1;
                const share = t.amount / count;

                participants.forEach(p => {
                    stats[p.id] = (stats[p.id] || 0) + share;
                });
            } else {
                // Single transaction: Payer is the consumer (usually)
                // Unless we add a "beneficiary" field later. For now assumption: Individual expense = Payer consumed.
                stats[t.payer] = (stats[t.payer] || 0) + t.amount;
            }
        });

        return Object.entries(stats)
            .sort(([, a], [, b]) => b - a)
            .map(([id, value]) => ({
                id,
                name: wallets.find(w => w.id === id)?.name || 'Desconhecido',
                value,
                percentage: (value / totalSpent) * 100
            }));
    }, [filteredTransactions, wallets, totalSpent]);

    // 4. Payer Breakdown (Cash Flow Out)
    // Who actually paid.
    const payerStats = useMemo(() => {
        const stats: Record<string, number> = {};
        filteredTransactions.forEach(t => {
            stats[t.payer] = (stats[t.payer] || 0) + t.amount;
        });
        return Object.entries(stats)
            .sort(([, a], [, b]) => b - a)
            .map(([id, value]) => ({
                id,
                name: wallets.find(w => w.id === id)?.name || 'Desconhecido',
                value,
                percentage: (value / totalSpent) * 100
            }));
    }, [filteredTransactions, wallets, totalSpent]);


    return (
        <div className="p-4 md:p-8 space-y-8 pb-24 md:pb-8">

            {/* Header / Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <PieChart className="text-purple-600" />
                        Relatórios
                    </h2>
                    <p className="text-gray-500 text-sm">Análise detalhada dos gastos</p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setDateRange('all')}
                        className={clsx("px-4 py-2 rounded-lg text-sm font-medium transition-all", dateRange === 'all' ? "bg-white text-purple-600 shadow-sm" : "text-gray-500 hover:text-gray-800")}
                    >Todo Período</button>
                    <button
                        onClick={() => setDateRange('thisMonth')}
                        className={clsx("px-4 py-2 rounded-lg text-sm font-medium transition-all", dateRange === 'thisMonth' ? "bg-white text-purple-600 shadow-sm" : "text-gray-500 hover:text-gray-800")}
                    >Este Mês</button>
                </div>
            </div>

            {/* Total Card */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                            <TrendingUp size={24} className="text-white" />
                        </div>
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Total Gasto no Período</p>
                            <h2 className="text-4xl font-bold">${totalSpent.toFixed(2)}</h2>
                        </div>
                    </div>

                    <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm min-w-[200px]">
                        <p className="text-purple-100 text-sm font-medium mb-1">Total em Taxas</p>
                        <p className="text-2xl font-bold">${totalTax.toFixed(2)}</p>
                        <p className="text-xs text-purple-200 mt-1">
                            {totalSpent > 0 ? ((totalTax / totalSpent) * 100).toFixed(1) : 0}% do total
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 1. Category Chart */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Filter size={18} className="text-blue-500" />
                        Por Categoria
                    </h3>
                    <div className="space-y-4">
                        {categoryStats.map((cat, index) => (
                            <div key={cat.name} className="relative">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700">{cat.name}</span>
                                    <span className="text-gray-500">${cat.value.toFixed(2)} ({cat.percentage.toFixed(1)}%)</span>
                                </div>
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${index % 2 === 0 ? 'bg-blue-500' : 'bg-indigo-500'}`}
                                        style={{ width: `${cat.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        {categoryStats.length === 0 && <p className="text-gray-400 text-center py-4">Nenhum dado.</p>}
                    </div>
                </div>

                {/* 2. Person Consumption Chart */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Users size={18} className="text-green-500" />
                        Gastos por Pessoa (Consumo)
                    </h3>
                    <p className="text-xs text-gray-400 mb-4">
                        Reflete quem "usufruiu" do dinheiro, considerando a divisão das contas.
                    </p>
                    <div className="space-y-4">
                        {consumptionStats.map((person, index) => (
                            <div key={person.id} className="group">
                                <div className="flex justify-between text-sm mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${index % 2 === 0 ? 'bg-green-500' : 'bg-teal-500'}`}></div>
                                        <span className="font-medium text-gray-700">{person.name}</span>
                                    </div>
                                    <span className="text-gray-500 font-mono">${person.value.toFixed(2)}</span>
                                </div>
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${index % 2 === 0 ? 'bg-green-500' : 'bg-teal-500'}`}
                                        style={{ width: `${person.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Payer Chart */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 lg:col-span-2">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <DollarSign size={18} className="text-orange-500" />
                        Quem Pagou? (Fluxo de Caixa)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {payerStats.map((person) => (
                            <div key={person.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                                    {person.percentage.toFixed(0)}%
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Pagou</p>
                                    <p className="font-bold text-gray-900">{person.name}</p>
                                    <p className="text-sm font-mono text-orange-600">${person.value.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
