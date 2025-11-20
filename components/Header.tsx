import React from 'react';
import { Building2, AlertTriangle } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">AusProperty</h1>
              <p className="text-xs text-slate-500 font-medium">Yield Analyzer</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
             <AlertTriangle className="w-3 h-3" />
             <span>Live scraping unavailable (CORS). Using AI Market Estimates.</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;