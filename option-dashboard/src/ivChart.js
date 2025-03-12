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

const OptionVolatilityChart = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const optionSymbol = queryParams.get('option-symbol');
  const apiUrl = process.env.REACT_APP_API_URL;

  const [symbol, setSymbol] = useState('');
  const [timeFrame, setTimeFrame] = useState('1');
  const [data, setData] = useState({ historical: [], implied: [] });
  const [timestamps, setTimestamps] = useState([]);
  const [displayTimestamps, setDisplayTimestamps] = useState([]);

  const fetchVolatilityData = async (symbol, timeframe) => {
    try {
      const response = await fetch(
        `${apiUrl}/volatility-comparison?option_symbol=${symbol}&timeframe=${timeframe}`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const result = await response.json();
      const historicalVolatility = result.historical_volatility.data.map(
        (row) => row[1]
      );
      const rdsData = result.rds_data.data.map((row) => row[1]);
      setTimestamps(result.historical_volatility.data.map((row) => row[0]));
      setDisplayTimestamps(
        processTimestamps(
          result.historical_volatility.data.map((row) => row[0]),
          timeframe
        )
      );

      const data = {
        historical: historicalVolatility,
        implied: rdsData,
      };

      setData(data);
    } catch (error) {
      console.error('Failed to fetch volatility data:', error);
    }
  };

  const processTimestamps = (timestamps, timeframe) => {
    timeframe = Number(timeframe);
    return timestamps.map((timestamp) => {
      const date = new Date(timestamp);
      if (timeframe < 7) {
        // keep only hourly data
        return date.toISOString().slice(11, 16); // 'HH:mm'
      } else if (timeframe === 7) {
        // keep day and hour data
        return (
          date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
          ' ' +
          date.toISOString().slice(11, 16)
        ); // 'MMM D HH:mm'
      } else {
        // keep only day data
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }); // 'MMM D'
      }
    });
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
    fetchVolatilityData(symbol, timeFrame);
    setDisplayTimestamps(processTimestamps(timestamps, timeFrame));
    console.log('Submitted symbol:', symbol);
  };

  useEffect(() => {
    fetchVolatilityData(symbol, timeFrame);
  }, []);

  useEffect(() => {
    if (optionSymbol) {
      setSymbol(optionSymbol);
    }
  }, [optionSymbol]);

  const maxLength = Math.max(data.historical.length, data.implied.length);
  const minLength = Math.min(data.historical.length, data.implied.length);
  const lengthDifference = maxLength - minLength;

  // Append zeros to the beginning of the smaller array
  if (data.historical.length < maxLength) {
    data.historical = Array(lengthDifference).fill(0).concat(data.historical);
  } else if (data.implied.length < maxLength) {
    data.implied = Array(lengthDifference).fill(0).concat(data.implied);
  }

  const chartData = {
    labels: displayTimestamps,
    datasets: [
      {
        label: 'Historical Volatility',
        data: data.historical,
        borderColor: 'rgb(35, 141, 187)',
        fill: false,
        pointStyle: false,
      },
      {
        label: 'Implied Volatility',
        data: data.implied,
        borderColor: 'rgb(216, 50, 50)',
        fill: false,
        pointStyle: false,
      },
    ],
  };

  const chartOptions = {
    // animation: false,
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

export default OptionVolatilityChart;
