import React, { useState, useEffect, useRef } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useToast } from '../hooks/useToast';
import ConfirmModal from './ConfirmModal';
import { X, Check, Trash2 } from 'lucide-react';
import type { Transaction, WalletType } from '../types';
import { clsx } from 'clsx';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Transaction;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, initialData }) => {
    const { addTransaction, updateTransaction, removeTransaction, wallets, categories, autoSharedCategories, paymentMethods } = useExpenses();
    const { showToast } = useToast();

    const [amount, setAmount] = useState('');
    const [tax, setTax] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<string>('');
    const [payer, setPayer] = useState<WalletType>(wallets[0]?.id || '');
    const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0] || '');
    const [isShared, setIsShared] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Confirm Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Refs for focus management
    const descriptionRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialData) {
            const taxVal = initialData.tax || 0;
            const baseAmount = initialData.amount - taxVal;

            setAmount(baseAmount.toString());
            setTax(taxVal > 0 ? taxVal.toString() : '');
            setDescription(initialData.description);
            setCategory(initialData.category);
            setPayer(initialData.payer);
            setIsShared(initialData.isShared);
            if (initialData.paymentMethod) setPaymentMethod(initialData.paymentMethod);
            if (initialData.date) {
                setDate(new Date(initialData.date).toISOString().split('T')[0]);
            }
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

    // Reset form when opening as new
    useEffect(() => {
        if (isOpen && !initialData) {
            setAmount('');
            setTax('');
            setDescription('');
            setCategory(categories[0]?.name || '');
            setDate(new Date().toISOString().split('T')[0]);
            // setPayer and setPaymentMethod can stay as defaults or current state
        }
    }, [isOpen, initialData, categories]);

    const handleSubmit = async () => {
        if (!amount || !description) return;

        try {
            const taxValue = tax ? parseFloat(tax) : 0;
            const baseAmount = parseFloat(amount);
            const totalAmount = baseAmount + taxValue;

            const transactionData = {
                amount: totalAmount,
                tax: taxValue,
                description,
                category,
                payer,
                isShared,
                paymentMethod,
                type: 'expense' as const,
                date: new Date(date),
            };

            if (initialData) {
                const { error } = await updateTransaction({ ...transactionData, id: initialData.id });
                if (error) throw error;
                showToast('Despesa atualizada com sucesso!', 'success');
            } else {
                const { error } = await addTransaction(transactionData);
                if (error) throw error;
                showToast('Despesa adicionada com sucesso!', 'success');

                // Reset form only on new transaction success
                setAmount('');
                setTax('');
                setDescription('');
                setCategory(''); // Should rely on default or keep empty? Resetting triggers re-eval.
                // Keep payer/method as is or reset? Usually keep last used or reset? 
                // User said "limpar dados", implies blanking out amount/desc.
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

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300 max-h-[90vh] overflow-y-auto">

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {initialData ? 'Editar Despesa' : 'Nova Despesa'}
                        </h2>
                        <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-5">

                        {/* Amount and Tax */}
                        <div className="flex gap-4">
                            <div className="flex-1">
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
                            <div className="w-1/3">
                                <label className="block text-sm font-medium text-gray-500 mb-1">Taxa</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        inputMode="decimal"
                                        value={tax}
                                        onChange={(e) => setTax(e.target.value)}
                                        className="w-full pl-6 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0"
                                    />
                                </div>
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
                            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                {categories.map(cat => (
                                    <button
                                        key={cat.name}
                                        type="button"
                                        onClick={() => setCategory(cat.name)}
                                        className={clsx(
                                            "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all whitespace-nowrap flex items-center gap-2",
                                            category === cat.name
                                                ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                                                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                        )}
                                    >
                                        <span>{cat.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Payer & Shared Toggle */}
                        <div className="p-4 bg-gray-50 rounded-xl space-y-4">

                            {!isShared && (
                                <div className="flex items-center justify-between mb-4">
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
                            )}

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
