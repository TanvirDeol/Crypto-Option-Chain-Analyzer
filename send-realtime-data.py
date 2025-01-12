from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import asyncio
from typing import Optional
import requests
from iv_chart import volatility_comparison_data
from greeks import greeks_data


app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# load option chain data from file storage
def get_option_chain(symbol,expiry):
    options_chain = pd.read_csv(f"option_chains/{symbol}_{expiry}_option_chain.csv")
    return options_chain

# Fetch all unique (& active) symbols and their expiry dates from Binance
def get_symbols_and_expiries():
    url = "https://eapi.binance.com/eapi/v1/mark"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        symbols_and_expiries = {}
        for item in data:
            symbol = item["symbol"]
            symbol_name = symbol.split('-')[0]
            expiry_date = symbol.split('-')[1]
            if symbol_name in symbols_and_expiries:
                symbols_and_expiries[symbol_name].add(expiry_date)
            else:
                symbols_and_expiries[symbol_name] = {expiry_date}
        for symbol in symbols_and_expiries:
            symbols_and_expiries[symbol] = sorted(symbols_and_expiries[symbol])
        return symbols_and_expiries
    else:
        print(f"Error fetching data: {response.status_code}")
        return {}

# Send realtime option chain data to the client every 1 second
async def send_dataframe_updates(websocket: WebSocket, symbol: str, expiry: str):
    print(symbol,expiry)
    while True:
        try:
            df = get_option_chain(symbol, expiry)
            data = {
                'columns': df.columns.tolist(),
                'data': df.values.tolist(),
            }
            await websocket.send_json(data)
            await asyncio.sleep(1)
        except Exception as e:
            print(f"Error: {e}")
            break

# WebSocket endpoint to send realtime option chain data to client
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, symbol: Optional[str], expiry: Optional[str]):
    await websocket.accept()
    if symbol:
        # if no expiry selected, choose the earliest expiry
        if expiry == "undefined":
            result = get_symbols_and_expiries()
            expiry = result[symbol][0]
        await websocket.send_text(f"Connected with symbol: {symbol}")
        await send_dataframe_updates(websocket, symbol, expiry)
    else:
        await websocket.send_text("No symbol provided")
        await websocket.close()

# Endpoint to fetch all unique (& active) symbols and their expiry dates
@app.get("/symbols-expiries")
def get_symbols_expiries():
    result = get_symbols_and_expiries()
    return result

@app.get("/volatility-comparison")
def volatility_comparison(option_symbol: str, timeframe: int):
    if not option_symbol:
        historical_volatility_data = {
            'columns': [],
            'data': [],
        }
        rds_data = {
            'columns': [],
            'data': [],
        }
        return {
            "historical_volatility": historical_volatility_data,
            "rds_data": rds_data
        }
    print("PARAMS: ",option_symbol, timeframe)
    historical_volatility_df, rds_df = volatility_comparison_data(option_symbol, timeframe)
    historical_volatility_data = {
        'columns': historical_volatility_df.columns.tolist(),
        'data': historical_volatility_df.values.tolist(),
    }
    rds_data = {
        'columns': rds_df.columns.tolist(),
        'data': rds_df.values.tolist(),
    }
    print(historical_volatility_data["data"])
    print(rds_data["data"])
    return {
        "historical_volatility": historical_volatility_data,
        "rds_data": rds_data
    }

@app.get("/greeks-data")
def get_greeks_data(option_symbol: str, greek: str, timeframe: int):
    if not option_symbol:
        return {}
    try:
        result = greeks_data(option_symbol, greek, timeframe)
        return result
    except Exception as e:
        return {"error": str(e)}



# Run with: uvicorn send-realtime-data:app --reload
