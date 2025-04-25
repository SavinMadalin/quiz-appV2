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
        // Reduced padding p-1.5, text-xs
        <div className="custom-tooltip bg-gray-800 dark:bg-gray-700 p-1.5 rounded-md shadow-md text-white text-xs">
          <p className="label">{`${label}`}</p>
          <p className="intro">{`Score: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    // Reduced padding p-0.5
    <div className="mt-2 p-0.5 rounded-lg shadow-md border border-gray-300 dark:border-gray-700">
      {chartData.length === 0 ? (
        // Reduced text size text-sm
        <p className="text-center text-sm p-4">No data for this category</p>
      ) : (
        <>
          {/* Apply height classes here: default h-[200px], lg:h-[300px] */}
          <div className="w-full flex justify-center h-[200px] lg:h-[300px]">
            {/* ResponsiveContainer will fill the parent's height */}
            <ResponsiveContainer width="95%" height="100%">
              <LineChart
                data={chartData}
                // Adjusted margins slightly
                margin={{ top: 5, right: 5, left: -30, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                {/* Reduced tick font size */}
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip content={<CustomTooltip />} />
                {/* Reduced legend font size */}
                <Legend wrapperStyle={{ fontSize: "10px" }} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#8884d8"
                  activeDot={{ r: 6 }} // Slightly smaller active dot
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
