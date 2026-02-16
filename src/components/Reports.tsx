import { useMemo, useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { supabase } from '../lib/supabase';
import { PieChart, TrendingUp, Users, Filter, Briefcase, CreditCard } from 'lucide-react';
import type { Transaction, Wallet } from '../types';

export default function Reports() {
    const { transactions: contextTransactions, wallets: contextWallets, trips, currentTripId } = useExpenses();

    // State for selected trip (defaults to current global trip)
    const [selectedTripId, setSelectedTripId] = useState<string | null>(currentTripId);

    // Local state for report data (supports viewing other trips without switching context)
    const [reportData, setReportData] = useState<{ transactions: Transaction[], wallets: Wallet[] }>({
        transactions: [],
        wallets: []
    });
    const [isLoading, setIsLoading] = useState(false);

    // Update selected trip if currentTripId changes (initial load or context switch)
    useEffect(() => {
        if (currentTripId) {
            setSelectedTripId(currentTripId);
        }
    }, [currentTripId]);

    // Fetch data when selectedTripId changes
    useEffect(() => {
        const fetchData = async () => {
            if (!selectedTripId) return;

            // If selected trip is the active one, use Context data (instant)
            if (selectedTripId === currentTripId) {
                setReportData({
                    transactions: contextTransactions,
                    wallets: contextWallets
                });
                return;
            }

            // Otherwise, fetch from Supabase
            setIsLoading(true);
            try {
                const { data: walletsData } = await supabase.from('wallets').select('*').eq('trip_id', selectedTripId);
                const { data: transactionsData } = await supabase.from('transactions').select('*').eq('trip_id', selectedTripId);

                if (walletsData && transactionsData) {
                    const mappedWallets = walletsData.map((w: any) => ({
                        ...w,
                        includedInDivision: w.included_in_division !== false
                    }));

                    const mappedTransactions = transactionsData.map((t: any) => ({
                        ...t,
                        date: new Date(t.date),
                        isShared: t.is_shared,
                        paymentMethod: t.payment_method,
                        type: t.type || 'expense'
                    }));

                    setReportData({
                        transactions: mappedTransactions,
                        wallets: mappedWallets
                    });
                }
            } catch (error) {
                console.error("Error fetching report data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [selectedTripId, currentTripId, contextTransactions, contextWallets]);

    const { transactions, wallets } = reportData;

    // --- Calculations (No Date Filtering - Whole Trip) ---

    // 1. Total Spent
    const totalSpent = useMemo(() => transactions.reduce((acc, t) => acc + t.amount, 0), [transactions]);
    const totalTax = useMemo(() => transactions.reduce((acc, t) => acc + (t.tax || 0), 0), [transactions]);

    // 2. Category Breakdown
    const categoryStats = useMemo(() => {
        const stats: Record<string, number> = {};
        transactions.forEach(t => {
            if (t.type === 'expense') {
                stats[t.category] = (stats[t.category] || 0) + t.amount;
            } else if (t.type === 'income') {
                stats[t.category] = (stats[t.category] || 0) - t.amount;
            }
        });

        // Filter out categories with 0 or negative total (optional, but usually desired for "Spending" charts)
        // If the user wants to see "Negative Spending" (Profit), we can keep them. 
        // For a donut chart, negative values usually break it or are confusing. 
        // Let's keep them but ensure the chart handles them (or just filter out for now if value <= 0).

        return Object.entries(stats)
            .filter(([, value]) => value > 0) // Only show positive spending
            .sort(([, a], [, b]) => b - a)
            .map(([name, value]) => ({
                name,
                value,
                percentage: totalSpent > 0 ? (value / totalSpent) * 100 : 0
            }));
    }, [transactions, totalSpent]);

    // 3. Person Breakdown (Consumption / Cost)
    const consumptionStats = useMemo(() => {
        const stats: Record<string, number> = {};
        wallets.forEach(w => stats[w.id] = 0);

        transactions.forEach(t => {
            if (t.isShared) {
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
                stats[t.payer] = (stats[t.payer] || 0) + t.amount;
            }
        });

        return Object.entries(stats)
            .sort(([, a], [, b]) => b - a)
            .map(([id, value]) => ({
                id,
                name: wallets.find(w => w.id === id)?.name || 'Desconhecido',
                value,
                percentage: totalSpent > 0 ? (value / totalSpent) * 100 : 0
            }));
    }, [transactions, wallets, totalSpent]);



    // 5. Payment Method Breakdown
    const paymentMethodStats = useMemo(() => {
        const stats: Record<string, number> = {};
        transactions.forEach(t => {
            if (t.type === 'expense') { // Only count expenses, not transfers/returns
                const method = t.paymentMethod || 'Indefinido';
                stats[method] = (stats[method] || 0) + t.amount;
            }
        });
        return Object.entries(stats)
            .sort(([, a], [, b]) => b - a)
            .map(([name, value]) => ({
                name,
                value,
                percentage: totalSpent > 0 ? (value / totalSpent) * 100 : 0
            }));
    }, [transactions, totalSpent]);


    return (
        <div className="p-4 md:p-8 space-y-8 pb-24 md:pb-8">

            {/* Header / Trip Selector */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <PieChart className="text-purple-600" />
                        Relatórios
                    </h2>
                    <p className="text-gray-500 text-sm">Análise completa da viagem</p>
                </div>

                <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2 px-3">
                    <Briefcase size={16} className="text-gray-500" />
                    <select
                        value={selectedTripId || ''}
                        onChange={(e) => setSelectedTripId(e.target.value)}
                        className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none cursor-pointer py-2 min-w-[150px]"
                        disabled={isLoading}
                    >
                        {trips.map(trip => (
                            <option key={trip.id} value={trip.id}>
                                {trip.name} {trip.id === currentTripId ? '(Atual)' : ''}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
            ) : (
                <>
                    {/* Total Card */}
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                                    <TrendingUp size={24} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-purple-100 text-sm font-medium">Total Gasto na Viagem</p>
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

                        {/* 2. Payment Method Chart */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <CreditCard size={18} className="text-purple-500" />
                                Por Forma de Pagamento
                            </h3>
                            <div className="space-y-4">
                                {paymentMethodStats.map((method, index) => (
                                    <div key={method.name} className="relative">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{method.name}</span>
                                            <span className="text-gray-500">${method.value.toFixed(2)} ({method.percentage.toFixed(1)}%)</span>
                                        </div>
                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${index % 2 === 0 ? 'bg-purple-500' : 'bg-pink-500'}`}
                                                style={{ width: `${method.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                                {paymentMethodStats.length === 0 && <p className="text-gray-400 text-center py-4">Nenhum dado.</p>}
                            </div>
                        </div>

                        {/* 3. Person Consumption Chart */}
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
                                {consumptionStats.length === 0 && <p className="text-gray-400 text-center py-4">Nenhum dado.</p>}
                            </div>
                        </div>



                    </div>
                </>
            )}
        </div>
    );
}
