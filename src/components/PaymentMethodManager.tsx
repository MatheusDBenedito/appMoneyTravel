import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useToast } from '../hooks/useToast';
import ConfirmModal from './ConfirmModal';
import { Trash2, Plus, CreditCard, Pencil, Check, X } from 'lucide-react';

export default function PaymentMethodManager() {
    const { paymentMethods, addPaymentMethod, removePaymentMethod, renamePaymentMethod } = useExpenses();
    const { showToast } = useToast();

    const [newMethod, setNewMethod] = useState('');
    const [editingMethod, setEditingMethod] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [deleteMethodName, setDeleteMethodName] = useState<string | null>(null);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMethod.trim()) return;

        await addPaymentMethod(newMethod.trim());
        setNewMethod('');
        showToast('Forma de Pagamento adicionada com sucesso!', 'success');
    };

    const startEditing = (currentName: string) => {
        setEditingMethod(currentName);
        setEditName(currentName);
    };

    const saveEdit = async (oldName: string) => {
        if (editName.trim() && editName.trim() !== oldName) {
            await renamePaymentMethod(oldName, editName.trim());
            showToast('Forma de Pagamento renomeada com sucesso!', 'success');
        }
        setEditingMethod(null);
        setEditName('');
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
                {paymentMethods.map(method => {
                    const isEditing = editingMethod === method;

                    return (
                        <div key={method} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                            {isEditing ? (
                                <div className="flex items-center gap-2 flex-1 mr-2">
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full px-2 py-1 bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(method)}
                                    />
                                    <button onClick={() => saveEdit(method)} className="text-green-600 hover:bg-green-50 p-1 rounded">
                                        <Check size={18} />
                                    </button>
                                    <button onClick={() => setEditingMethod(null)} className="text-gray-400 hover:bg-gray-50 p-1 rounded">
                                        <X size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-800">{method}</span>
                                    <button
                                        onClick={() => startEditing(method)}
                                        className="text-gray-300 hover:text-purple-600 transition-colors"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                </div>
                            )}

                            {!isEditing && (
                                <button
                                    onClick={() => setDeleteMethodName(method)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Remover Forma de Pagamento"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Add Form */}
            <form onSubmit={handleAdd} className="mt-6 pt-6 border-t border-gray-100 relative">
                <label className="block text-sm font-medium text-gray-500 mb-2">Adicionar Nova</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMethod}
                        onChange={(e) => setNewMethod(e.target.value)}
                        className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500 "
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
