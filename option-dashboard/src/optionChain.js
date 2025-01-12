import React, { useState, useEffect } from "react";
import axios from 'axios';

const OptionChain = () => {
  const [selected, setSelected] = useState("BTC");
  const [selectedExpiry, setSelectedExpiry] = useState();
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [connected, setConnected] = useState(false);
  const [data, setData] = useState({ columns: [], data: [] });
  const [error, setError] = useState(null);
  const [allExpiries, setAllExpiries] = useState({"BTC":[]});
  const [expiryDates, setExpiryDates] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState({
      s: false,
      type: false,
      strike: true,
      o: true,
      h: false,
      l: false,
      c: true,
      V: false,
      P: true,
      p: true,
      bo: true,
      b: true,
      ao: true,
      a: true,
      mp: true,
      vo: true,
      d: false,
      t: false,
      g: false,
      v: false,
      n: false,
    });

  const columns = [
    { key: "s", label: "Contract Name",index:1 },
    { key: "type", label: "Option Type", index: 3},
    { key: "strike", label: "Strike", index: 2 },
    { key: "o", label: "24h Opening Price", index: 4 },
    { key: "h", label: "Highest Price", index:5 },
    { key: "l", label: "Lowest Price", index: 6 },
    { key: "c", label: "Latest Price", index: 7 },
    { key: "V", label: "Volume", index: 8 },
    { key: "P", label: "Price Change %", index: 9 },
    { key: "p", label: "Price Change",index:10 },
    { key: "bo", label: "Bid", index: 12 },
    { key: "b", label: "Bid IV", index: 14 } ,
    { key: "ao", label: "Ask", index: 13 } ,
    { key: "a", label: "Ask IV", index: 15 } ,
    { key: "mp", label: "Mark Price", index: 21 } ,
    { key: "vo", label: "Implied Volatility", index:20 },
    { key: "d", label: "Delta", index: 16 } ,
    { key: "t", label: "Theta", index: 17 } ,
    { key: "g", label: "Gamma", index: 18 } ,
    { key: "v", label: "Vega", index: 19 } ,
    { key: "n", label: "No. of Trades", index: 11 } ,
  ];
  const options = ["BTC", "ETH", "SOL", "XRP", "BNB"];
  

  const toggleColumnVisibility = (column) => {
    setVisibleColumns((prev) => ({ ...prev, [column]: !prev[column] }));
  };
  const handleExpiryChange = (e) => setSelectedExpiry(e.target.value);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws?symbol=${selected}&expiry=${selectedExpiry}`);
    
    ws.onopen = () => {
      console.log('Connected to WebSocket');
      setConnected(true);
      setError(null);
    };
    ws.onmessage = (event) => {
      try{
        const newData = JSON.parse(event.data);
        console.log(newData);
        setData(newData);
      }
      catch (e){
        console.log(event.data);
      }
    };
    ws.onclose = () => {
      console.log('Disconnected from WebSocket');
      setConnected(false);
    };
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Failed to connect to WebSocket server');
    };
    return () => {
      ws.close();
    };
  }, [selected, selectedExpiry]);

  useEffect(() => {
    fetch('http://localhost:8000/symbols-expiries')
    .then(response => response.json())
    .then(expiryDict => {
        setAllExpiries(expiryDict);
        setExpiryDates(expiryDict[selected]);
    })
    .catch(error => console.error('Error:', error));
  },[])

  useEffect(() => {
    setExpiryDates(allExpiries[selected]);
  },[selected])


  return (
    <div>
      <div className="m-4 flex flex-wrap justify-start items-center gap-4">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-64 rounded-md bg-slate-800 text-gray-200 p-2 border border-gray-700 focus:ring-2 focus:ring-slate-500"
        >
          {options.map((option) => (
            <option key={option} value={option} className="bg-slate-800 text-gray-200">
              {option}
            </option>
          ))}
        </select>

        <select
          className="p-2 rounded bg-slate-800 text-white border border-slate-700 focus:outline-none"
          value={selectedExpiry}
          onChange={handleExpiryChange}
        >
          {expiryDates.map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </select>

        <div className="relative">
          <button
            className="p-2 bg-slate-700 rounded text-white"
            onClick={() => setShowColumnToggle((prev) => !prev)}
          >
            Toggle Columns
          </button>
          {showColumnToggle && (
            <div className="absolute z-10 bg-slate-800 border border-slate-700 p-4 rounded shadow-lg">
              {columns.map((col) => (
                <label key={col.key} className="block">
                  <input
                    type="checkbox"
                    checked={visibleColumns[col.key]}
                    onChange={() => toggleColumnVisibility(col.key)}
                    className="mr-2"
                  />
                  {col.label}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ">
          <div
            className={`w-3 h-3 rounded-full ${
              connected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span>{connected ? "Connected" : "Disconnected"}</span>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-center m-4">Calls</h1>
      <table className="table-auto border-collapse bg-slate-800 overflow-hidden shadow-lg">
        <thead>
          <tr className="bg-slate-600 text-white">
            {columns.map(
              (col) =>
                visibleColumns[col.key] && (
                  <th key={col.key} className="p-4 text-left">
                    {col.label}
                  </th>
                )
            )}
          </tr>
        </thead>
        <tbody>
          {data.data.map((row, index) => (
            <tr key={index} className="transition hover:bg-slate-600 text-slate-300 border-slate-600 border-y hover:text-white">
              {columns.map(
                (col) =>
                  visibleColumns[col.key] &&
                  row[3] === "C" && (
                    <td
                      key={col.key}
                      className="p-2"
                      style={
                        col.index === 9 || col.index === 10
                          ? {
                              color:
                                row[col.index] < 0
                                  ? "#d63a3a"
                                  : row[col.index] >= 0
                                  ? "#44c344"
                                  : "inherit",
                            }
                          : {}
                      }
                      onClick={() => {
                        navigator.clipboard.writeText(row[1]);
                        console.log(row[1]);
                        alert('Copied');
                      }}
                    >
                      {row[col.index]}
                    </td>
                  )
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <h1 className="text-2xl font-bold text-center m-4">Puts</h1>
      <table className="table-auto border-collapse bg-slate-800 overflow-hidden shadow-lg">
        <thead>
          <tr className="bg-slate-700 text-white">
            {columns.map(
              (col) =>
                visibleColumns[col.key] && (
                  <th key={col.key} className="p-4 text-left">
                    {col.label}
                  </th>
                )
            )}
          </tr>
        </thead>
        <tbody>
          {data.data.map((row, index) => (
            <tr key={index} className="transition hover:bg-slate-600 text-slate-300 hover:text-white border-slate-600 border-y">
              {columns.map(
                (col) =>
                  visibleColumns[col.key] &&
                  row[3] === "P" && (
                    <td
                      key={col.key}
                      className="p-2"
                      style={
                        col.index === 9 || col.index === 10
                          ? {
                              color:
                                row[col.index] < 0
                                  ? "#d63a3a"
                                  : row[col.index] >= 0
                                  ? "#44c344"
                                  : "inherit",
                            }
                          : {}
                      }
                      onClick={() => {
                        navigator.clipboard.writeText(row[1]);
                        console.log(row[1]);
                        alert('Copied');
                      }}
                      >
                      {row[col.index]}
                    </td>
                  )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OptionChain;
