import React from 'react';
import { SuburbData } from '../types';
import { ArrowUpRight } from 'lucide-react';

interface YieldTableProps {
  data: SuburbData[];
}

const YieldTable: React.FC<YieldTableProps> = ({ data }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(val);
  };

  if (data.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden h-full transition-colors duration-200">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Market Data Details</h3>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">Top {data.length} Suburbs</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3 font-semibold">Suburb</th>
              <th className="px-6 py-3 font-semibold text-right">Median Price</th>
              <th className="px-6 py-3 font-semibold text-right">Weekly Rent</th>
              <th className="px-6 py-3 font-semibold text-right">Yield (Gross)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.map((row, index) => (
              <tr key={row.suburbName} className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                    {index + 1}
                  </span>
                  {row.suburbName}
                </td>
                <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400 whitespace-nowrap">
                  {formatCurrency(row.medianSoldPrice)}
                </td>
                <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400 whitespace-nowrap">
                  {formatCurrency(row.medianWeeklyRent)}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    row.rentalYield > 4.5 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                      : row.rentalYield > 3.5 
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300'
                  }`}>
                    {row.rentalYield}%
                    <ArrowUpRight className="w-3 h-3 ml-1" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default YieldTable;