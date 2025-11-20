import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { SuburbData } from '../types';

interface YieldChartProps {
  data: SuburbData[];
  isDarkMode: boolean;
}

const YieldChart: React.FC<YieldChartProps> = ({ data, isDarkMode }) => {
  return (
    <div className="w-full h-[400px] bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Rental Yield by Suburb (%)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke={isDarkMode ? '#334155' : '#e2e8f0'} 
          />
          <XAxis 
            dataKey="suburbName" 
            angle={-45} 
            textAnchor="end" 
            height={60} 
            tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }}
            interval={0}
          />
          <YAxis 
            tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }}
            unit="%"
          />
          <Tooltip 
            cursor={{ fill: isDarkMode ? '#1e293b' : '#f1f5f9' }}
            contentStyle={{ 
              backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
              borderColor: isDarkMode ? '#334155' : '#e2e8f0',
              color: isDarkMode ? '#f1f5f9' : '#1e293b',
              borderRadius: '8px', 
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
            }}
            itemStyle={{ color: isDarkMode ? '#e2e8f0' : '#334155' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="rentalYield" name="Rental Yield (%)" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`hsl(${210 + (index * 5)}, 70%, ${isDarkMode ? '60%' : '50%'})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default YieldChart;