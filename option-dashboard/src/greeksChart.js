import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useLocation } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const GreeksChart = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const optionSymbol = queryParams.get('option-symbol');
  const apiUrl = process.env.REACT_APP_API_URL;

  const [symbol, setSymbol] = useState('');
  const [timeFrame, setTimeFrame] = useState('1');
  const [greek, setGreek] = useState('delta');
  const [data, setData] = useState([]);

  const fetchGreeksData = async (symbol, greek, timeframe) => {
    try {
      const response = await fetch(
        `${apiUrl}/greeks-data?option_symbol=${symbol}&greek=${greek}&timeframe=${timeframe}`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const result = await response.json();
      const data = result[greek];
      console.log('Data:', data);
      setData(data);
    } catch (error) {
      console.error('Failed to fetch greeks data:', error);
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
    fetchGreeksData(symbol, greek, timeFrame);
    console.log('Submitted symbol:', symbol);
  };

  useEffect(() => {
    if (optionSymbol) {
      setSymbol(optionSymbol);
    }
  }, [optionSymbol]);

  const chartData = {
    labels: Array.from({ length: data.length }, (_, i) => `T-${i}`), // Simple timeline labels
    datasets: [
      {
        label: greek,
        data: data,
        borderColor: 'rgb(35, 141, 187)',
        fill: false,
        pointStyle: false,
      },
    ],
  };

  const chartOptions = {
    scales: {
      x: {
        grid: {
          color: 'gray', // Grid line color
          lineWidth: 0.2, // Grid line thickness
        },
      },
      y: {
        grid: {
          color: 'gray', // Grid line color
          lineWidth: 0.5, // Grid line thickness
        },
      },
    },
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-start mb-4 gap-4">
        <div>
          <label
            htmlFor="symbol"
            className="block text-sm font-medium text-white mb-2"
          >
            Option Symbol
          </label>
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
          <label
            htmlFor="greek"
            className="block text-sm font-medium text-white mb-2"
          >
            Greek Type
          </label>
          <select
            id="greek"
            value={greek}
            onChange={(e) => setGreek(e.target.value)}
            className="w-64 rounded-md bg-slate-800 text-gray-200 p-2 border border-gray-700 focus:ring-2 focus:ring-slate-500"
          >
            <option value="delta">Delta</option>
            <option value="gamma">Gamma</option>
            <option value="theta">Theta</option>
            <option value="vega">Vega</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="timeFrame"
            className="block text-sm font-medium text-white mb-2"
          >
            Time Frame
          </label>
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

export default GreeksChart;
