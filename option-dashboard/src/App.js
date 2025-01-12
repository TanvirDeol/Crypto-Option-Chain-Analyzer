import React, { useState, useEffect } from "react";
import axios from "axios";
import OptionVolatilityChart from "./ivChart";
import OptionChain from "./optionChain";
import GreeksChart from "./greeksChart";

function App() {
  const [activeTab, setActiveTab] = useState(0);
  
  const tabs = [
    { id: 0, label: 'Option Chain' },
    { id: 1, label: 'Historical Implied Volatility' },
    { id: 2, label: 'Historical Greeks'},
  ];

  return (
    <div className="font-mono min-h-screen bg-slate-900 text-white p-6">
    {(activeTab === 0) &&
      <>
      <h1 className="text-2xl font-bold text-left mb-4">Crypto Option Chain</h1>
      <p>Real-time option chain data for BTC, ETH, BNB, SOL, and XRP</p>
      <p style={{ opacity: 0.5 }}>Select your chosen symbol & expiry date from the dropdowns to see different option chains</p>
      <p style={{ opacity: 0.5 }}>Click on a row to copy the option symbol to clipboard</p> 
      </>
    }
    {(activeTab === 1) &&
      <>
      <h1 className="text-2xl font-bold text-left mb-4">Implied Volatility vs Historical Volatility</h1>
      <p>Compares Implied Volatility (IV) of an option to the Historical Volatility (HV) of the underlying asset</p>
      <p style={{ opacity: 0.5 }}>Paste your option symbol and choose a timeframe from the dropdown</p>
      <p style={{ opacity: 0.5 }}>Option symbols look like "BTC-250926-110000-C"</p> 
      </>
    }
    {(activeTab === 2) &&
      <>
      <h1 className="text-2xl font-bold text-left mb-4">Historical Option Greeks</h1>
      <p>Displays historical options greeks data (Delta, Gamma, Theta & Vega)</p>
      <p style={{ opacity: 0.5 }}>Paste your option symbol and choose greek type & a timeframe from the dropdowns</p>
      <p style={{ opacity: 0.5 }}>Option symbols look like "BTC-250926-110000-C"</p> 
      </>
    }
    
      <div className="flex w-full mx-auto mt-10 bg-slate-800 rounded-lg drop-shadow-lg">
      <div className="w-1/6 border-r border-slate-600 bg-slate-800 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full px-4 py-3 text-left rounded-lg text-sm font-medium ${
              activeTab === tab.id
                ? 'bg-slate-700 text-blue-400 border-l-4 rounded-lg border-blue-400'
                : 'text-slate-500 hover:bg-slate-600'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>
      {(activeTab === 0) &&
        <OptionChain></OptionChain>
      }
      { (activeTab === 1) && 
        <OptionVolatilityChart></OptionVolatilityChart>
      }
      { (activeTab === 2) && 
        <GreeksChart></GreeksChart>
      }
      </div>
    </div>
  );
}

export default App;
