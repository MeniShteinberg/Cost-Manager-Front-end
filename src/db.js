
const DEFAULT_RATES_URL = "https://raw.githubusercontent.com/MeniShteinberg/Cost-Manager-Front-end/refs/heads/main/public/exchange-rates.json";

/**
 * Fetches exchange rates from a user-defined URL or falls back to the default
 * @returns {Promise<Object>} Exchange rate object
 */
async function getExchangeRates() {
    const userUrl = localStorage.getItem("currency_url");

    if (userUrl) {
        try {
            const response = await fetch(userUrl);
            if (response.ok) {
                return await response.json();
            }
        } catch (e) {
            console.error("Failed to fetch rates from the user URL, trying default");
        }
    }

    const response = await fetch(DEFAULT_RATES_URL);
    return await response.json();
}

const db = {

    getExchangeRates: getExchangeRates,

    openCostsDB: function(databaseName = "costsdb", databaseVersion = 1) {
        return {

    /**
     * Adds a new cost record to the database
     * @param {Object} cost - Cost object with amount, currency, category, and description
     * @returns {Promise<Object>} Added cost item
     */
    addCost: async (cost) => {
        const numericSum = Number(cost.sum);
        if (numericSum <= 0 || isNaN(numericSum)) {
            return Promise.reject("Error: Sum must be a positive number.");
        }

        const storedData = localStorage.getItem("costs");
        const allCosts = storedData ? JSON.parse(storedData) : [];

        const item = {
            id: new Date().getTime(),
            sum: Number(cost.sum),
            currency: String(cost.currency),
            category: String(cost.category),
            description: String(cost.description),
            createdAt: new Date().getTime()
        };

        allCosts.push(item);
        localStorage.setItem("costs", JSON.stringify(allCosts));

        return item;
    },

    /**
     * Gets a monthly report of costs
     * @param {number} year - The year to filter by
     * @param {number} month - The month to filter by (1-12)
     * @param {string} targetCurrency - Currency to convert amounts into
     * @returns {Promise<Object>} Report with costs and totals
     */
    getReport: async (targetCurrency = "USD", year = new Date().getFullYear(), month = new Date().getMonth() + 1) => {
        const rates = await getExchangeRates();
        const storedData = localStorage.getItem("costs");
        const allCosts = storedData ? JSON.parse(storedData) : [];

        const filteredCosts = allCosts.filter(cost => {
            const date = new Date(cost.createdAt);
            return date.getFullYear() === year && (date.getMonth() + 1) === month;
        });

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
        filteredCosts.forEach(cost => {
            const inUSD = cost.sum / rates[cost.currency];
            const inTarget = inUSD * rates[targetCurrency];
            total += inTarget;
        });

        return {
            year,
            month,
            costs: processedCosts,
            total: { currency: targetCurrency, sum: parseFloat(total.toFixed(2)) }
        };
    },

    /**
     * Gets costs grouped by category for a specific month
     * @param {number} year - The year to filter by
     * @param {number} month - The month to filter by (1-12)
     * @param {string} targetCurrency - Currency to convert amounts into
     * @returns {Promise<Object>} Category summary data
     */
    getCostsByCategory: async (year, month, targetCurrency = "USD") => {
        const rates = await getExchangeRates();
        const storedData = localStorage.getItem("costs");
        const allCosts = storedData ? JSON.parse(storedData) : [];

        const filteredCosts = allCosts.filter(cost => {
            const date = new Date(cost.createdAt);
            return date.getFullYear() === year && (date.getMonth() + 1) === month;
        });

        const categoryTotals = {};
        filteredCosts.forEach(cost => {
            const inUSD = cost.sum / rates[cost.currency];
            const inTarget = inUSD * rates[targetCurrency];

            if (!categoryTotals[cost.category]) {
                categoryTotals[cost.category] = 0;
            }
            categoryTotals[cost.category] += inTarget;
        });

        const result = Object.entries(categoryTotals).map(([category, total]) => ({
            category,
            total: parseFloat(total.toFixed(2))
        }));

        return {
            year,
            month,
            currency: targetCurrency,
            data: result
        };
    },

    /**
     * Gets an annual report with monthly totals
     * @param {number} year - The year to generate the report for
     * @param {string} targetCurrency - Currency to convert amounts into
     * @returns {Promise<Object>} Annual data with monthly details
     */
    getAnnualReport: async (year, targetCurrency = "USD") => {
        const rates = await getExchangeRates();
        const storedData = localStorage.getItem("costs");
        const allCosts = storedData ? JSON.parse(storedData) : [];

        const filteredCosts = allCosts.filter(cost => {
            const date = new Date(cost.createdAt);
            return date.getFullYear() === year;
        });

        const monthlyTotals = {};
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        monthNames.forEach((name, index) => {
            monthlyTotals[index + 1] = { month: name, total: 0 };
        });

        filteredCosts.forEach(cost => {
            const date = new Date(cost.createdAt);
            const month = date.getMonth() + 1;

            const inUSD = cost.sum / rates[cost.currency];
            const inTarget = inUSD * rates[targetCurrency];
            
            monthlyTotals[month].total += inTarget;
        });

        const result = Object.values(monthlyTotals).map(item => ({
            ...item,
            total: parseFloat(item.total.toFixed(2))
        }));

        return {
            year,
            currency: targetCurrency,
            data: result
        };
    }
        };
    }
};

// Export ES6 module (for React and modern bundlers)
export { db };

// Attach to window for vanilla JavaScript usage (script tags)
if (typeof window !== 'undefined') {
    window.db = db;
}
