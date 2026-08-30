// URL pointing to the default exchange rates JSON file in the GitHub repository
const DEFAULT_RATES_URL = "https://raw.githubusercontent.com/MeniShteinberg/Cost-Manager-Front-end/refs/heads/main/public/exchange-rates.json";

// Cache exchange rates in memory to avoid repeated network requests during the session
let cachedRates = { "USD": 1, "ILS": 3.4, "GBP": 0.6, "EURO": 0.7 };

async function fetchExchangeRates() {
    // Attempt to load user-configured source first to respect custom settings
    const userUrl = localStorage.getItem("currency_url");
    try {
        if (userUrl) {
            // Fetch from custom URL if defined by the user
            const response = await fetch(userUrl);
            if (response.ok) {
                // Overwrite default rates with successfully fetched custom data
                cachedRates = await response.json();
                return;
            }
        }

        // Fallback to default rates if custom URL fails or is absent
        const defaultResponse = await fetch(DEFAULT_RATES_URL);
        if (defaultResponse.ok) {
            // Store verified default rates for immediate synchronous access later
            cachedRates = await defaultResponse.json();
        }
    } catch (e) {
        // Silently retain current rates to prevent application crash during network failure
        console.error("Failed to fetch rates, keeping existing cached rates.");
    }
}

// Fetch rates on app startup to ensure fresh data is available
fetchExchangeRates();
// Refresh exchange rates every hour to keep conversion rates current
setInterval(fetchExchangeRates, 1000 * 60 * 60);

// Main database object providing all cost management operations
const db = {

    // Public method to manually refresh exchange rates
    refreshRates: fetchExchangeRates,

    // Opens database connection and returns object with CRUD operations for costs
    openCostsDB: function(databaseName = "costsdb", databaseVersion = 1) {
        // Validate database version is a number to prevent misconfiguration
        if (isNaN(databaseVersion)) {
            throw new Error("Invalid database version");
        }

        // Return namespace containing all database operations
        return {

    // Appends a validated cost record to the local storage array
    addCost: (cost) => {

        // Ensure all mandatory fields exist to maintain data integrity
        if (!cost || !cost.sum || !cost.currency || !cost.category || !cost.description) {
            throw new Error("Error: Missing required cost fields.");
        }

        const numericSum = Number(cost.sum);
        // Block negative or invalid amounts to prevent logical calculation errors
        if (numericSum <= 0 || isNaN(numericSum)) {
            throw new Error("Error: Sum must be a positive number.");
        }

        // Retrieve existing costs from browser storage or initialize empty array
        const storedData = localStorage.getItem("costs");
        const allCosts = storedData ? JSON.parse(storedData) : [];

        // Create cost record with unique ID (timestamp) and typed fields
        const item = {
            id: new Date().getTime(),
            sum: Number(cost.sum),
            currency: String(cost.currency),
            category: String(cost.category),
            description: String(cost.description),
            createdAt: new Date().getTime()
        };

        // Add new cost to array and persist updated list back to storage
        allCosts.push(item);
        localStorage.setItem("costs", JSON.stringify(allCosts));

        // Return the constructed item for UI confirmation
        return item;
    },

    // Retrieves costs for a specific month and standardizes sums to the target currency
    getReport: (targetCurrency = "USD", year = new Date().getFullYear(), month = new Date().getMonth() + 1) => {
        
        // Abort query if rates haven't loaded to prevent incorrect conversions
        if (!cachedRates) {
            throw new Error("Exchange rates are still loading, please try again in a moment.");
        }

        const rates = cachedRates;

        // Ensure target currency exists in our rate dictionary
        if (!rates[targetCurrency]) throw new Error("Invalid target currency");

        // Validate year input to prevent date parsing issues
        if (isNaN(year)) throw new Error("Invalid year");

        // Validate month boundary to prevent date parsing issues
        if (isNaN(month) || month < 1 || month > 12) throw new Error("Invalid month");
        
        const storedData = localStorage.getItem("costs");
        // Default to empty array if storage is uninitialized
        const allCosts = storedData ? JSON.parse(storedData) : [];

        // Isolate records matching the requested year and month
        const filteredCosts = allCosts.filter(cost => {
            const date = new Date(cost.createdAt);
            return date.getFullYear() === year && (date.getMonth() + 1) === month;
        });

        // Map internal data model to the structured format expected by the UI report
        const processedCosts = filteredCosts.map(cost => {
            return {
                sum: cost.sum,
                currency: cost.currency,
                category: cost.category,
                description: cost.description,
                date: { day: new Date(cost.createdAt).getDate() }
            };
        });

        let total = 0;
        // Accumulate total by converting each item to USD first, then to the target currency
        filteredCosts.forEach(cost => {
            const inUSD = cost.sum / rates[cost.currency];
            const inTarget = inUSD * rates[targetCurrency];
            total += inTarget;
        });

        // Return unified report payload containing requested parameters and calculated total
        return {
            year,
            month,
            costs: processedCosts,
            total: { currency: targetCurrency, sum: parseFloat(total.toFixed(2)) }
        };
    },

    // Groups monthly costs by category, converting all sums to the requested currency
    getCostsByCategory: (year, month, targetCurrency = "USD") => {

        // Halt execution if rate dependencies are missing
        if (!cachedRates) {
            throw new Error("Exchange rates are still loading, please try again in a moment.");
        }

        const rates = cachedRates;
        // Validate the requested currency against available rates
        if (!rates[targetCurrency]) throw new Error("Invalid target currency");

        if (isNaN(year)) throw new Error("Invalid year");
        // Ensure month is within standard calendar bounds
        if (isNaN(month) || month < 1 || month > 12) throw new Error("Invalid month");

        const storedData = localStorage.getItem("costs");
        const allCosts = storedData ? JSON.parse(storedData) : [];

        // Extract only the costs relevant to the specified period
        const filteredCosts = allCosts.filter(cost => {
            const date = new Date(cost.createdAt);
            return date.getFullYear() === year && (date.getMonth() + 1) === month;
        });

        const categoryTotals = {};
        // Aggregate converted amounts into dynamic category buckets
        filteredCosts.forEach(cost => {
            const inUSD = cost.sum / rates[cost.currency];
            const inTarget = inUSD * rates[targetCurrency];

            // Initialize the category bucket if it does not yet exist
            if (!categoryTotals[cost.category]) {
                categoryTotals[cost.category] = 0;
            }
            categoryTotals[cost.category] += inTarget;
        });

        // Transform category totals object into array of objects for chart rendering
        const result = Object.entries(categoryTotals).map(([category, total]) => ({
            category,
            total: parseFloat(total.toFixed(2))
        }));

        // Return formatted category breakdown data with metadata
        return {
            year,
            month,
            currency: targetCurrency,
            data: result
        };
    },

    // Compiles an annual summary by iterating over costs and grouping them by month
    getAnnualReport: (year, targetCurrency = "USD") => {

        // Prevent calculations with undefined rates
        if (!cachedRates) {
            throw new Error("Exchange rates are still loading, please try again in a moment.");
        }
        
        const rates = cachedRates;
        // Verify the conversion target is supported
        if (!rates[targetCurrency]) throw new Error("Invalid target currency");

        if (isNaN(year)) throw new Error("Invalid year");

        const storedData = localStorage.getItem("costs");
        // Safely parse local storage or fallback to empty state
        const allCosts = storedData ? JSON.parse(storedData) : [];

        // Filter out costs outside the requested year
        const filteredCosts = allCosts.filter(cost => {
            const date = new Date(cost.createdAt);
            return date.getFullYear() === year;
        });

        const monthlyTotals = {};
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Pre-fill all 12 months to ensure continuous chart rendering even with empty months
        monthNames.forEach((name, index) => {
            monthlyTotals[index + 1] = { month: name, total: 0 };
        });

        // Distribute each filtered cost into its corresponding monthly bucket
        filteredCosts.forEach(cost => {
            const date = new Date(cost.createdAt);
            const month = date.getMonth() + 1;

            // Normalize currency to base USD then to target to handle cross-rates
            const inUSD = cost.sum / rates[cost.currency];
            const inTarget = inUSD * rates[targetCurrency];
            
            monthlyTotals[month].total += inTarget;
        });

        // Flatten the month dictionary into an array suitable for graph consumption
        const result = Object.values(monthlyTotals).map(item => ({
            ...item,
            total: parseFloat(item.total.toFixed(2))
        }));

        // Return standardized annual payload
        return {
            year,
            currency: targetCurrency,
            data: result
        };
    }
        };
    }
};

// Export db object as ES6 module for import in React components
export { db };

// Also attach to global window object for backward compatibility with non-module scripts
if (typeof window !== 'undefined') {
    window.db = db;
}