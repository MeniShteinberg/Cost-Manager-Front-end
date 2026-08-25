# Smart Spend
## My Personal Cost Manager

## Overview
A front-end web application for managing personal costs, developed as a final project in Front-End Development. The user interface is in English, and the main currency is USD.

## Features
* **Add Cost Items:** Users can add new expenses by specifying the sum, currency, category, and description. 
* **Monthly Detailed Report:** Generates a detailed report of costs for a specific month and year in a selected currency.
* **Pie Chart:** Displays the total costs for a selected month and year according to categories.
* **Annual Bar Chart:** Displays the total costs for each of the twelve months in a selected year.
* **Multi-Currency Support:** Supports USD, ILS, GBP, and EURO. Exchange rates are retrieved from a static JSON file on a server using the Fetch API.
* **Settings:** Includes an option for the user to specify a custom URL address for getting the currency exchange rates.
* **Database:** Data is stored in the browser's local storage using a custom `db.js` wrapper. (Note: A module version is used for the React application, and a separate vanilla JS version is provided for testing requirements).

## Technologies Used
* **UI & Framework:** React, MUI (Material-UI)
* **Charts:** Recharts
* **Core Languages:** JavaScript, HTML, CSS