import multiprocessing
import re
import subprocess

import requests

# DESCRIPTION:
# This script gathers all active (currently trading) options from Binance
# and starts concurrent processes to gather real-time option chain data for all active options.
#
# We currently support BTC, ETH, SOL, BNB, and XRP options.

supported_tickers = ["BTC", "ETH", "SOL", "BNB", "XRP"]


# Get all active options from Binance API
def get_active_options():
    url = "https://eapi.binance.com/eapi/v1/mark"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        return data
    else:
        print(f"Error: {response.status_code}")
        return None


# Given an option symbol, return the details like symbol, expiry date, strike price, and option type
# Example: BTC-210924-40000-C -> {'symbol': 'BTC', 'expiry_date': '210924', 'strike_price': '40000', 'option_type': 'C'}
def extract_option_details(option_symbol):
    pattern = r"([A-Za-z]+)-([^-\s]+)-([^-\s]+)-([CP])"
    match = re.match(pattern, option_symbol)

    if match:
        symbol = match.group(1)  # Currency symbol
        expiry_date = match.group(2)  # Expiry date in YYMMDD format
        strike_price = match.group(3)  # Strike price
        option_type = match.group(4)  # 'C' for Call or 'P' for Put

        return {
            "symbol": symbol,
            "expiry_date": expiry_date,
            "strike_price": strike_price,
            "option_type": option_type,
        }
    else:
        return None


# Split a list into chunks of a specified size (chunk_size)
def split_list(lst, chunk_size):
    return [lst[i : i + chunk_size] for i in range(0, len(lst), chunk_size)]


# Format a list (of url params) into a string separated by '/'
def format_list(input_list):
    return "/".join(sorted(input_list))


# Execute the script to fetch real-time data for a given set of symbols and expiry dates
# We run these scripts concurrently
def execute_script(param):
    try:
        subprocess.run(["python", "fetch_realtime_data.py", param], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error occurred while executing script with param {param}: {e}")


# Main function to gather active options and start processes to fetch real-time option chain data
def main():
    # unique list of expiry dates for all symbols
    expiry_dates = set()
    data = get_active_options()

    for d in data:
        option_symbol = d["symbol"]
        option_details = extract_option_details(option_symbol)
        if option_details is not None and option_details["symbol"] in supported_tickers:
            expiry_dates.add(
                option_details["symbol"] + "@ticker@" + option_details["expiry_date"]
            )

    expiry_dates = list(expiry_dates)
    chunked_list = split_list(expiry_dates, 10)
    url_params = []
    for chunk in chunked_list:
        url_params.append(format_list(chunk))

    with multiprocessing.Pool(processes=len(url_params)) as pool:
        pool.map(execute_script, url_params)


if __name__ == "__main__":
    main()
