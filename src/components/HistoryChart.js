// src/components/HistoryChart.js
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const HistoryChart = ({ chartData, selectedCategory }) => {
  return (
    <div className="mt-2 p-1 rounded-lg shadow-md border border-gray-300 dark:border-gray-700">
      {chartData.length === 0 ? (
        <p>No data for this category</p>
      ) : (
        <>
          <div className="w-full flex justify-center">
            <ResponsiveContainer width="95%" height={250}>
              {/* Changed width to 100% and added ResponsiveContainer */}
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -35, bottom: -5 }} // Adjusted left margin
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default HistoryChart;
