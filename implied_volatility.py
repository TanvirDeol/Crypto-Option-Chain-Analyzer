from db import get_historical_db


# Fetch IV data from AWS RDS; default timeframe is 1 day
def get_implied_volatility(option_symbol, start_date, timeframe=1):
    return get_historical_db(
        option_symbol, ["timestamp", "mark_iv"], timeframe, start_date
    )
