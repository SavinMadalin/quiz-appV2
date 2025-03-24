// src/components/HistoryChart.js
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const HistoryChart = ({ chartData, selectedCategory }) => {
  return (
    <div className="mt-2 p-1 rounded-lg shadow-md border border-gray-300 dark:border-gray-700">
      {chartData.length === 0 ? (
        <p>No data for this category</p>
      ) : (
        <>
          <h3 className="text-sm font-semibold mb-1">{`Evolution of Results in ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}</h3>
          <LineChart width={window.innerWidth < 768 ? 300 : 600} height={250} data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </>
      )}
    </div>
  );
};

export default HistoryChart;
