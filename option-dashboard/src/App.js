import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useLocation,
} from 'react-router-dom';
import OptionVolatilityChart from './ivChart';
import OptionChain from './optionChain';
import GreeksChart from './greeksChart';

function ConditionalText() {
  const location = useLocation();

  if (location.pathname === '/option-volatility-chart') {
    return (
      <>
        <h1 className="text-2xl font-bold text-left mb-4">
          Implied Volatility vs Historical Volatility
        </h1>
        <p>
          Compares Implied Volatility (IV) of an option to the Historical
          Volatility (HV) of the underlying asset
        </p>
        <p style={{ opacity: 0.5 }}>
          Paste your option symbol and choose a timeframe from the dropdown
        </p>
        <p style={{ opacity: 0.5 }}>
          Option symbols look like "BTC-250926-110000-C"
        </p>
      </>
    );
  } else if (location.pathname === '/greeks-chart') {
    return (
      <>
        <h1 className="text-2xl font-bold text-left mb-4">
          Historical Option Greeks
        </h1>
        <p>
          Displays historical options greeks data (Delta, Gamma, Theta & Vega)
        </p>
        <p style={{ opacity: 0.5 }}>
          Paste your option symbol and choose greek type & a timeframe from the
          dropdowns
        </p>
        <p style={{ opacity: 0.5 }}>
          Option symbols look like "BTC-250926-110000-C"
        </p>
      </>
    );
  } else {
    return (
      <>
        <h1 className="text-2xl font-bold text-left mb-4">
          Crypto Option Chain
        </h1>
        <p>Real-time option chain data for BTC, ETH, BNB, SOL, and XRP</p>
        <p style={{ opacity: 0.5 }}>
          Select your chosen symbol & expiry date from the dropdowns to see
          different option chains
        </p>
        <p style={{ opacity: 0.5 }}>
          Click on a row to copy the option symbol to clipboard
        </p>
      </>
    );
  }
}

function App() {
  return (
    <Router>
      <div className="font-mono min-h-screen bg-slate-900 text-white p-6">
        <ConditionalText />
        <div className="flex w-full mx-auto mt-10 bg-slate-800 rounded-lg drop-shadow-lg">
          <div className="w-1/6 border-r border-slate-600 bg-slate-800 rounded-lg">
            <Link to="/option-chain">
              <button className="w-full px-4 py-3 text-left rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-600">
                Option Chain
              </button>
            </Link>
            <Link to="/option-volatility-chart">
              <button className="w-full px-4 py-3 text-left rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-600">
                Historical Implied Volatility
              </button>
            </Link>
            <Link to="/greeks-chart">
              <button className="w-full px-4 py-3 text-left rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-600">
                Historical Greeks
              </button>
            </Link>
          </div>
          <div className="w-5/6 p-4">
            <Routes>
              <Route path="/option-chain" element={<OptionChain />} />
              <Route
                path="/option-volatility-chart"
                element={<OptionVolatilityChart />}
              />
              <Route path="/greeks-chart" element={<GreeksChart />} />
              <Route path="/" element={<OptionChain />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
