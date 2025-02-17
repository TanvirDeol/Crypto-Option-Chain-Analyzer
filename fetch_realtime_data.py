import asyncio
import json
import re
import sys

import pandas as pd
import websockets

# make it a 2d dictionary [symbol][expiry]
option_chain = {
    "BTC": {},
    "ETH": {},
    "SOL": {},
    "XRP": {},
    "BNB": {},
}

# obj_list : list of option data
# symbol: cryptocurrency we are getting data for


def process_data(obj_list, symbol, expiry):
    """
    Update the global DataFrame with new rows from the provided list of objects,
    overwriting existing rows if they have the same "s" key value.
    Also extracts and appends strike price and option type as new columns.

    Parameters:
        obj_list (list): A list of dictionaries, each containing an "s" key.

    Returns:
        None
    """
    global option_chain
    new_data = pd.DataFrame(obj_list)
    new_data["strike"], new_data["type"] = zip(
        *new_data["s"].apply(extract_strike_and_option)
    )
    if expiry not in option_chain[symbol]:
        option_chain[symbol][expiry] = pd.DataFrame()
    if len(option_chain[symbol][expiry]) > 0:
        # Remove rows in the global dataframe that have the same "s" key as the
        # new data
        option_chain[symbol][expiry] = option_chain[symbol][expiry][
            ~option_chain[symbol][expiry]["s"].isin(new_data["s"])
        ]
    option_chain[symbol][expiry] = pd.concat(
        [option_chain[symbol][expiry], new_data], ignore_index=True
    )
    option_chain[symbol][expiry] = option_chain[symbol][expiry].sort_values(by="strike")


def extract_strike_and_option(option_string):
    """
    Extract the strike price and option type from the given string.

    Parameters:
        option_string (str): The string containing option details (e.g., "ETH-220930-1600-C").

    Returns:
        tuple: A tuple containing the strike price (int) and option type (str: 'C' or 'P').
    """
    match = re.search(r"-(\d+)-(C|P)$", option_string)
    if match:
        strike_price = int(match.group(1))
        option_type = match.group(2)
        return strike_price, option_type
    return None, None


async def binance_ws(url_param):
    url = f"wss://nbstream.binance.com/eoptions/stream?streams={url_param}"
    async with websockets.connect(url) as websocket:
        print("Connected to Binance WebSocket")

        while True:
            data = await websocket.recv()
            data = json.loads(data)
            symbol = data["stream"][:3]
            expiry = data["stream"][-6:]
            data = data["data"]
            process_data(data, symbol, expiry)
            print(f"Collecting data for {symbol} @ {expiry}")
            option_chain[symbol][expiry][
                [
                    "T",
                    "s",
                    "strike",
                    "type",
                    "o",
                    "h",
                    "l",
                    "c",
                    "V",
                    "P",
                    "p",
                    "n",
                    "bo",
                    "ao",
                    "b",
                    "a",
                    "d",
                    "t",
                    "g",
                    "v",
                    "vo",
                    "mp",
                ]
            ].to_csv(f"option_chains/{symbol}_{expiry}_option_chain.csv", index=False)


if len(sys.argv) != 2:
    print("Usage: python fetch_realtime_data.py <param>")
    sys.exit(1)

url_param = sys.argv[1]
# Run the WebSocket connection
asyncio.run(binance_ws(url_param))
