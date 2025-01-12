import requests
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv
import os
import numpy as np
from sqlalchemy import create_engine
import pandas as pd

load_dotenv()

symbol_to_id = {
    "btc": "bitcoin",
    "eth": "ethereum",
    "bnb": "binancecoin",
    "sol": "solana",
    "xrp": "ripple",
}

# Get historical chart data of a cryptocurrency from CoinGecko API
def get_historical_data(underlying,timeframe=1):
    coin_id = symbol_to_id[underlying]
    base_url = f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart"
    params = {
        "vs_currency": "usd",
        "days": str(timeframe)
    }
    response = requests.get(f"{base_url}", params=params)
    if response.status_code == 200:
        data = response.json()
        prices = data.get("prices", [])
        dates = [datetime.fromtimestamp(price[0] // 1000).strftime('%Y-%m-%d') for price in prices]
        price_values = [price[1] for price in prices]
        df = pd.DataFrame({"Date": dates, "Price (USD)": price_values})
        # switch to 10-min data if data is 5-min intervals
        if timeframe == 1:
            df = df.iloc[::2, :]
        return df
    else:
        print(f"Failed to fetch data: {response.status_code}, {response.text}")
        return None
    
def get_underlying(input_string):
    extracted_string = input_string.split('-')[0]
    lowercase_string = extracted_string.lower()
    return lowercase_string

# Fetch data from AWS RDS
# Default timeframe is 1 day
def fetch_iv_from_rds(option_symbol, timeframe=1):
    host = os.getenv('AWS_RDS_HOST')
    port = 3306 
    database = os.getenv('AWS_RDS_DB')
    user = os.getenv('AWS_RDS_USER')
    password = os.getenv('AWS_RDS_PW')
    try:
        engine = create_engine(f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}")
        print("Connection successful!")
        underlying = get_underlying(option_symbol)
        query = f"""
            SELECT * FROM {underlying}_options 
            WHERE symbol = '{option_symbol}' 
            AND timestamp >= NOW() - INTERVAL {timeframe} DAY;
        """
        data = pd.read_sql(query, engine)
        # Converts 10min data to hourly if timeframe is greater than 1
        if (timeframe > 1):
            data = data.iloc[::6, :] 
        return data
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        return None
    
# Calculates historical volatility of an asset based on the daily returns
def calculate_historical_volatility(dataframe, window=30):
    dataframe['Date'] = pd.to_datetime(dataframe['Date'])
    dataframe = dataframe.sort_values('Date')
    dataframe['Daily Returns'] = dataframe['Price (USD)'].pct_change()
    dataframe['Volatility'] = dataframe['Daily Returns'].rolling(window=window).std() * np.sqrt(365)
    dataframe = dataframe.dropna(subset=['Volatility'])
    return dataframe

def volatility_comparison_data(option_symbol, timeframe):
    historical_df = get_historical_data(get_underlying(option_symbol), timeframe)
    historical_volatility_df = calculate_historical_volatility(historical_df)[["Date","Volatility"]]
    rds_df = fetch_iv_from_rds(option_symbol, timeframe)[["timestamp","mark_iv"]]
    return historical_volatility_df, rds_df
