import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { X, Check, Trash2, ArrowRightLeft } from 'lucide-react';
import { clsx } from 'clsx';
import type { WalletType, Transaction } from '../types';
import ConfirmModal from './ConfirmModal';
import { useToast } from '../hooks/useToast';

interface AddReturnModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Transaction | null;
}

const AddReturnModal: React.FC<AddReturnModalProps> = ({ isOpen, onClose, initialData }) => {
    const { wallets, categories, addTransaction, updateTransaction, removeTransaction } = useExpenses();
    const { showToast } = useToast();

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [receiver, setReceiver] = useState<WalletType>(wallets[0]?.id || '');
    const [category, setCategory] = useState('');
    const [isShared, setIsShared] = useState(false);
    // Helper to get local date string YYYY-MM-DD
    const getLocalDateString = (dateObj: Date) => {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [date, setDate] = useState(getLocalDateString(new Date()));

    // Confirm Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Initialize state with initialData if provided
    useEffect(() => {
        if (initialData) {
            setAmount(initialData.amount.toString());
            setDescription(initialData.description);
            setReceiver(initialData.payer); // In returns, payer field stores the receiver
            setIsShared(initialData.isShared);
            setCategory(initialData.category);
            if (initialData.date) {
                setDate(getLocalDateString(new Date(initialData.date)));
            }
        } else {
            // Default to first category available
            if (categories.length > 0) {
                // Try to find 'General' or 'Outros', otherwise first one
                const defaultCat = categories.find(c => c.name === 'Geral' || c.name === 'General' || c.name === 'Outros') || categories[0];
                setCategory(defaultCat.name);
            }
        }
    }, [initialData, categories]);

    // Auto-select first wallet if receiver is empty (e.g. on load)
    useEffect(() => {
        if (!receiver && wallets.length > 0 && !initialData) {
            setReceiver(wallets[0].id);
        }
    }, [wallets, receiver, initialData]);

    // Reset form when opening as new
    useEffect(() => {
        if (isOpen && !initialData) {
            setAmount('');
            setDescription('');
            // Try to find 'General' or 'Outros', otherwise first one
            const defaultCat = categories.find(c => c.name === 'Geral' || c.name === 'General' || c.name === 'Outros') || categories[0];
            setCategory(defaultCat?.name || '');
            setDate(getLocalDateString(new Date()));
        }
    }, [isOpen, initialData, categories]);

    const handleSubmit = async () => {
        if (!amount || !description || !category) return;

        try {
            // Construct date at noon to ensure timezone stability
            const transactionDate = new Date(`${date}T12:00:00`);

            const transactionData = {
                amount: parseFloat(amount),
                description,
                category,
                payer: receiver, // We use 'payer' field to store who received the money
                isShared,
                paymentMethod: 'Cash', // Default
                type: 'income' as const,
                date: transactionDate,
            };

            if (initialData) {
                const { error } = await updateTransaction({ ...transactionData, id: initialData.id });
                if (error) throw error;
                showToast('Devolução atualizada com sucesso!', 'success');
            } else {
                const { error } = await addTransaction(transactionData);
                if (error) throw error;
                showToast('Devolução registrada com sucesso!', 'success');

                // Reset form
                setAmount('');
                setDescription('');
            }

            onClose();
        } catch (error) {
            console.error(error);
            showToast('Erro ao salvar devolução.', 'error');
        }
    };

    const handleDelete = async () => {
        if (initialData) {
            try {
                await removeTransaction(initialData.id);
                showToast('Devolução removida com sucesso.', 'success');
                onClose();
            } catch (error) {
                console.error(error);
                showToast('Erro ao remover devolução.', 'error');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300 max-h-[90vh] overflow-y-auto dark:bg-gray-900">

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 dark:text-gray-100">
                            <ArrowRightLeft className="text-green-600" />
                            {initialData ? 'Editar Devolução' : 'Nova Devolução'}
                        </h2>
                        <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-5">

                        {/* Amount Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1 dark:text-gray-400">Valor Devolvido</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 font-bold">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    inputMode="decimal"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full pl-8 pr-4 py-3 bg-green-50 border border-green-200 rounded-xl text-3xl font-bold text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
                                    placeholder="0,00"
                                    autoFocus={!initialData}
                                    required
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1 dark:text-gray-400">Motivo</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="Ex: Troco do jantar, Reembolso"
                                required
                            />
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1 dark:text-gray-400">Data</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                required
                            />
                        </div>

                        {/* Category Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1 dark:text-gray-400">Categoria</label>
                            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                {categories.map(cat => (
                                    <button
                                        key={cat.name}
                                        type="button"
                                        onClick={() => setCategory(cat.name)}
                                        className={clsx(
                                            "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all whitespace-nowrap flex items-center gap-2",
                                            category === cat.name
                                                ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
                                                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                                        )}
                                    >
                                        <span>{cat.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Receiver & Shared Toggle */}
                        <div className="p-4 bg-gray-50 rounded-xl space-y-4 dark:bg-gray-800/50">

                            {!isShared && (
                                <div className="flex flex-col gap-2 mb-4">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Recebido por</span>
                                    <div className="flex bg-white rounded-lg p-1 border shadow-sm overflow-x-auto no-scrollbar dark:bg-gray-800 dark:border-gray-700">
                                        {wallets.map(w => (
                                            <button
                                                key={w.id}
                                                type="button"
                                                onClick={() => setReceiver(w.id)}
                                                className={clsx(
                                                    "flex-1 px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap",
                                                    receiver === w.id ? "bg-green-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                                                )}
                                            >
                                                {w.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Dividir p/ Todos</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsShared(!isShared)}
                                    className={clsx(
                                        "w-12 h-7 rounded-full transition-colors relative",
                                        isShared ? "bg-green-600" : "bg-gray-300"
                                    )}
                                >
                                    <div className={clsx(
                                        "absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform",
                                        isShared ? "translate-x-5" : "translate-x-0"
                                    )} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                {isShared
                                    ? "O valor será dividido e adicionado ao saldo de todos que participam da divisão."
                                    : "O valor será adicionado apenas ao saldo da carteira selecionada."}
                            </p>

                        </div>

                        <div className="flex gap-3">
                            {initialData && (
                                <button
                                    type="button"
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    className="p-4 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 active:scale-95 transition-transform flex items-center justify-center dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                                    title="Excluir Devolução"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="flex-1 py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
                            >
                                <Check size={20} />
                                {initialData ? 'Salvar Alterações' : 'Salvar Devolução'}
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {/* Confirmation Modal for Delete */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Excluir Devolução"
                message="Tem certeza que deseja excluir esta devolução? O saldo das carteiras será recalculado."
                confirmText="Excluir"
                isDestructive
            />
        </>
    );
};

export default AddReturnModal;
