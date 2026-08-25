import React, { useState } from 'react';
import {
    Box, TextField, Button, MenuItem, Typography,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { db } from '../db';

// Define colors for the pie chart
const COLORS = ['#64748b', '#44b9eb', '#41c796', '#fbbf24', '#f47f7f', '#a78bfa'];

// Currency symbols for display
const CURRENCY_SYMBOLS = {
    'USD': '$',
    'ILS': '₪',
    'GBP': '£',
    'EURO': '€'
};

const MonthlyReport = () => {
    // 1. Define state for the search parameters
    const [params, setParams] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        currency: 'USD'
    });

    // 2. State for report results
    const [reportData, setReportData] = useState(null);
    
    // 3. State for pie chart data (categories)
    const [categoryData, setCategoryData] = useState(null);

    // Update parameters when the user changes something in the form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setParams({ ...params, [name]: value });
    };

    // 4. Function to generate the report
    const handleGenerateReport = async () => {
        try {
            // Call the getReport function we created in db.js
            const result = await db.getReport(
                params.currency,
                Number(params.year),
                Number(params.month)
            );
            setReportData(result);
            
            // Retrieve category data for the pie chart
            const categoryResult = await db.getCostsByCategory(
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
            <Typography variant="h6">Your Monthly Report</Typography>

            {/* Parameter selection row */}
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

            {/* Show the table only if there is data */}
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
                                        <TableCell>{cost.date.day}</TableCell>
                                        <TableCell>{cost.category}</TableCell>
                                        <TableCell>{cost.description}</TableCell>
                                        <TableCell align="right">{cost.sum} {cost.currency}</TableCell>
                                    </TableRow>
                                ))}
                                {/* Final summary row */}
                                <TableRow sx={{ backgroundColor: '#d2dbe1' }}>
                                    <TableCell colSpan={3} sx={{ fontWeight: 'bold' }}>Total (in {reportData.total.currency})</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                        {CURRENCY_SYMBOLS[reportData.total.currency]}{reportData.total.sum}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* Pie chart - costs by category */}
            {categoryData && categoryData.data.length > 0 && (
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Category Breakdown {categoryData.month}/{categoryData.year}
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

            {/* Message when there is no data */}
            {categoryData && categoryData.data.length === 0 && (
                <Typography color="textSecondary" sx={{ mt: 2 }}>
                    No costs found for this month.
                </Typography>
            )}
        </Box>
    );
};

export default MonthlyReport;
