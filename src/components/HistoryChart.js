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
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-gray-800 dark:bg-gray-700 p-2 rounded-md shadow-md text-white">
          {/* Changed background color and text color */}
          <p className="label">{`${label}`}</p>
          <p className="intro">{`Score: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

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
                {/* Use the custom tooltip */}
                <Tooltip content={<CustomTooltip />} />
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
