import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useToast } from '../hooks/useToast';
import type { ExchangeTransaction, WalletType } from '../types';
import { X, DollarSign, ArrowDown, Save } from 'lucide-react';
import { clsx } from 'clsx';

interface EditExchangeModalProps {
    exchange: ExchangeTransaction;
    onClose: () => void;
}

export default function EditExchangeModal({ exchange, onClose }: EditExchangeModalProps) {
    const { updateExchange, wallets } = useExpenses();
    const { showToast } = useToast();

    const [originAmount, setOriginAmount] = useState(exchange.originAmount.toString());
    const [targetAmount, setTargetAmount] = useState(exchange.targetAmount.toString());
    const [originCurrency] = useState(exchange.originCurrency);
    const [targetWallet, setTargetWallet] = useState<WalletType | 'both'>(exchange.targetWallet);
    const [location, setLocation] = useState(exchange.location || '');
    const [date, setDate] = useState(new Date(exchange.date).toISOString().split('T')[0]);

    const rate = (parseFloat(originAmount) && parseFloat(targetAmount))
        ? (parseFloat(originAmount) / parseFloat(targetAmount)).toFixed(2)
        : '---';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateExchange({
                ...exchange,
                originAmount: parseFloat(originAmount),
                targetAmount: parseFloat(targetAmount),
                originCurrency,
                targetWallet,
                rate: parseFloat(rate),
                location,
                date: new Date(date)
            });
            showToast('Câmbio atualizado com sucesso!', 'success');
            onClose();
        } catch (error) {
            console.error(error);
            showToast('Erro ao atualizar câmbio.', 'error');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end md:items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl p-6 relative animate-in slide-in-from-bottom-10 fade-in duration-200">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                    <X size={24} />
                </button>

                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <DollarSign className="text-green-600" />
                    Editar Câmbio
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Data</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border-gray-200 focus:ring-green-500 focus:border-green-500 font-medium"
                            required
                        />
                    </div>

                    {/* Origin Amount (BRL) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Valor Pago ({originCurrency})</label>
                        <input
                            type="number"
                            step="0.01"
                            value={originAmount}
                            onChange={(e) => setOriginAmount(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border-gray-200 focus:ring-green-500 focus:border-green-500 font-bold text-lg"
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
                            required
                        />
                    </div>

                    <div className="text-center text-sm text-gray-500">
                        Cotação: <span className="font-bold text-gray-800">R$ {rate}</span>
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
                                        "py-2 px-1 rounded-lg border text-xs font-bold transition-all",
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
                                    "py-2 px-1 rounded-lg border text-xs font-bold transition-all",
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
                        className="w-full py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                        <Save size={20} />
                        Salvar Alterações
                    </button>

                </form>
            </div>
        </div>
    );
}
