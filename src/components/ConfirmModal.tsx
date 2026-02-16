import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isDestructive = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 dark:bg-gray-900">
                <div className="flex items-center gap-3 mb-4 text-gray-800">
                    <div className="p-2 bg-orange-100 rounded-full text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-lg font-bold dark:text-white">{title}</h3>
                </div>

                <p className="text-gray-600 mb-8 leading-relaxed dark:text-gray-300">
                    {message}
                </p>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-400 dark:hover:bg-gray-800"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-4 py-2 text-white font-bold rounded-lg shadow-md transition-transform active:scale-95 ${isDestructive
                            ? 'bg-red-500 hover:bg-red-600 shadow-red-200 dark:shadow-none'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 dark:shadow-none'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
