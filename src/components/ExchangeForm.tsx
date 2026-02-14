import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useToast } from '../context/ToastContext';
import { ArrowDown, DollarSign } from 'lucide-react';
import { clsx } from 'clsx';
import { clsx } from 'clsx';
import type { WalletType } from '../types';
import ExchangeList from './ExchangeList';

export default function ExchangeForm() {
    const { addExchange, wallets } = useExpenses();
    const { showToast } = useToast();

    const [originAmount, setOriginAmount] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [originCurrency] = useState('BRL');
    const [targetWallet, setTargetWallet] = useState<WalletType | 'both'>('both');
    const [location, setLocation] = useState('');

    const rate = (parseFloat(originAmount) && parseFloat(targetAmount))
        ? (parseFloat(originAmount) / parseFloat(targetAmount)).toFixed(2)
        : '---';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!originAmount || !targetAmount) return;

        try {
            await addExchange({
                originAmount: parseFloat(originAmount),
                targetAmount: parseFloat(targetAmount),
                originCurrency,
                targetWallet,
                rate: parseFloat(rate),
                date: new Date(),
                location
            });

            setOriginAmount('');
            setTargetAmount('');
            setLocation('');
            showToast('Câmbio registrado com sucesso!', 'success');
        } catch (error) {
            console.error(error);
            showToast('Erro ao registrar câmbio.', 'error');
        }
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <DollarSign className="text-green-600" />
                Novo Câmbio
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Origin Amount (BRL) */}
                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Valor Pago ({originCurrency})</label>
                    <input
                        type="number"
                        step="0.01"
                        value={originAmount}
                        onChange={(e) => setOriginAmount(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border-gray-200 focus:ring-green-500 focus:border-green-500 font-bold text-lg"
                        placeholder="0.00"
                        required
                    />
                </div>

                <div className="flex justify-center -my-3 relative z-10">
                    <div className="bg-gray-100 p-2 rounded-full border border-white shadow-sm">
                        <ArrowDown size={20} className="text-gray-400" />
                    </div>
                </div>

                {/* Target Amount (USD) */}
                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Valor Recebido (USD)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(e.target.value)}
                        className="w-full px-4 py-3 bg-green-50 rounded-xl border-green-200 focus:ring-green-500 focus:border-green-500 font-bold text-lg text-green-700"
                        placeholder="0.00"
                        required
                    />
                </div>

                {/* Rate Display */}
                <div className="text-center text-sm text-gray-500">
                    Cotação estimada: <span className="font-bold text-gray-800">R$ {rate}</span>
                </div>


                {/* Broker/Location */}
                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Corretora / Local</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-green-500 focus:border-green-500 font-medium"
                        placeholder="Ex: Wise, Western Union"
                    />
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
                                        ? "border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500"
                                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
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
            </form>

            <ExchangeList />
        </div >
    );
}
