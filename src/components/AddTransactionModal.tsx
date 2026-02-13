import React, { useState, useEffect } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { X, Check } from 'lucide-react';
import type { Category, WalletType } from '../types';
import { clsx } from 'clsx';

interface AddTransactionModalProps {
    onClose: () => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ onClose }) => {
    const { addTransaction, wallets, categories, autoSharedCategories } = useExpenses();

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<Category>('General');
    const [payer, setPayer] = useState<WalletType>(wallets[0]?.id || '');
    const [isShared, setIsShared] = useState(false);

    // Auto-toggle shared based on category
    useEffect(() => {
        if (autoSharedCategories.includes(category)) {
            setIsShared(true);
        } else {
            setIsShared(false);
        }
    }, [category, autoSharedCategories]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !description) return;

        addTransaction({
            amount: parseFloat(amount),
            description,
            category,
            payer,
            isShared,
            date: new Date(),
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">New Expense</h2>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Amount Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                            <input
                                type="number"
                                step="0.01"
                                inputMode="decimal"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                                autoFocus
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="What is it for?"
                            required
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
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
                            <span className="text-sm font-medium text-gray-600">Paid by</span>
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
                                <span className="text-sm font-medium text-gray-600">Split Cost (50/50)</span>
                                {autoSharedCategories.includes(category) && (
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

                    <button
                        type="submit"
                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                        <Check size={20} />
                        Save Transaction
                    </button>

                </form>
            </div>
        </div>
    );
};

export default AddTransactionModal;
