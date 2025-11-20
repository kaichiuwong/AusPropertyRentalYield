import React from 'react';
import { Building2, AlertTriangle, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleTheme }) => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 dark:bg-blue-500 rounded-lg shadow-sm">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">AusProperty</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Yield Analyzer</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800/50">
                <AlertTriangle className="w-3 h-3" />
                <span>AI Estimates (CORS restricted)</span>
             </div>

             <button
               onClick={toggleTheme}
               className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
               aria-label="Toggle Dark Mode"
             >
               {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;