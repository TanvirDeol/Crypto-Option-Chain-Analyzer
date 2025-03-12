import asyncio
from typing import Optional

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from greeks import greeks_data
from historical_volatility import get_historical_volatility
from implied_volatility import get_implied_volatility
from utils import (convert_to_utc, get_option_chain, get_symbols_and_expiries,
                   get_underlying_trading_pair)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def volatility_comparison_data(option_symbol, timeframe):
    underlying_symbol = get_underlying_trading_pair(option_symbol)
    start_date = convert_to_utc(timeframe)
    historical_volatility_df = get_historical_volatility(
        underlying_symbol, start_date, timeframe=timeframe
    )
    implied_volatility_df = get_implied_volatility(option_symbol, start_date, timeframe)
    return historical_volatility_df, implied_volatility_df


# Process locally stored option chains to send to websocket client
async def send_dataframe_updates(websocket: WebSocket, symbol: str, expiry: str):
    while True:
        try:
            df = get_option_chain(symbol, expiry)
            data = {
                "columns": df.columns.tolist(),
                "data": df.values.tolist(),
            }
            await websocket.send_json(data)
            await asyncio.sleep(1)
        except Exception as e:
            print(f"Error: {e}")
            break


# Send realtime option chain data to client for a given symbol and expiry
# Usage: TODO
@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket, symbol: Optional[str], expiry: Optional[str]
):
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


# Fetch all unique (& active) option symbols and their expiry dates
@app.get("/symbols-expiries")
def get_symbols_expiries():
    result = get_symbols_and_expiries()
    return result


# Returns historical volatility (HV) and historical implied volatility (IV) data for a given option symbol and timeframe
# Usage: TODO
@app.get("/volatility-comparison")
def volatility_comparison(option_symbol: str, timeframe: int):
    if not option_symbol:
        return {
            "historical_volatility": {
                "columns": [],
                "data": [],
            },
            "rds_data": {
                "columns": [],
                "data": [],
            },
        }
    hv_df, iv_df = volatility_comparison_data(option_symbol, timeframe)
    print(iv_df)
    hv_data = {
        "columns": hv_df.columns.tolist(),
        "data": hv_df.values.tolist(),
    }
    iv_data = {
        "columns": iv_df.columns.tolist(),
        "data": iv_df.values.tolist(),
    }
    return {"historical_volatility": hv_data, "rds_data": iv_data}


# Returns options greeks (delta, gamma, theta, vega) data for a given option symbol and timeframe
# Usage: TODO
@app.get("/greeks-data")
def get_greeks_data(option_symbol: str, greek: str, timeframe: int):
    if not option_symbol:
        return {}
    try:
        result = greeks_data(option_symbol, greek, timeframe)
        return result
    except Exception as e:
        return {"error": str(e)}


# Run with: uvicorn app:app --reload
