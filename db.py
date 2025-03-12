import os

import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine
from utils import get_underlying_ticker

load_dotenv()

# columns is list of columns to fetch from the database
def get_historical_db(option_symbol, columns, timeframe=1, start_date=None):
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
        if (start_date):
            query = f"""
                SELECT * FROM {underlying}_options
                WHERE symbol = '{option_symbol}'
                AND timestamp >= '{start_date}';
            """
        else:
            query = f"""
                SELECT * FROM {underlying}_options
                WHERE symbol = '{option_symbol}'
                AND timestamp >= NOW() - INTERVAL {timeframe} DAY;
            """
    
        data = pd.read_sql(query, engine)[columns]
        # Converts 10min data to hourly if timeframe is greater than 1
        if timeframe > 1:
            data = data.iloc[::6, :]
        return data
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        return None
