import { useState } from 'react';
import { useExpenses } from './context/ExpenseContext';
import { Plus, Settings, Home, DollarSign } from 'lucide-react';
import Sidebar from './components/Sidebar';
// Components
import TransactionList from './components/TransactionList';
import AddTransactionModal from './components/AddTransactionModal';
import ExchangeForm from './components/ExchangeForm';
import PeopleManager from './components/PeopleManager';
import CategoryManager from './components/CategoryManager';
import WalletCard from './components/WalletCard';

function App() {
  const { wallets, getWalletBalance } = useExpenses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'exchange' | 'settings' | 'history'>('dashboard');

  const totalBalance = wallets.reduce((acc, w) => acc + getWalletBalance(w.id), 0);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex">

      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        className="hidden md:flex w-64 flex-shrink-0 z-50 shadow-sm"
      />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">

        {/* Mobile Header (Blue) */}
        <header className="md:hidden bg-blue-600 text-white p-6 rounded-b-3xl shadow-lg flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">MoneyTravel</h1>
            <button
              onClick={() => setActiveTab('settings')}
              className="p-2 hover:bg-blue-700 rounded-full transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>

          <div className="text-center py-4 relative">
            <p className="text-blue-100 text-sm mb-1">Saldo Total</p>
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-4xl font-bold">${totalBalance.toFixed(2)}</h2>
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex justify-between items-center p-8 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 capitalize">
              {activeTab === 'dashboard' ? 'Visão Geral' :
                activeTab === 'exchange' ? 'Câmbio' :
                  activeTab === 'history' ? 'Histórico' : 'Configurações'}
            </h1>
            <p className="text-gray-500 text-sm">Gerencie seus gastos de viagem</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all flex items-center gap-2 font-medium"
          >
            <Plus size={20} />
            Nova Despesa
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-md md:max-w-7xl mx-auto w-full space-y-6 pb-24 md:pb-8">

          {/* Wallets & Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-6">

              {/* Desktop Balance Card */}
              <div className="hidden md:block bg-gradient-to-r from-blue-600 to-blue-500 rounded-3xl p-8 text-white shadow-xl">
                <p className="text-blue-100 mb-2">Saldo Total</p>
                <h2 className="text-5xl font-bold">${totalBalance.toFixed(2)}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left Column: Wallets */}
                <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-4">
                  <h3 className="font-bold text-lg text-gray-700 px-1">Carteiras</h3>
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wallets.map(wallet => (
                      <WalletCard
                        key={wallet.id}
                        wallet={wallet}
                        balance={getWalletBalance(wallet.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* Right Column: Recent Activity (Desktop only moves here) */}
                <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-4">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="font-bold text-lg text-gray-700">Atividade Recente</h3>
                    <button
                      onClick={() => setActiveTab('history')}
                      className="text-sm text-blue-600 font-medium hover:underline"
                    >
                      Ver Tudo
                    </button>
                  </div>
                  <TransactionList limit={5} />
                </div>
              </div>
            </div>
          )}

          {/* Exchange Tab */}
          {activeTab === 'exchange' && (
            <section className="max-w-2xl mx-auto">
              <ExchangeForm />
            </section>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <section className="grid md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <PeopleManager />
              </div>
              <div className="space-y-6">
                <CategoryManager />
              </div>
            </section>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 min-h-[500px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Histórico Completo</h3>
              </div>
              <TransactionList />
            </section>
          )}

        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center p-4 pb-6 z-40 safe-area-bottom">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <Home size={24} />
          <span className="text-xs font-medium">Início</span>
        </button>

        <div className="relative -top-5">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition-transform active:scale-95"
          >
            <Plus size={28} />
          </button>
        </div>

        <button
          onClick={() => setActiveTab('exchange')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'exchange' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <DollarSign size={24} />
          <span className="text-xs font-medium">Câmbio</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <Settings size={24} />
        </button>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <AddTransactionModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}

export default App;

