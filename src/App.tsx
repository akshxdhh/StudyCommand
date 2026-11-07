import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { StudyPlanner } from './pages/StudyPlanner';
import { ExamCountdown } from './pages/ExamCountdown';
import { FocusMode } from './pages/FocusMode';
import { SessionHistory } from './pages/SessionHistory';
import { Settings } from './pages/Settings';
import { Timer } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, loading } = useApp();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#080a0f] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400 flex items-center justify-center shadow-glow-cyan animate-pulse">
          <Timer className="w-6 h-6 text-cyan-400" />
        </div>
        <div className="text-sm font-mono tracking-widest text-cyan-300">
          INITIALIZING STUDY COMMAND...
        </div>
      </div>
    );
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'planner':
        return <StudyPlanner />;
      case 'countdown':
        return <ExamCountdown />;
      case 'focus':
        return <FocusMode />;
      case 'history':
        return <SessionHistory />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#080a0f] text-slate-100 overflow-hidden font-sans">
      {/* Top draggable titlebar */}
      <Header />

      {/* Main layout with sidebar and page content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden bg-[#080a0f]">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
