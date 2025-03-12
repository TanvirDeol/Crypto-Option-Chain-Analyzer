import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogTitle, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const OptionChain = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const wsUrl = process.env.REACT_APP_WS_URL;
  const [selected, setSelected] = useState('BTC');
  const [selectedOptionSymbol, setSelectedOptionSymbol] = useState('');
  const [selectedExpiry, setSelectedExpiry] = useState();
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [connected, setConnected] = useState(false);
  const [data, setData] = useState({ columns: [], data: [] });
  const [allExpiries, setAllExpiries] = useState({ BTC: [] });
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
    { key: 's', label: 'Contract Name', index: 1 },
    { key: 'type', label: 'Option Type', index: 3 },
    { key: 'strike', label: 'Strike', index: 2 },
    { key: 'o', label: '24h Opening Price', index: 4 },
    { key: 'h', label: 'Highest Price', index: 5 },
    { key: 'l', label: 'Lowest Price', index: 6 },
    { key: 'c', label: 'Latest Price', index: 7 },
    { key: 'V', label: 'Volume', index: 8 },
    { key: 'P', label: 'Price Change %', index: 9 },
    { key: 'p', label: 'Price Change', index: 10 },
    { key: 'bo', label: 'Bid', index: 12 },
    { key: 'b', label: 'Bid IV', index: 14 },
    { key: 'ao', label: 'Ask', index: 13 },
    { key: 'a', label: 'Ask IV', index: 15 },
    { key: 'mp', label: 'Mark Price', index: 21 },
    { key: 'vo', label: 'Implied Volatility', index: 20 },
    { key: 'd', label: 'Delta', index: 16 },
    { key: 't', label: 'Theta', index: 17 },
    { key: 'g', label: 'Gamma', index: 18 },
    { key: 'v', label: 'Vega', index: 19 },
    { key: 'n', label: 'No. of Trades', index: 11 },
  ];
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  const openDialog = (optionSymbol) => {
    setSelectedOptionSymbol(optionSymbol);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const redirectToVolatilityChart = () => {
    navigate(`/option-volatility-chart?option-symbol=${selectedOptionSymbol}`);
  };

  const redirectToGreeksChart = () => {
    navigate(`/greeks-chart?option-symbol=${selectedOptionSymbol}`);
  };

  const options = ['BTC', 'ETH', 'SOL', 'XRP', 'BNB'];

  const handleExpiryChange = (e) => setSelectedExpiry(e.target.value);

  useEffect(() => {
    const ws = new WebSocket(
      `${wsUrl}/ws?symbol=${selected}&expiry=${selectedExpiry}`
    );
    ws.onopen = () => {
      console.log('Connected to WebSocket');
      setConnected(true);
    };
    ws.onmessage = (event) => {
      try {
        const newData = JSON.parse(event.data);
        setData(newData);
      } catch (e) {
        console.log(event.data);
      }
    };
    ws.onclose = () => {
      console.log('Disconnected from WebSocket');
      setConnected(false);
    };
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    return () => {
      ws.close();
    };
  }, [selected, selectedExpiry]);

  useEffect(() => {
    fetch(`${apiUrl}/symbols-expiries`)
      .then((response) => response.json())
      .then((expiryDict) => {
        setAllExpiries(expiryDict);
        setExpiryDates(expiryDict[selected]);
      })
      .catch((error) => console.error('Error:', error));
  }, []);

  useEffect(() => {
    setExpiryDates(allExpiries[selected]);
  }, [selected]);

  return (
    <div>
      <div className="m-4 flex flex-wrap justify-start items-center gap-4">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-64 rounded-md bg-slate-800 text-gray-200 p-2 border border-gray-700 focus:ring-2 focus:ring-slate-500"
        >
          {options.map((option) => (
            <option
              key={option}
              value={option}
              className="bg-slate-800 text-gray-200"
            >
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
            <div
              className="absolute z-10 bg-slate-800 border border-slate-700 p-0 rounded shadow-lg"
              style={{
                maxHeight: '500px',
                overflowY: 'scroll',
                top: '100%',
                left: 0,
                right: 0,
              }}
            >
              <select
                multiple
                size="15" // Adjust the size to make the dropdown taller
                value={Object.keys(visibleColumns).filter(
                  (key) => visibleColumns[key]
                )}
                onChange={(e) => {
                  const selectedOptions = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value
                  );
                  setVisibleColumns((prev) => {
                    const newVisibleColumns = { ...prev };
                    Object.keys(newVisibleColumns).forEach((key) => {
                      newVisibleColumns[key] = selectedOptions.includes(key);
                    });
                    return newVisibleColumns;
                  });
                }}
                className="w-full p-2 bg-slate-800 text-white border border-slate-700 rounded focus:outline-none"
              >
                {columns.map((col) => (
                  <option
                    key={col.key}
                    value={col.key}
                    className={`bg-slate-800 text-gray-200 ${visibleColumns[col.key] ? 'bg-slate-400' : ''}`}
                  >
                    {col.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ">
          <div
            className={`w-3 h-3 rounded-full ${
              connected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span>{connected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-center m-4">Calls</h1>
      <div>
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
              <tr
                key={index}
                className="transition hover:bg-slate-600 text-slate-300 border-slate-600 border-y hover:text-white"
              >
                {columns.map(
                  (col) =>
                    visibleColumns[col.key] &&
                    row[3] === 'C' && (
                      <td
                        key={col.key}
                        className="p-2"
                        style={
                          col.index === 9 || col.index === 10
                            ? {
                                color:
                                  row[col.index] < 0
                                    ? '#d63a3a'
                                    : row[col.index] >= 0
                                      ? '#44c344'
                                      : 'inherit',
                              }
                            : {}
                        }
                        onClick={() => {
                          navigator.clipboard.writeText(row[1]);
                          openDialog(row[1]);
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

      <Dialog
        open={isDialogOpen}
        onClose={closeDialog}
        sx={{
          '& .MuiPaper-root': {
            backgroundColor: '#1e293b',
            color: 'white',
            borderRadius: '10px',
            padding: '15px',
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          Option Details
        </DialogTitle>
        <DialogActions>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              padding: '5px 0',
            }}
          >
            <Button
              sx={{
                mb: 2,
                backgroundColor: '#1e40af',
                color: 'white',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#172554' },
              }}
              onClick={() => {
                redirectToVolatilityChart();
              }}
            >
              View Historical Volatility
            </Button>
            <Button
              sx={{
                mb: 2,
                backgroundColor: '#1e40af',
                color: 'white',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#172554' },
              }}
              onClick={() => {
                redirectToGreeksChart();
              }}
            >
              View Historical Greeks
            </Button>
            <Button
              sx={{
                backgroundColor: '#b91c1c',
                color: 'white',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#7f1d1d' },
              }}
              onClick={closeDialog}
            >
              Cancel
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

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
            <tr
              key={index}
              className="transition hover:bg-slate-600 text-slate-300 hover:text-white border-slate-600 border-y"
            >
              {columns.map(
                (col) =>
                  visibleColumns[col.key] &&
                  row[3] === 'P' && (
                    <td
                      key={col.key}
                      className="p-2"
                      style={
                        col.index === 9 || col.index === 10
                          ? {
                              color:
                                row[col.index] < 0
                                  ? '#d63a3a'
                                  : row[col.index] >= 0
                                    ? '#44c344'
                                    : 'inherit',
                            }
                          : {}
                      }
                      onClick={() => {
                        navigator.clipboard.writeText(row[1]);
                        openDialog(row[1]);
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
