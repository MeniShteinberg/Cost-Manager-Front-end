// src/idb.js
// מודול IndexedDB מאוחד - תומך גם בייבוא ES6 וגם בשימוש וניל JavaScript

const dbName = "costsdb";
const dbVersion = 1;

const DEFAULT_RATES_URL = "https://raw.githubusercontent.com/Sapeez/Cost-Manager-FED/master/public/exchange-rates.json";

/**
 * פותח את מסד הנתונים IndexedDB ויוצר חנויות אובייקטים אם נדרש
 * @returns {Promise<IDBDatabase>} מופע מסד הנתונים
 */
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("costs")) {
                db.createObjectStore("costs", { keyPath: "id", autoIncrement: true });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject("Error opening DB: " + event.target.error);
    });
}

/**
 * מביא שערי חליפין מכתובת URL מוגדרת על ידי המשתמש או מברירת מחדל
 * @returns {Promise<Object>} אובייקט שערי חליפין
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
            console.error("נכשל בהבאת שערים מכתובת המשתמש, מנסה ברירת מחדל");
        }
    }

    const response = await fetch(DEFAULT_RATES_URL);
    return await response.json();
}

/**
 * עטיפה ל-IndexedDB לפעולות ניהול עלויות
 */
const idb = {
    /**
     * מוסיף רשומת עלות חדשה למסד הנתונים
     * @param {Object} cost - אובייקט העלות עם סכום, מטבע, קטגוריה, תיאור
     * @returns {Promise<Object>} פריט העלות שנוסף
     */
    addCost: async (cost) => {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(["costs"], "readwrite");
            const store = transaction.objectStore("costs");

            const item = {
                sum: Number(cost.sum),
                currency: cost.currency,
                category: cost.category,
                description: cost.description,
                created_at: new Date().getTime() // שומרים Timestamp שיהיה קל למיין
            };

            const request = store.add(item);

            request.onsuccess = () => resolve(item);
            request.onerror = () => reject("Error adding cost");
        });
    },

    /**
     * מקבל דוח חודשי של עלויות
     * @param {number} year - השנה לסינון
     * @param {number} month - החודש לסינון (1-12)
     * @param {string} targetCurrency - המטבע להמרת הסכומים
     * @returns {Promise<Object>} דוח עם עלויות וסה"כ
     */
    getReport: async (year, month, targetCurrency = "USD") => {
        const db = await openDB();
        const rates = await getExchangeRates();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(["costs"], "readonly");
            const store = transaction.objectStore("costs");
            const request = store.getAll();

            request.onsuccess = () => {
                const allCosts = request.result;

                const filteredCosts = allCosts.filter(cost => {
                    const date = new Date(cost.created_at);
                    return date.getFullYear() === year && (date.getMonth() + 1) === month;
                });

                const processedCosts = filteredCosts.map(cost => {
                    return {
                        sum: cost.sum,
                        currency: cost.currency,
                        category: cost.category,
                        description: cost.description,
                        date: new Date(cost.created_at).getDate() // שומרים רק את היום בחודש
                    };
                });

                let total = 0;
                filteredCosts.forEach(cost => {
                    const inUSD = cost.sum / rates[cost.currency];
                    const inTarget = inUSD * rates[targetCurrency];
                    total += inTarget;
                });

                resolve({
                    year,
                    month,
                    costs: processedCosts,
                    total: { currency: targetCurrency, total: parseFloat(total.toFixed(2)) }
                });
            };

            request.onerror = () => reject("Error getting report");
        });
    },

    /**
     * מקבל עלויות מקובצות לפי קטגוריה עבור חודש מסוים
     * @param {number} year - השנה לסינון
     * @param {number} month - החודש לסינון (1-12)
     * @param {string} targetCurrency - המטבע להמרת הסכומים
     * @returns {Promise<Object>} נתוני סיכום קטגוריות
     */
    getCostsByCategory: async (year, month, targetCurrency = "USD") => {
        const db = await openDB();
        const rates = await getExchangeRates();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(["costs"], "readonly");
            const store = transaction.objectStore("costs");
            const request = store.getAll();

            request.onsuccess = () => {
                const allCosts = request.result;

                const filteredCosts = allCosts.filter(cost => {
                    const date = new Date(cost.created_at);
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

                resolve({
                    year,
                    month,
                    currency: targetCurrency,
                    data: result
                });
            };

            request.onerror = () => reject("Error getting category data");
        });
    },

    /**
     * מקבל דוח שנתי עם סיכומים חודשיים
     * @param {number} year - השנה לקבלת הדוח
     * @param {string} targetCurrency - המטבע להמרת הסכומים
     * @returns {Promise<Object>} נתונים שנתיים עם פירוט חודשי
     */
    getAnnualReport: async (year, targetCurrency = "USD") => {
        const db = await openDB();
        const rates = await getExchangeRates();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(["costs"], "readonly");
            const store = transaction.objectStore("costs");
            const request = store.getAll();

            request.onsuccess = () => {
                const allCosts = request.result;

                const filteredCosts = allCosts.filter(cost => {
                    const date = new Date(cost.created_at);
                    return date.getFullYear() === year;
                });

                const monthlyTotals = {};
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                monthNames.forEach((name, index) => {
                    monthlyTotals[index + 1] = { month: name, total: 0 };
                });

                filteredCosts.forEach(cost => {
                    const date = new Date(cost.created_at);
                    const month = date.getMonth() + 1;

                    const inUSD = cost.sum / rates[cost.currency];
                    const inTarget = inUSD * rates[targetCurrency];
                    
                    monthlyTotals[month].total += inTarget;
                });

                const result = Object.values(monthlyTotals).map(item => ({
                    ...item,
                    total: parseFloat(item.total.toFixed(2))
                }));

                resolve({
                    year,
                    currency: targetCurrency,
                    data: result
                });
            };

            request.onerror = () => reject("Error getting annual data");
        });
    }
};

// ייצוא מודול ES6 (עבור React ו-bundlers מודרניים)
export { idb };

// מצרף ל-window לשימוש JavaScript vanilla (תגיות script)
if (typeof window !== 'undefined') {
    window.idb = idb;
}
