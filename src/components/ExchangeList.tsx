import { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useToast } from '../hooks/useToast';
import type { ExchangeTransaction } from '../types';
import { Trash2, Pencil, Calendar, MapPin } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import EditExchangeModal from './EditExchangeModal';

export default function ExchangeList() {
    const { exchanges, removeExchange, wallets } = useExpenses();
    const { showToast } = useToast();

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [editExchange, setEditExchange] = useState<ExchangeTransaction | null>(null);

    const handleDelete = async () => {
        if (deleteId) {
            await removeExchange(deleteId);
            showToast('Câmbio removido com sucesso.', 'success');
            setDeleteId(null);
        }
    };

    if (exchanges.length === 0) {
        return null;
    }

    return (
        <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 px-2">Histórico de Câmbio</h3>
            <div className="space-y-4">
                {exchanges.map(exchange => (
                    <div key={exchange.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">

                        {/* Header: Date & Actions */}
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <Calendar size={14} />
                                <span>{new Date(exchange.date).toLocaleDateString()}</span>
                                {exchange.location && (
                                    <>
                                        <span className="text-gray-300">•</span>
                                        <div className="flex items-center gap-1 text-gray-600 font-medium">
                                            <MapPin size={12} />
                                            {exchange.location}
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setEditExchange(exchange)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <Pencil size={18} />
                                </button>
                                <button
                                    onClick={() => setDeleteId(exchange.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Content: Amounts */}
                        <div className="flex justify-between items-center px-1">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Pago</p>
                                <p className="font-bold text-gray-800 text-lg">
                                    R$ {exchange.originAmount.toFixed(2)}
                                </p>
                            </div>

                            <div className="text-center">
                                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
                                    Taxa R$ {exchange.rate.toFixed(2)}
                                </span>
                            </div>

                            <div className="text-right">
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                                    Recebido ({exchange.targetWallet === 'both'
                                        ? 'Todos'
                                        : wallets.find(w => w.id === exchange.targetWallet)?.name || 'Desconhecido'})
                                </p>
                                <p className="font-bold text-green-600 text-lg">
                                    $ {exchange.targetAmount.toFixed(2)}
                                </p>
                            </div>
                        </div>

                    </div>
                ))}
            </div>

            {/* Modals */}
            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Remover Câmbio"
                message="Tem certeza que deseja remover este registro? O saldo será recalculado."
                confirmText="Remover"
                isDestructive
            />

            {editExchange && (
                <EditExchangeModal
                    exchange={editExchange}
                    onClose={() => setEditExchange(null)}
                />
            )}
        </div>
    );
}
