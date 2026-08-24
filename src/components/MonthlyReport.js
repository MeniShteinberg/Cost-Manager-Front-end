import React, { useState } from 'react';
import {
    Box, TextField, Button, MenuItem, Typography,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { idb } from '../idb';

// הגדרת צבעים לגרף העוגה
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// סמלי מטבעות להצגה
const CURRENCY_SYMBOLS = {
    'USD': '$',
    'ILS': '₪',
    'GBP': '£',
    'EURO': '€'
};

const MonthlyReport = () => {
    // 1. הגדרת מצב (State) עבור הפרמטרים של החיפוש
    const [params, setParams] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        currency: 'USD'
    });

    // 2. מצב עבור תוצאות הדוח
    const [reportData, setReportData] = useState(null);
    
    // 3. מצב עבור נתוני גרף העוגה (קטגוריות)
    const [categoryData, setCategoryData] = useState(null);

    // עדכון הפרמטרים כשהמשתמש משנה משהו בטופס
    const handleChange = (e) => {
        const { name, value } = e.target;
        setParams({ ...params, [name]: value });
    };

    // 4. פונקציה להפעלת הדוח
    const handleGenerateReport = async () => {
        try {
            // קריאה לפונקציית ה-getReport שבנינו ב-idb.js
            const result = await idb.getReport(
                Number(params.year),
                Number(params.month),
                params.currency
            );
            setReportData(result);
            
            // קבלת נתוני קטגוריות לגרף העוגה
            const categoryResult = await idb.getCostsByCategory(
                Number(params.year),
                Number(params.month),
                params.currency
            );
            setCategoryData(categoryResult);
        } catch (error) {
            console.error("Failed to generate report", error);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6">Generate Monthly Report</Typography>

            {/* שורת בחירת הפרמטרים */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                    label="Year"
                    name="year"
                    type="number"
                    value={params.year}
                    onChange={handleChange}
                    sx={{ width: 100 }}
                />

                <TextField
                    select
                    label="Month"
                    name="month"
                    value={params.month}
                    onChange={handleChange}
                    sx={{ width: 120 }}
                >
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                        <MenuItem key={m} value={m}>{m}</MenuItem>
                    ))}
                </TextField>

                <TextField
                    select
                    label="View in Currency"
                    name="currency"
                    value={params.currency}
                    onChange={handleChange}
                    sx={{ width: 150 }}
                >
                    {['USD', 'ILS', 'GBP', 'EURO'].map(curr => (
                        <MenuItem key={curr} value={curr}>{curr}</MenuItem>
                    ))}
                </TextField>

                <Button variant="contained" onClick={handleGenerateReport}>
                    Show Report
                </Button>
            </Box>

            {/* הצגת הטבלה רק אם יש נתונים */}
            {reportData && (
                <Box>
                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell>Day</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reportData.costs.map((cost, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{cost.date}</TableCell>
                                        <TableCell>{cost.category}</TableCell>
                                        <TableCell>{cost.description}</TableCell>
                                        <TableCell align="right">{cost.sum} {cost.currency}</TableCell>
                                    </TableRow>
                                ))}
                                {/* שורת סיכום סופי */}
                                <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                                    <TableCell colSpan={3} sx={{ fontWeight: 'bold' }}>Total Cost (in {reportData.total.currency})</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                        {CURRENCY_SYMBOLS[reportData.total.currency]}{reportData.total.total}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* גרף עוגה - עלויות לפי קטגוריה */}
            {categoryData && categoryData.data.length > 0 && (
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Costs by Category - {categoryData.month}/{categoryData.year}
                    </Typography>
                    <Paper sx={{ p: 2 }}>
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={categoryData.data}
                                    dataKey="total"
                                    nameKey="category"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={120}
                                    label={({ category, total }) => 
                                        `${category}: ${CURRENCY_SYMBOLS[categoryData.currency]}${total}`
                                    }
                                >
                                    {categoryData.data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value) => `${CURRENCY_SYMBOLS[categoryData.currency]}${value}`}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Box>
            )}

            {/* הודעה כאשר אין נתונים */}
            {categoryData && categoryData.data.length === 0 && (
                <Typography color="textSecondary" sx={{ mt: 2 }}>
                    No costs found for this month.
                </Typography>
            )}
        </Box>
    );
};

export default MonthlyReport;
