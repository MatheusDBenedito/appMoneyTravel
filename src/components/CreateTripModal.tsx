import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { X, Check, Map } from 'lucide-react';
import { clsx } from 'clsx';

interface CreateTripModalProps {
    onClose: () => void;
}

const CreateTripModal: React.FC<CreateTripModalProps> = ({ onClose }) => {
    const { createTrip, switchTrip } = useExpenses();
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            const id = await createTrip(name);
            if (id) {
                switchTrip(id);
                onClose();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Map className="text-blue-600" />
                        Nova Viagem
                    </h2>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Nome da Viagem</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ex: Férias 2024"
                            autoFocus
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={clsx(
                            "w-full py-4 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2",
                            isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 shadow-blue-200 hover:bg-blue-700"
                        )}
                    >
                        {isLoading ? 'Criando...' : (
                            <>
                                <Check size={20} />
                                Criar Viagem
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateTripModal;
