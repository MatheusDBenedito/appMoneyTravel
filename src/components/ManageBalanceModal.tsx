import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { X, Check, Plus, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import type { WalletType } from '../types';

interface ManageBalanceModalProps {
    onClose: () => void;
}

type Operation = 'add' | 'remove';
type Target = WalletType | 'both';

const ManageBalanceModal: React.FC<ManageBalanceModalProps> = ({ onClose }) => {
    const { wallets, updateBudget } = useExpenses();

    const [amount, setAmount] = useState('');
    const [operation, setOperation] = useState<Operation>('add');
    const [target, setTarget] = useState<Target>('both');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const val = parseFloat(amount);
        if (!val || val <= 0) return;

        // Helper to update a specific wallet
        const applyUpdate = (id: WalletType, delta: number) => {
            const wallet = wallets.find(w => w.id === id);
            if (wallet) {
                // If operation is remove, subtract. If add, add.
                const multiplier = operation === 'add' ? 1 : -1;
                const newBudget = wallet.budget + (delta * multiplier);
                updateBudget(id, newBudget);
            }
        };

        if (target === 'both') {
            // Split 50/50
            const half = val / 2;
            applyUpdate('me', half);
            applyUpdate('wife', half);
        } else {
            applyUpdate(target, val);
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300 dark:bg-gray-900">

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Manage Balance</h2>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Operation Toggle */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl dark:bg-gray-800">
                        <button
                            type="button"
                            onClick={() => setOperation('add')}
                            className={clsx(
                                "py-2 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all",
                                operation === 'add'
                                    ? "bg-white text-green-600 shadow-sm dark:bg-gray-700 dark:text-green-400"
                                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            )}
                        >
                            <Plus size={16} />
                            Add Money
                        </button>
                        <button
                            type="button"
                            onClick={() => setOperation('remove')}
                            className={clsx(
                                "py-2 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all",
                                operation === 'remove'
                                    ? "bg-white text-red-600 shadow-sm dark:bg-gray-700 dark:text-red-400"
                                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            )}
                        >
                            <Minus size={16} />
                            Remove
                        </button>
                    </div>

                    {/* Amount Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1 text-center dark:text-gray-400">
                            Amount to {operation}
                        </label>
                        <div className="relative">
                            <span className={clsx(
                                "absolute left-8 top-1/2 -translate-y-1/2 font-bold text-2xl",
                                operation === 'add' ? "text-green-500" : "text-red-500"
                            )}>
                                {operation === 'add' ? '+' : '-'} $
                            </span>
                            <input
                                type="number"
                                step="0.01"
                                inputMode="decimal"
                                value={amount}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val.length <= 7) {
                                        setAmount(val);
                                    }
                                }}
                                className={clsx(
                                    "w-full pl-16 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-4xl font-bold focus:outline-none focus:ring-2 text-center dark:bg-gray-800 dark:border-gray-700",
                                    operation === 'add' ? "focus:ring-green-500 text-green-600 dark:text-green-400" : "focus:ring-red-500 text-red-600 dark:text-red-400"
                                )}
                                placeholder="0.00"
                                autoFocus
                                required
                            />
                        </div>
                    </div>

                    {/* Target Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2 dark:text-gray-400">Apply to</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setTarget('me')}
                                className={clsx(
                                    "py-3 px-2 rounded-xl border text-sm font-medium transition-all",
                                    target === 'me'
                                        ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400"
                                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                                )}
                            >
                                Eu
                            </button>
                            <button
                                type="button"
                                onClick={() => setTarget('wife')}
                                className={clsx(
                                    "py-3 px-2 rounded-xl border text-sm font-medium transition-all",
                                    target === 'wife'
                                        ? "border-pink-500 bg-pink-50 text-pink-700 ring-1 ring-pink-500 dark:bg-pink-900/20 dark:border-pink-500 dark:text-pink-400"
                                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                                )}
                            >
                                Esposa
                            </button>
                            <button
                                type="button"
                                onClick={() => setTarget('both')}
                                className={clsx(
                                    "py-3 px-2 rounded-xl border text-sm font-medium transition-all",
                                    target === 'both'
                                        ? "border-purple-500 bg-purple-50 text-purple-700 ring-1 ring-purple-500 dark:bg-purple-900/20 dark:border-purple-500 dark:text-purple-400"
                                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                                )}
                            >
                                Both (50/50)
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={clsx(
                            "w-full py-4 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2",
                            operation === 'add'
                                ? "bg-green-600 shadow-green-200 hover:bg-green-700"
                                : "bg-red-600 shadow-red-200 hover:bg-red-700"
                        )}
                    >
                        <Check size={20} />
                        Confirm {operation === 'add' ? 'Depósito' : 'Retirada'}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default ManageBalanceModal;
