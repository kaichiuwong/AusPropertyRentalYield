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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Market Data Details</h3>
        <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-1 rounded">Top {data.length} Suburbs</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold">Suburb</th>
              <th className="px-6 py-3 font-semibold text-right">Median Price</th>
              <th className="px-6 py-3 font-semibold text-right">Weekly Rent</th>
              <th className="px-6 py-3 font-semibold text-right">Yield (Gross)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={row.suburbName} className="bg-white hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                    {index + 1}
                  </span>
                  {row.suburbName}
                </td>
                <td className="px-6 py-4 text-right text-slate-600 whitespace-nowrap">
                  {formatCurrency(row.medianSoldPrice)}
                </td>
                <td className="px-6 py-4 text-right text-slate-600 whitespace-nowrap">
                  {formatCurrency(row.medianWeeklyRent)}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    row.rentalYield > 4.5 ? 'bg-green-100 text-green-800' : 
                    row.rentalYield > 3.5 ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-800'
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