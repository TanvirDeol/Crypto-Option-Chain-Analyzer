import requests
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv
import os
import numpy as np
from sqlalchemy import create_engine
import pandas as pd

load_dotenv()

def get_underlying(input_string):
    extracted_string = input_string.split('-')[0]
    lowercase_string = extracted_string.lower()
    return lowercase_string

# Fetch data from AWS RDS
# Default timeframe is 1 day
def fetch_greeks_from_rds(option_symbol, greek, timeframe=1):
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
        data = pd.read_sql(query, engine)[['timestamp', greek]]
        # Converts 10min data to hourly if timeframe is greater than 1
        if (timeframe > 1):
            data = data.iloc[::6, :] 
        return data
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        return None
    
def greeks_data(option_symbol, greek, timeframe):
    data = fetch_greeks_from_rds(option_symbol, greek, timeframe)
    return data
