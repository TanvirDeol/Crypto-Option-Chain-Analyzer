import multiprocessing
import re
import subprocess

import requests


def get_active_options():
    url = "https://eapi.binance.com/eapi/v1/mark"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        return data
    else:
        print(f"Error: {response.status_code}")
        return None


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


def split_list(lst, chunk_size):
    return [lst[i : i + chunk_size] for i in range(0, len(lst), chunk_size)]


def format_list(input_list):
    return "/".join(sorted(input_list))


def execute_script(param):
    print(param)
    try:
        subprocess.run(["python", "fetch_realtime_data.py", param], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error occurred while executing script with param {param}: {e}")


def main():
    # unique list of expiry dates for all symbols
    expiry_dates = set()
    data = get_active_options()

    for d in data:
        option_symbol = d["symbol"]
        option_details = extract_option_details(option_symbol)
        if option_details is not None and option_details["symbol"] in [
            "BTC",
            "ETH",
            "SOL",
            "BNB",
            "XRP",
        ]:
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
