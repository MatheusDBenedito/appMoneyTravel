import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useToast } from '../hooks/useToast';
import { ArrowDown, DollarSign, Calculator, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import type { WalletType } from '../types';
import ExchangeList from './ExchangeList';

export default function ExchangeForm() {
    const { addExchange, wallets, paymentMethods } = useExpenses();
    const { showToast } = useToast();

    // Custom Input State (Strings for formatting)
    const [originValue, setOriginValue] = useState('');
    const [targetValue, setTargetValue] = useState('');

    // Derived numeric values for calculation
    const getNumericValue = (val: string) => {
        if (!val) return 0;
        // Remove non-digits
        const digits = val.replace(/\D/g, '');
        return Number(digits) / 100;
    };

    const originAmount = getNumericValue(originValue);
    const targetAmount = getNumericValue(targetValue);

    const [originCurrency] = useState('BRL');
    const [targetWallet, setTargetWallet] = useState<WalletType | 'both'>('both');
    const [location, setLocation] = useState(paymentMethods[0] || '');
    const [marketRate, setMarketRate] = useState<number | null>(null);
    const [isLoadingRate, setIsLoadingRate] = useState(false);

    // Fetch Market Rate
    const fetchRate = async () => {
        setIsLoadingRate(true);
        try {
            const res = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL');
            const data = await res.json();
            const rate = parseFloat(data.USDBRL.bid);
            setMarketRate(rate);
        } catch (error) {
            console.error("Error fetching rate", error);
        } finally {
            setIsLoadingRate(false);
        }
    };

    useEffect(() => {
        fetchRate();
    }, []);

    // Auto-select first payment method if location is empty
    useEffect(() => {
        if (!location && paymentMethods.length > 0) {
            setLocation(paymentMethods[0]);
        }
    }, [paymentMethods, location]);

    // Format utility
    const formatCurrency = (value: string) => {
        // Value is the raw input string
        const digits = value.replace(/\D/g, '');
        const number = Number(digits) / 100;
        return number.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
        let value = e.target.value;
        // Remove non-digits
        value = value.replace(/\D/g, '');
        setter(value);
    };

    // Calculate effective rate based on inputs
    const effectiveRate = (originAmount && targetAmount)
        ? (originAmount / targetAmount).toFixed(2)
        : '---';

    const autoCalculateTarget = () => {
        if (!originAmount || !marketRate) return;
        // Logic: You have R$ 1000. Rate is R$ 5.00 -> You get $200 USD.
        // Formula: Origin / Rate = Target
        const calculated = originAmount / marketRate;
        const asString = calculated.toFixed(2).replace('.', '');
        setTargetValue(asString);
        showToast('Valor em Dólar calculado com base na cotação!', 'success');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!originAmount || !targetAmount) return;

        try {
            await addExchange({
                originAmount,
                targetAmount,
                originCurrency,
                targetWallet,
                rate: parseFloat(effectiveRate),
                date: new Date(),
                location
            });

            setOriginValue('');
            setTargetValue('');
            setLocation('');
            showToast('Câmbio registrado com sucesso!', 'success');
        } catch (error) {
            console.error(error);
            showToast('Erro ao registrar câmbio.', 'error');
        }
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 dark:text-gray-100">
                <DollarSign className="text-green-600" />
                Novo Câmbio
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Origin Amount (BRL) */}
                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Valor Pago ({originCurrency})</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={formatCurrency(originValue)}
                            onChange={(e) => handleInputChange(e, setOriginValue)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-gray-200 focus:ring-green-500 focus:border-green-500 font-bold text-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            placeholder="0,00"
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-center -my-3 relative z-10">
                    <div className="bg-gray-100 p-2 rounded-full border border-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <ArrowDown size={20} className="text-gray-400" />
                    </div>
                </div>

                {/* Target Amount (USD) */}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-500">Valor Recebido (USD)</label>
                        {marketRate && originAmount > 0 && (
                            <button
                                type="button"
                                onClick={autoCalculateTarget}
                                className="text-xs text-green-600 flex items-center gap-1 hover:underline"
                            >
                                <Calculator size={12} />
                                Calcular (x {marketRate.toFixed(2)})
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600 font-bold">$</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={formatCurrency(targetValue)}
                            onChange={(e) => handleInputChange(e, setTargetValue)}
                            className="w-full pl-10 pr-4 py-3 bg-green-50 rounded-xl border-green-200 focus:ring-green-500 focus:border-green-500 font-bold text-lg text-green-700"
                            placeholder="0,00"
                            required
                        />
                    </div>
                </div>

                {/* Rate Display */}
                <div className="text-center text-sm text-gray-500 bg-gray-50 p-2 rounded-lg flex flex-col gap-1 items-center justify-center">
                    <div>
                        Câmbio Efetivo: <span className="font-bold text-gray-800">R$ {effectiveRate}</span>
                    </div>
                    {marketRate && (
                        <div className="text-xs flex items-center gap-1 text-gray-400">
                            (Comercial Hoje: R$ {marketRate.toFixed(2)})
                            <button type="button" onClick={fetchRate} disabled={isLoadingRate}>
                                <RefreshCw size={10} className={isLoadingRate ? "animate-spin" : ""} />
                            </button>
                        </div>
                    )}
                </div>


                {/* Broker/Location (Now Payment Method) */}
                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Corretora / Local (Forma de Pagamento)</label>
                    <div className="flex flex-wrap gap-2 bg-gray-50 p-1 rounded-xl dark:bg-gray-800">
                        {paymentMethods.map(method => (
                            <button
                                key={method}
                                type="button"
                                onClick={() => setLocation(method)}
                                className={clsx(
                                    "flex-1 min-w-[80px] py-2 rounded-lg text-xs font-bold transition-all",
                                    location === method
                                        ? "bg-white text-green-600 shadow-sm ring-1 ring-green-100 dark:bg-gray-700 dark:ring-green-900 dark:text-green-400"
                                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                )}
                            >
                                {method}
                            </button>
                        ))}
                        {paymentMethods.length === 0 && (
                            <span className="text-xs text-gray-400 p-2">Nenhuma forma de pagamento cadastrada.</span>
                        )}
                    </div>
                </div>

                {/* Target Wallet */}
                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Destino do Dólar</label>
                    <div className="grid grid-cols-3 gap-2">
                        {wallets.map(w => (
                            <button
                                key={w.id}
                                type="button"
                                onClick={() => setTargetWallet(w.id)}
                                className={clsx(
                                    "py-3 px-2 rounded-xl border text-sm font-medium transition-all",
                                    targetWallet === w.id
                                        ? "border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500 dark:bg-green-900/20 dark:text-green-400"
                                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
                                )}
                            >
                                {w.name}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => setTargetWallet('both')}
                            className={clsx(
                                "py-3 px-2 rounded-xl border text-sm font-medium transition-all",
                                targetWallet === 'both'
                                    ? "border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500"
                                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                            )}
                        >
                            Dividir Todos
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 active:scale-95 transition-transform"
                >
                    Registrar Compra
                </button>

            </form>

            <ExchangeList />
        </div>
    );
}
