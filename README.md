# Crypto Option Chain Analyzer 📊

## Overview

The Crypto Option Chain Analyzer is a web application that provides real-time option chain data and volatility comparisons for various cryptocurrencies. The application fetches data from multiple sources, including Binance and CoinGecko, and displays it in an interactive dashboard.

## Features ✨

- Real-time option chain data for BTC, ETH, BNB, and more.
- Historical and implied volatility comparison.
- Greeks data for options.
- Copy option symbols to clipboard with a single click.

## Installation 🛠️

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/option-pricing-dashboard.git
   cd option-pricing-dashboard
2. Install the dependencies:
   ```
   npm install
3. Start real-time WebSocket connections:
   ```
   python orchestrate_data_collection.py
4. Run the FastAPI backend:
   ```
   uvicorn send-realtime-data:app --reload
5. Start the development server:
   ```
   npm start
## Usage 🚀
1. Open your browser and navigate to http://localhost:3000.
2. Select your chosen symbol and expiry date from the dropdown to see different option chains.
3. Click on a row to copy the option symbol.
4. Use the volatility comparison and Greeks data features to analyze the options.


## Project Structure 📂
- `src/`: Contains the frontend React code.
- `send-realtime-data.py`: FastAPI backend for fetching and serving data.
- `iv_chart.py`: Contains functions for fetching and calculating volatility data.
- `greeks.py`: Contains functions for fetching Greeks data.
- `.env`: Environment variables (not included in the repository).
- `.gitignore`: Specifies files and directories to be ignored by Git.
- `README.md`: Project documentation.