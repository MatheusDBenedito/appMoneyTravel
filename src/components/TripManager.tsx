import { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { Pencil, Trash2, Check, X, Map } from 'lucide-react';

export default function TripManager() {
    const { trips, updateTrip, deleteTrip, currentTripId } = useExpenses();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const startEditing = (id: string, name: string) => {
        setEditingId(id);
        setEditName(name);
    };

    const saveEdit = async (id: string) => {
        if (editName.trim()) {
            await updateTrip(id, editName.trim());
        }
        setEditingId(null);
    };

    const handleDelete = async (id: string, name: string) => {
        if (id === currentTripId) {
            alert('Não é possível remover a viagem ativa.');
            return;
        }
        if (confirm(`Tem certeza que deseja remover a viagem "${name}"? Todas as carteiras, transações e dados associados serão perdidos.`)) {
            await deleteTrip(id);
        }
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 dark:text-gray-100">
                <Map className="text-blue-600" />
                Gerenciar Viagens
            </h2>

            <div className="space-y-3">
                {trips.map(trip => (
                    <div key={trip.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                        {editingId === trip.id ? (
                            <div className="flex items-center gap-2 flex-1 mr-2 bg-white p-2 rounded-lg border border-blue-200 dark:bg-gray-700 dark:border-blue-900/50">
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="flex-1 px-2 py-1 focus:outline-none text-sm font-bold dark:bg-gray-700 dark:text-white"
                                    autoFocus
                                />
                                <button onClick={() => saveEdit(trip.id)} className="text-green-600 hover:bg-green-50 p-2 rounded-full dark:text-green-400 dark:hover:bg-green-900/20">
                                    <Check size={18} />
                                </button>
                                <button onClick={() => setEditingId(null)} className="text-gray-400 hover:bg-gray-50 p-2 rounded-full dark:hover:bg-gray-600">
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-gray-800 dark:text-gray-200">{trip.name}</span>
                                {trip.id === currentTripId && (
                                    <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium dark:bg-blue-900/30 dark:text-blue-400">
                                        Ativa
                                    </span>
                                )}
                            </div>
                        )}

                        {!editingId && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => startEditing(trip.id, trip.name)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:hover:bg-blue-900/20"
                                >
                                    <Pencil size={18} />
                                </button>
                                {trip.id !== currentTripId && (
                                    <button
                                        onClick={() => handleDelete(trip.id, trip.name)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/20"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {trips.length === 0 && (
                    <p className="text-gray-500 text-center py-4 dark:text-gray-400">Nenhuma viagem encontrada.</p>
                )}
            </div>
        </div>
    );
}
