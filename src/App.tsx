import React, { Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { OnboardingModal } from './components/OnboardingModal';
import { InteractiveTutorial } from './components/InteractiveTutorial';
import { Dashboard } from './pages/Dashboard';
import { Timer } from 'lucide-react';

const StudyPlanner = lazy(() => import('./pages/StudyPlanner').then(m => ({ default: m.StudyPlanner })));
const ExamCountdown = lazy(() => import('./pages/ExamCountdown').then(m => ({ default: m.ExamCountdown })));
const FocusMode = lazy(() => import('./pages/FocusMode').then(m => ({ default: m.FocusMode })));
const SessionHistory = lazy(() => import('./pages/SessionHistory').then(m => ({ default: m.SessionHistory })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));

const PageLoadingFallback: React.FC = () => (
  <div className="flex-1 flex items-center justify-center p-8 bg-app-bg text-app-muted">
    <div className="flex items-center space-x-3 text-xs font-mono tracking-wider">
      <div className="w-4 h-4 border-2 border-app-accent border-t-transparent rounded-full animate-spin" />
      <span>LOADING VIEW...</span>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { activeTab, loading, showOnboarding, setShowOnboarding } = useApp();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-app-bg text-app-ink flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-app-accent/15 border border-app-accent/40 flex items-center justify-center shadow-panel animate-pulse">
          <Timer className="w-6 h-6 text-app-accent" />
        </div>
        <div className="text-sm font-mono tracking-widest text-app-accent">
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
      case 'about':
        return <AboutPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-app-bg text-app-ink overflow-hidden font-sans select-none">
      {/* Top draggable titlebar */}
      <Header />

      {/* Main layout with sidebar and page content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden bg-app-bg">
          <Suspense fallback={<PageLoadingFallback />}>
            {renderActivePage()}
          </Suspense>
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette />

      {/* First-Launch Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      {/* Interactive Application Tour */}
      <InteractiveTutorial />
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
