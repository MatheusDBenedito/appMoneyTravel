import React, { useState, useEffect, useRef } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from './ConfirmModal';
import { X, Check, Trash2 } from 'lucide-react';
import type { Category, WalletType, Transaction } from '../types';
import { clsx } from 'clsx';

interface AddTransactionModalProps {
    onClose: () => void;
    initialData?: Transaction;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ onClose, initialData }) => {
    const { addTransaction, updateTransaction, removeTransaction, wallets, categories, autoSharedCategories, paymentMethods } = useExpenses();
    const { showToast } = useToast();

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<Category>('General');
    const [payer, setPayer] = useState<WalletType>(wallets[0]?.id || '');
    const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0] || '');
    const [isShared, setIsShared] = useState(false);

    // Confirm Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Refs for focus management
    const descriptionRef = useRef<HTMLInputElement>(null);

    // Initialize state with initialData if provided
    useEffect(() => {
        if (initialData) {
            setAmount(initialData.amount.toString());
            setDescription(initialData.description);
            setCategory(initialData.category);
            setPayer(initialData.payer);
            setIsShared(initialData.isShared);
            if (initialData.paymentMethod) setPaymentMethod(initialData.paymentMethod);
        }
    }, [initialData]);

    // Auto-select first wallet if payer is empty (e.g. on load)
    useEffect(() => {
        if (!payer && wallets.length > 0 && !initialData) {
            setPayer(wallets[0].id);
        }
    }, [wallets, payer, initialData]);

    // Auto-toggle shared based on category (only for new transactions)
    useEffect(() => {
        if (!initialData) {
            if (autoSharedCategories.includes(category)) {
                setIsShared(true);
            } else {
                setIsShared(false);
            }
        }
    }, [category, autoSharedCategories, initialData]);

    const handleSubmit = async () => {
        if (!amount || !description) return;

        try {
            const transactionData = {
                amount: parseFloat(amount),
                description,
                category,
                payer,
                isShared,
                paymentMethod,
                date: initialData ? initialData.date : new Date(),
            };

            if (initialData) {
                const { error } = await updateTransaction({ ...transactionData, id: initialData.id });
                if (error) throw error;
                showToast('Despesa atualizada com sucesso!', 'success');
            } else {
                const { error } = await addTransaction(transactionData);
                if (error) throw error;
                showToast('Despesa adicionada com sucesso!', 'success');
            }

            onClose();
        } catch (error) {
            console.error(error);
            showToast('Erro ao salvar despesa.', 'error');
        }
    };

    const handleDelete = async () => {
        if (initialData) {
            try {
                await removeTransaction(initialData.id);
                showToast('Despesa removida com sucesso.', 'success');
                onClose();
            } catch (error) {
                console.error(error);
                showToast('Erro ao remover despesa.', 'error');
            }
        }
    };

    const handleAmountKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submit
            descriptionRef.current?.focus(); // Move focus to description
        }
    };

    const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent accidental submit
            // Start submission manually if desired, or just blur to close keyboard
            (e.target as HTMLInputElement).blur();
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {initialData ? 'Editar Despesa' : 'Nova Despesa'}
                        </h2>
                        <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-5">

                        {/* Amount Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Valor</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    inputMode="decimal"
                                    value={amount}
                                    onKeyDown={handleAmountKeyDown}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0,00"
                                    autoFocus={!initialData} // Only autofocus on new
                                    required
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Descrição</label>
                            <input
                                ref={descriptionRef}
                                type="text"
                                value={description}
                                onKeyDown={handleDescriptionKeyDown}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Qual a despesa?"
                                required
                            />
                        </div>


                        {/* Payment Method */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Forma de Pagamento</label>
                            <div className="flex flex-wrap gap-2 bg-gray-50 p-1 rounded-xl">
                                {paymentMethods.map(method => (
                                    <button
                                        key={method}
                                        type="button"
                                        onClick={() => setPaymentMethod(method)}
                                        className={clsx(
                                            "flex-1 min-w-[80px] py-2 rounded-lg text-xs font-bold transition-all",
                                            paymentMethod === method
                                                ? "bg-white text-blue-600 shadow-sm"
                                                : "text-gray-400 hover:text-gray-600"
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

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Categoria</label>
                            <div className="grid grid-cols-3 gap-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCategory(cat)}
                                        className={clsx(
                                            "py-2 px-1 rounded-lg text-xs font-medium transition-colors border",
                                            category === cat
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                        )}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Payer & Shared Toggle */}
                        <div className="p-4 bg-gray-50 rounded-xl space-y-4">

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Pago por</span>
                                <div className="flex bg-white rounded-lg p-1 border shadow-sm">
                                    {wallets.map(w => (
                                        <button
                                            key={w.id}
                                            type="button"
                                            onClick={() => setPayer(w.id)}
                                            className={clsx(
                                                "px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap",
                                                payer === w.id ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
                                            )}
                                        >
                                            {w.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-600">Dividir Custo (50/50)</span>
                                    {autoSharedCategories.includes(category) && !initialData && (
                                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 rounded">Auto</span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsShared(!isShared)}
                                    className={clsx(
                                        "w-12 h-7 rounded-full transition-colors relative",
                                        isShared ? "bg-blue-600" : "bg-gray-300"
                                    )}
                                >
                                    <div className={clsx(
                                        "absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform",
                                        isShared ? "translate-x-5" : "translate-x-0"
                                    )} />
                                </button>
                            </div>

                        </div>

                        <div className="flex gap-3">
                            {initialData && (
                                <button
                                    type="button"
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    className="p-4 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 active:scale-95 transition-transform flex items-center justify-center"
                                    title="Excluir Transação"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
                            >
                                <Check size={20} />
                                {initialData ? 'Salvar Alterações' : 'Salvar Transação'}
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
                title="Excluir Despesa"
                message="Tem certeza que deseja excluir esta despesa? O saldo das carteiras será recalculado."
                confirmText="Excluir"
                isDestructive
            />
        </>
    );
};

export default AddTransactionModal;
