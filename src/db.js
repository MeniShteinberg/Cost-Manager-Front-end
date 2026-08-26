
const DEFAULT_RATES_URL = "https://raw.githubusercontent.com/MeniShteinberg/Cost-Manager-Front-end/refs/heads/main/public/exchange-rates.json";


let cachedRates = null;

async function fetchExchangeRates() {
    const userUrl = localStorage.getItem("currency_url");
    try {
        if (userUrl) {
            const response = await fetch(userUrl);
            if (response.ok) {
                cachedRates = await response.json();
                return;
            }
        }

        const defaultResponse = await fetch(DEFAULT_RATES_URL);
        if (defaultResponse.ok) {
            cachedRates = await defaultResponse.json();
        }
    } catch (e) {
        console.error("Failed to fetch rates, keeping existing cached rates.");
    }
}

fetchExchangeRates();
setInterval(fetchExchangeRates, 1000 * 60 * 60);

const db = {

    refreshRates: fetchExchangeRates,

    openCostsDB: function(databaseName = "costsdb", databaseVersion = 1) {

        if (isNaN(databaseVersion)) {
            throw new Error("Invalid database version");
        }

        return {

    /**
     * Adds a new cost record to the database
     * @param {Object} cost - Cost object with amount, currency, category, and description
     * @returns {Promise<Object>} Added cost item
     */
    addCost: (cost) => {

        if (!cost || !cost.sum || !cost.currency || !cost.category || !cost.description) {
            throw new Error("Error: Missing required cost fields.");
        }

        const numericSum = Number(cost.sum);
        if (numericSum <= 0 || isNaN(numericSum)) {
            throw new Error("Error: Sum must be a positive number.");
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
    getReport: (targetCurrency = "USD", year = new Date().getFullYear(), month = new Date().getMonth() + 1) => {
        const rates = cachedRates;

        if (!rates[targetCurrency]) throw new Error("Invalid target currency");

        if (isNaN(year)) throw new Error("Invalid year");

        if (isNaN(month) || month < 1 || month > 12) throw new Error("Invalid month");
        
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
    getCostsByCategory: (year, month, targetCurrency = "USD") => {
        const rates = cachedRates;
        if (!rates[targetCurrency]) throw new Error("Invalid target currency");

        if (isNaN(year)) throw new Error("Invalid year");
        if (isNaN(month) || month < 1 || month > 12) throw new Error("Invalid month");

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
    getAnnualReport: (year, targetCurrency = "USD") => {
        const rates = cachedRates;
        if (!rates[targetCurrency]) throw new Error("Invalid target currency");

        if (isNaN(year)) throw new Error("Invalid year");

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
