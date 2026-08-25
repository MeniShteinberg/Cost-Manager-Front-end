# Smart Spend - My Personal Cost Manager

## Overview
**Smart Spend** is a minimalist and intuitive personal cost management application. 
This project was developed as a Final Project in Front-End Development. It allows users to track their expenses, view detailed monthly reports, and analyze annual spending habits using interactive charts.

## Key Features
* **Add New Costs:** Easily add expenses by specifying the sum, currency, category, and description. 
* **Monthly Report:** Generate a detailed breakdown for a specific month and year. Includes a detailed data table and a "Category Breakdown" pie chart.
* **Annual Overview:** View a bar chart displaying total costs across all 12 months of a selected year.
* **Multi-Currency Support:** Add costs and view reports in USD, ILS, GBP, or EURO.
* **Dynamic Exchange Rates:** Currency conversion is handled dynamically by fetching exchange rates from an external JSON API.
* **Custom Settings:** Users can configure the URL for fetching the currency exchange rates directly from the Settings tab.
* **Local Storage Database:** All data is securely stored in the browser's local storage using a custom `db.js` wrapper.

## Technologies Used
* **Frontend:** React, Material-UI (MUI)
* **Charts:** Recharts (BarChart & PieChart)
* **Data Management:** Vanilla JavaScript (`db.js`) & Browser Local Storage
* **Styling:** Clean, minimalist design with a custom muted/pastel color palette.

## Getting Started
1. Clone this repository.
2. Ensure you have Node.js installed.
3. Run `npm install` to install dependencies.
4. Run `npm start` to run the application locally.

*(Note: The database functionality is handled locally via the browser, so no backend setup is required other than providing a valid exchange rate JSON URL in the settings).*