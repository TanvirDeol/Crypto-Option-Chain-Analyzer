from datetime import datetime, timedelta, timezone
import requests
import pandas as pd

# DESCRIPTION:
# This script contains general utility functions 

# Given an option symbol, return the underlying trading pair
# Example: BTC-210924-40000-C -> BTCUSDT
def get_underlying_trading_pair(input_string):
    return input_string.split("-")[0].upper() + "USDT"


# Get the UTC date for a given number of days before the current date
# Example: today is 2021-09-24, convert_to_utc(1) -> 2021-09-23 00:00:00
def convert_to_utc(num_days):
    current_date_utc = datetime.now(timezone.utc)
    target_date_utc = current_date_utc - timedelta(days=num_days)
    target_date_utc = target_date_utc.replace(hour=0, minute=0, second=0, microsecond=0)
    target_date_str = target_date_utc.strftime("%Y-%m-%d %H:%M:%S")
    return target_date_str


# Given an option symbol, return the underlying ticker symbol
# Example: BTC-210924-40000-C -> btc
def get_underlying_ticker(input_string):
    return input_string.split("-")[0].lower()


# Load an option chain for a specific option symbol from local storage
def get_option_chain(symbol, expiry):
    options_chain = pd.read_csv(f"option_chains/{symbol}_{expiry}_option_chain.csv")
    return options_chain


# Fetch all unique (& active) symbols and their expiry dates from Binance
def get_symbols_and_expiries():
    url = "https://eapi.binance.com/eapi/v1/mark"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        symbol_expiries = {}

        for item in data:
            option_symbol = item["symbol"]
            symbol = option_symbol.split("-")[0]
            expiry = option_symbol.split("-")[1]

            if symbol in symbol_expiries:
                symbol_expiries[symbol].add(expiry)
            else:
                symbol_expiries[symbol] = {expiry}

        for symbol in symbol_expiries:
            symbol_expiries[symbol] = sorted(symbol_expiries[symbol])
        return symbol_expiries
    else:
        print(f"Error fetching data: {response.status_code}")
        return {}
    
