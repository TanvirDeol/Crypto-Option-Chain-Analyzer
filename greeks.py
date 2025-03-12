from db import get_historical_db

# DESCRIPTION:
# This script fetches options greeks data for a given option symbol and timeframe.
# We support the following greeks: delta, gamma, theta, vega

# Fetch greeks data
def greeks_data(option_symbol, greek, timeframe=1):
    return get_historical_db(option_symbol, ["timestamp", greek], timeframe)

