# Cost Manager

A personal expense tracking application built with React. Track your daily costs, view monthly and annual reports with visual charts, and manage expenses across multiple currencies.

## Features

- **Add Costs** – Log expenses with amount, currency, category, and description
- **Monthly Reports** – View detailed monthly spending with a breakdown table and pie chart by category
- **Annual Reports** – See yearly spending trends with bar charts and monthly comparisons
- **Multi-Currency Support** – Track costs in USD, ILS, GBP, or EUR with automatic conversion
- **Local Storage** – All data stored locally in your browser using IndexedDB (no server required)
- **Configurable Exchange Rates** – Set a custom URL for live exchange rates or use built-in defaults

## Categories

Expenses are organized into the following categories:
- Food
- Health
- Housing
- Sport
- Education
- Transportation

## Tech Stack

- **React 19** – UI framework
- **Material UI (MUI)** – Component library
- **Recharts** – Charts and data visualization
- **IndexedDB (vanilla JS)** – Client-side database using the native browser API (no wrapper library)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd cost-manager

# Install dependencies
npm install

# Start the development server
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run the app in development mode |
| `npm run build` | Build for production |
| `npm test` | Run tests |

## Testing the IndexedDB Library

A standalone test file is included to verify the IndexedDB functionality works correctly in the browser.

### Running the Test

1. Start the development server:
   ```bash
   npm start
   ```

2. Open the test page in your browser:
   ```
   http://localhost:3000/test.html
   ```

3. Open the browser's Developer Console (`F12` or `Cmd+Option+J` on Mac) to see the test results.

### Expected Output

If everything works correctly, you should see:
```
creating db succeeded
adding 1st cost item succeeded
adding 2nd cost item succeeded
```

### Test Files

- `public/test.html` – The test page that runs the IndexedDB tests
- `public/idb-test.js` – Browser-compatible version of the idb library (for testing only, not the main module)

### Exchange Rates

By default, the app fetches live exchange rates from a remote URL. You can configure a custom exchange rates URL in the **Settings** tab.

## License

MIT
