import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from './ConfirmModal';
import { Trash2, Plus, CreditCard } from 'lucide-react';

export default function PaymentMethodManager() {
    const { paymentMethods, addPaymentMethod, removePaymentMethod } = useExpenses();
    const { showToast } = useToast();

    const [newMethod, setNewMethod] = useState('');
    const [deleteMethodName, setDeleteMethodName] = useState<string | null>(null);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMethod.trim()) return;

        await addPaymentMethod(newMethod.trim());
        setNewMethod('');
        showToast('Forma de Pagamento adicionada com sucesso!', 'success');
    };

    const handleDelete = async () => {
        if (deleteMethodName) {
            await removePaymentMethod(deleteMethodName);
            showToast('Forma de Pagamento removida com sucesso.', 'success');
            setDeleteMethodName(null);
        }
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <CreditCard className="text-purple-500" />
                Formas de Pagamento
            </h2>

            {/* List */}
            <div className="space-y-3 mb-8">
                {paymentMethods.length === 0 && (
                    <p className="text-gray-400 text-center italic py-4">Nenhuma forma de pagamento cadastrada.</p>
                )}
                {paymentMethods.map(method => (
                    <div key={method} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="font-bold text-gray-800">{method}</span>
                        <button
                            onClick={() => setDeleteMethodName(method)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remover Forma de Pagamento"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add Form */}
            <form onSubmit={handleAdd} className="mt-6 pt-6 border-t border-gray-100 relative">
                <label className="block text-sm font-medium text-gray-500 mb-2">Adicionar Nova</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMethod}
                        onChange={(e) => setNewMethod(e.target.value)}
                        className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Nome (ex: Nubank, Voucher)"
                        required
                    />
                    <button
                        type="submit"
                        className="px-4 py-3 bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-200 hover:bg-purple-700 active:scale-95 transition-all"
                    >
                        <Plus size={24} />
                    </button>
                </div>
            </form>

            {/* Confirm Delete */}
            <ConfirmModal
                isOpen={!!deleteMethodName}
                onClose={() => setDeleteMethodName(null)}
                onConfirm={handleDelete}
                title="Remover Forma de Pagamento"
                message={`Tem certeza que deseja remover "${deleteMethodName}"?`}
                confirmText="Remover"
                isDestructive
            />
        </div>
    );
}
