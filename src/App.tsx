import { useState } from 'react';
import { ExpenseProvider, useExpenses } from './context/ExpenseContext';
import { Plus, ArrowRightLeft, Settings, PieChart, Wallet, Home, DollarSign } from 'lucide-react';
import Sidebar from './components/Sidebar';
// Components
import TransactionList from './components/TransactionList';
import AddTransactionModal from './components/AddTransactionModal';
import AddReturnModal from './components/AddReturnModal';
import ExchangeForm from './components/ExchangeForm';
import PeopleManager from './components/PeopleManager';
import CategoryManager from './components/CategoryManager';
import PaymentMethodManager from './components/PaymentMethodManager';
import TripManager from './components/TripManager';
import WalletCard from './components/WalletCard';
import Reports from './components/Reports';
import { ToastProvider } from './context/ToastContext';
import type { Transaction } from './types'; // Import Transaction type

function AppContent() {
  const { wallets, getWalletBalance } = useExpenses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'exchange' | 'settings' | 'history' | 'reports'>('dashboard');

  const totalBalance = wallets.reduce((acc, w) => acc + getWalletBalance(w.id), 0);

  const handleOpenModal = (transaction?: Transaction) => {
    if (transaction) {
      if (transaction.type === 'income') {
        setSelectedTransaction(transaction);
        setIsReturnModalOpen(true);
      } else {
        setSelectedTransaction(transaction);
        setIsModalOpen(true);
      }
    } else {
      setSelectedTransaction(undefined);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setSelectedTransaction(undefined);
    setIsModalOpen(false);
    setIsReturnModalOpen(false);
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex">

        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          className="hidden md:flex w-64 flex-shrink-0 z-50 shadow-sm"
          onOpenReturn={() => setIsReturnModalOpen(true)}
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
                  activeTab === 'reports' ? 'Relatórios' :
                    activeTab === 'exchange' ? 'Câmbio' :
                      activeTab === 'history' ? 'Histórico' : 'Configurações'}
              </h1>
              <p className="text-gray-500 text-sm">Gerencie seus gastos de viagem</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsReturnModalOpen(true)}
                className="bg-white text-green-600 border border-green-200 px-4 py-3 rounded-xl hover:bg-green-50 hover:border-green-300 transition-all flex items-center gap-2 font-medium"
              >
                <ArrowRightLeft size={20} />
                Devolução
              </button>
              <button
                onClick={() => handleOpenModal()}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all flex items-center gap-2 font-medium"
              >
                <Plus size={20} />
                Nova Despesa
              </button>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 p-4 md:p-8 pt-0 pb-24 md:pb-8 max-w-7xl mx-auto w-full">

            {/* Wallets & Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">

                {/* Desktop Balance Card */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 hidden md:flex">
                  <div>
                    <p className="text-gray-500 text-sm">Saldo Total da Viagem</p>
                    <h2 className="text-5xl font-bold text-gray-800">${totalBalance.toFixed(2)}</h2>
                  </div>
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
                    <TransactionList limit={5} onTransactionClick={handleOpenModal} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reports' && <Reports />}

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
                  <PaymentMethodManager />
                </div>
                <div className="space-y-6">
                  <CategoryManager />
                  <TripManager />
                </div>
              </section>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 min-h-[500px]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg">Histórico Completo</h3>
                </div>
                <TransactionList onTransactionClick={handleOpenModal} />
              </section>
            )}

          </main>
        </div>

        {/* Mobile Floating Action Button (FAB) Group */}
        <div className="md:hidden fixed bottom-24 right-6 flex flex-col gap-3 z-50">
          <button
            onClick={() => setIsReturnModalOpen(true)}
            className="bg-green-600 text-white p-3 rounded-full shadow-xl hover:bg-green-700 transition-transform active:scale-95 flex items-center justify-center"
            aria-label="Devolução"
          >
            <ArrowRightLeft size={24} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition-transform active:scale-95 flex items-center justify-center"
            aria-label="Nova Despesa"
          >
            <Plus size={28} />
          </button>
        </div>

        {/* Modals */}
        {isModalOpen && (
          <AddTransactionModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            initialData={selectedTransaction}
          />
        )}

        {isReturnModalOpen && (
          <AddReturnModal
            isOpen={isReturnModalOpen}
            onClose={handleCloseModal}
            initialData={selectedTransaction}
          />
        )}

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around p-4 pb-6 z-50">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <Home size={24} />
            <span className="text-xs font-medium">Início</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'reports' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <PieChart size={24} />
            <span className="text-xs font-medium">Relatórios</span>
          </button>

          <button
            onClick={() => setActiveTab('exchange')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'exchange' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <DollarSign size={24} />
            <span className="text-xs font-medium">Câmbio</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <Wallet size={24} />
            <span className="text-xs font-medium">Histórico</span>
          </button>
        </nav>

      </div>
    </ToastProvider>
  );
}

export default function App() {
  return (
    <ExpenseProvider>
      <AppContent />
    </ExpenseProvider>
  );
}
