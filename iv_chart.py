import os
from datetime import datetime, timedelta, timezone

import numpy as np
import pandas as pd
import requests
from dotenv import load_dotenv
from sqlalchemy import create_engine

from historical_data import get_historical_volatility

load_dotenv()


def get_underlying_ticker(input_string):
    return input_string.split("-")[0].lower()


def get_underlying_trading_pair(input_string):
    return input_string.split("-")[0].upper() + "USDT"


# Fetch data from AWS RDS
# Default timeframe is 1 day


def get_historical_iv(option_symbol, start_date, timeframe=1):
    host = os.getenv("AWS_RDS_HOST")
    port = 3306
    database = os.getenv("AWS_RDS_DB")
    user = os.getenv("AWS_RDS_USER")
    password = os.getenv("AWS_RDS_PW")
    try:
        engine = create_engine(
            f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}"
        )
        print("Connection successful!")
        underlying = get_underlying_ticker(option_symbol)
        query = f"""
            SELECT * FROM {underlying}_options
            WHERE symbol = '{option_symbol}'
            AND timestamp >= '{start_date}';
        """
        data = pd.read_sql(query, engine)
        # Converts 10min data to hourly if timeframe is greater than 1
        if timeframe > 1:
            data = data.iloc[::6, :]
        return data
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        return None


def convert_to_utc(num_days):
    current_date_utc = datetime.now(timezone.utc)
    target_date_utc = current_date_utc - timedelta(days=num_days)
    target_date_utc = target_date_utc.replace(hour=0, minute=0, second=0, microsecond=0)
    target_date_str = target_date_utc.strftime("%Y-%m-%d %H:%M:%S")
    return target_date_str


def volatility_comparison_data(option_symbol, timeframe):
    underlying_symbol = get_underlying_trading_pair(option_symbol)
    start_date = convert_to_utc(timeframe)
    historical_volatility_df = get_historical_volatility(
        underlying_symbol, start_date, timeframe=timeframe
    )
    historical_implied_volatility_df = get_historical_iv(
        option_symbol, start_date, timeframe
    )[["timestamp", "mark_iv"]]
    return historical_volatility_df, historical_implied_volatility_df
