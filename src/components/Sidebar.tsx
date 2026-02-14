

import { Home, DollarSign, Settings, Wallet } from 'lucide-react';


interface SidebarProps {
    activeTab: 'dashboard' | 'exchange' | 'settings' | 'history';
    setActiveTab: (tab: 'dashboard' | 'exchange' | 'settings' | 'history') => void;
    className?: string;
}

export default function Sidebar({ activeTab, setActiveTab, className = '' }: SidebarProps) {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'exchange', label: 'Câmbio', icon: DollarSign },
        { id: 'history', label: 'Histórico', icon: Wallet }, // Using Wallet icon for history as a placeholder or reuse existing icon logic
        { id: 'settings', label: 'Configurações', icon: Settings },
    ] as const;

    return (
        <aside className={`bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 ${className}`}>
            <div className="p-6 border-b border-gray-100">
                <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                    <span className="bg-blue-600 text-white p-1 rounded-lg">
                        <DollarSign size={20} />
                    </span>
                    MoneyTravel
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {

                    // Since history is a sub-view of dashboard in mobile, let's treat it distinct here if we want a sidebar item for it, 
                    // OR keep it consistent with mobile logic.
                    // Let's stick to the props passed: activeTab.

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                                ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 px-4 py-3 text-gray-400 text-sm">
                    <span>v1.0.0</span>
                </div>
            </div>
        </aside>
    );
}
