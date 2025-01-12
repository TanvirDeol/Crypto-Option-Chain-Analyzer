import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const OptionVolatilityChart = () => {
  const [symbol, setSymbol] = useState("");
  const [timeFrame, setTimeFrame] = useState("1");
  const [data, setData] = useState({ historical: [], implied: [] });

  const fetchVolatilityData = async (symbol, timeframe) => {
    try {
      const response = await fetch(`http://localhost:8000/volatility-comparison?option_symbol=${symbol}&timeframe=${timeframe}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const result = await response.json();
      const historicalVolatility = result.historical_volatility.data.map(row => row[1]);
      const rdsData = result.rds_data.data.map(row => row[1]);
      const data = {
        historical: historicalVolatility,
        implied: rdsData
      };
      setData(data);
    } catch (error) {
      console.error("Failed to fetch volatility data:", error);
    }
  };

  const handleInputChange = (e) => {
    setSymbol(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    fetchVolatilityData(symbol,timeFrame)
    console.log('Submitted symbol:', symbol);
  };

  useEffect(() => {
    fetchVolatilityData(symbol, timeFrame);
  }, []);


  const maxLength = Math.max(data.historical.length, data.implied.length);
  const minLength = Math.min(data.historical.length, data.implied.length);
  const lengthDifference = maxLength - minLength;

  // Append zeros to the beginning of the smaller array
  if (data.historical.length < maxLength) {
    data.historical = Array(lengthDifference).fill(0).concat(data.historical);
  } else if (data.implied.length < maxLength) {
    data.implied = Array(lengthDifference).fill(0).concat(data.implied);
  }
  const labels = Array.from({ length: maxLength }, (_, i) => `T-${maxLength - 1 - i}`);
  const chartData = {
    labels: labels.slice(-data.historical.length),
    datasets: [
      {
        label: "Historical Volatility",
        data: data.historical,
        borderColor: "rgb(35, 141, 187)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: false,
      },
      {
        label: "Implied Volatility",
        data: data.implied,
        borderColor: "rgb(216, 50, 50)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: false,
      },
    ],
  };

  const chartOptions = {
    scales: {
      x: {
        grid: {
          color: "gray", // Grid line color
          lineWidth: 0.2,   // Grid line thickness
        },
      },
      y: {
        grid: {
          color: "gray", // Grid line color
          lineWidth: 1,   // Grid line thickness
        },
      },
    },
  };


  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-start mb-4 gap-4">
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium text-white mb-2">Option Symbol</label>
          <div>
          <input
            type="text"
            id="symbol"
            value={symbol}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="w-64 rounded-md bg-slate-800 text-gray-200 p-2 border border-gray-700 focus:ring-2 focus:ring-slate-500"
            placeholder="Enter option symbol"
          />
          <button
            onClick={handleSubmit}
            className="ml-2 p-2 bg-blue-500 text-white rounded-md"
          >
            Submit
          </button>
        </div>
        </div>

        <div>
          <label htmlFor="timeFrame" className="block text-sm font-medium text-white mb-2">Time Frame</label>
          <select
            id="timeFrame"
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value)}
            className="w-64 rounded-md bg-slate-800 text-gray-200 p-2 border border-gray-700 focus:ring-2 focus:ring-slate-500"
          >
            <option value="1">1 Day</option>
            <option value="7">7 Days</option>
            <option value="30">30 Days</option>
            <option value="60">60 Days</option>
            <option value="90">90 Days</option>
          </select>
        </div>

        
      </div>

      <div className="chart-container">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default OptionVolatilityChart;
