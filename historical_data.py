from binance.client import Client
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
client = Client()


# given a symbol, interval, and start date, fetch historical price data
def get_historical_data(symbol, timeframe, start_str, end_str=None):
    interval = Client.KLINE_INTERVAL_1HOUR
    if (timeframe == 1):
        interval = Client.KLINE_INTERVAL_5MINUTE # we convert to 10 minutes at end of function

    klines = client.get_historical_klines(symbol, interval, start_str, end_str)
    df = pd.DataFrame(klines, columns=[
        'timestamp', 'open', 'high', 'low', 'close', 'volume', 'close_time', 
        'quote_asset_volume', 'number_of_trades', 'taker_buy_base_asset_volume', 
        'taker_buy_quote_asset_volume', 'ignore'
    ])
    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
    df = df[['timestamp','close']]
    df['close'] = df['close'].astype(float)

    if (timeframe == 1): # 24hr timeframe -> 10 min intervals
        df = df.iloc[::2, :]
    return df

def rollback_date(start_date, timeframe):
    interval = "1h"
    if (timeframe == 1):
        interval = "10m"
    interval_mapping = {
        '1m': 1,
        '3m': 3,
        '5m': 5,
        '10m': 10,
        '15m': 15,
        '30m': 30,
        '1h': 60,
        '2h': 120,
        '4h': 240,
        '6h': 360,
        '8h': 480,
        '12h': 720,
        '1d': 1440,
        '3d': 4320,
        '1w': 10080,
    }
    interval_minutes = interval_mapping.get(interval, 10)  # Default to 10 minutes if interval is not found
    total_minutes = 30 * interval_minutes  # Calculate the total minutes to roll back
    start_date_dt = datetime.strptime(start_date, '%Y-%m-%d %H:%M:%S')
    new_date_dt = start_date_dt - timedelta(minutes=total_minutes)
    new_date_str = new_date_dt.strftime('%Y-%m-%d %H:%M:%S')
    print("Rolling back date from", start_date, "to", new_date_str)
    return new_date_str


# Calculate the rolling historical volatility of a stock
def get_historical_volatility(symbol, start_str, end_str=None, timeframe=1, window=30):
    start_rollback = rollback_date(start_str, timeframe)
    df = get_historical_data(symbol, timeframe, start_rollback, end_str)
    df['log_return'] = np.log(df['close'] / df['close'].shift(1))
    df['volatility'] = df['log_return'].rolling(window=window).std() * np.sqrt(365)  # Annualize the volatility
    df.fillna(0, inplace=True)
    start_datetime = pd.to_datetime(start_str)
    filtered_df = df[df['timestamp'] >= start_datetime]
    return filtered_df[['timestamp','volatility']]


