import { useExpenses } from '../context/ExpenseContext';
// import { useToast } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Home, DollarSign, Settings, Wallet, PieChart, Map, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import CreateTripModal from './CreateTripModal';


interface SidebarProps {
    activeTab: 'dashboard' | 'exchange' | 'settings' | 'history' | 'reports' | 'profile';
    setActiveTab: (tab: 'dashboard' | 'exchange' | 'settings' | 'history' | 'reports' | 'profile') => void;
    className?: string;

}

export default function Sidebar({ activeTab, setActiveTab, className = '' }: SidebarProps) {
    const { trips, currentTripId, switchTrip } = useExpenses(); // Get trip data
    const { signOut } = useAuth();
    const [isCreateTripModalOpen, setIsCreateTripModalOpen] = useState(false);

    const handleTripChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'new_trip') {
            setIsCreateTripModalOpen(true);
            // Reset selection to current trip (deferred to render or handled by controlled component)
            // But since it's controlled by currentTripId, it will snap back unless we change it.
            // We just open the modal.
        } else {
            switchTrip(val);
        }
    };



    const menuItems = [
        { id: 'dashboard', label: 'Visão Geral', icon: Home },
        { id: 'reports', label: 'Relatórios', icon: PieChart },
        { id: 'exchange', label: 'Câmbio', icon: DollarSign },
        { id: 'history', label: 'Histórico', icon: Wallet },
        { id: 'profile', label: 'Meu Perfil', icon: User },
        { id: 'settings', label: 'Configurações', icon: Settings },
    ] as const;

    const { theme, toggleTheme } = useTheme();

    return (
        <aside className={`bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col h-screen sticky top-0 ${className}`}>
            <div className="p-6 border-b border-gray-100 space-y-4">
                <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                    <span className="bg-blue-600 text-white p-1 rounded-lg">
                        <Map size={20} />
                    </span>
                    MoneyTravel
                </h1>

                {/* Trip Selector */}
                <div className="relative">
                    <select
                        value={currentTripId || ''}
                        onChange={handleTripChange}
                        className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-sm truncate dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                    >
                        {trips.map(trip => (
                            <option key={trip.id} value={trip.id}>
                                ✈️ {trip.name}
                            </option>
                        ))}
                        <option disabled>──────────</option>
                        <option value="new_trip">➕ Nova Viagem...</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                            ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm dark:bg-blue-900/20 dark:text-blue-400'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
                            }`}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </button>
                ))}


            </nav>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
                {/* Dark Mode Toggle Removed */}

                <button
                    onClick={signOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Sair da Conta</span>
                </button>
                <div className="flex items-center gap-3 px-4 text-gray-400 text-sm">
                    <span>v1.0.0</span>
                </div>
            </div>
            {isCreateTripModalOpen && (
                <CreateTripModal onClose={() => setIsCreateTripModalOpen(false)} />
            )}
        </aside>
    );
}
