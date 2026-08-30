// Import React hooks and Material-UI components for table and layout
import React, { useState } from 'react';
import {
    Box, TextField, Button, MenuItem, Typography,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
// Import Recharts for pie chart visualization of category breakdown
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { db } from '../db';

// Array of colors used to differentiate categories in pie chart visualization
const COLORS = ['#64748b', '#44b9eb', '#41c796', '#fbbf24', '#f47f7f', '#a78bfa'];

// Map currency codes to their unicode symbols for display formatting
const CURRENCY_SYMBOLS = {
    'USD': '$',
    'ILS': '₪',
    'GBP': '£',
    'EURO': '€'
};

/* 
 * Monthly Report Component: Displays costs for a selected month/year in table and pie chart.
 * Provides month/year/currency selection with detailed breakdown by category.
 */
const MonthlyReport = () => {
    // Store month selection parameters and currency preference
    const [params, setParams] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        currency: 'USD'
    });

    // Cache monthly report data (individual cost records and totals)
    const [reportData, setReportData] = useState(null);
    
    // Cache category breakdown data for pie chart visualization
    const [categoryData, setCategoryData] = useState(null);

    // Update report parameters when user changes form inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setParams({ ...params, [name]: value });
    };

    // Generate both table and pie chart data for the selected month
    const handleGenerateReport = () => {
        try {
            // Query database for monthly costs and category totals
            const myDb = db.openCostsDB();
            const result = myDb.getReport(
                params.currency,
                Number(params.year),
                Number(params.month)
            );
            // Store report data in state for table rendering
            setReportData(result);
            
            // Retrieve category totals for pie chart visualization
            const categoryResult = myDb.getCostsByCategory(
                Number(params.year),
                Number(params.month),
                params.currency
            );
            // Store category breakdown in state for chart rendering
            setCategoryData(categoryResult);
        } catch (error) {
            console.error("Failed to generate report", error);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Section title */}
            <Typography variant="h6">Your Monthly Report</Typography>

            {/* Form controls for selecting year, month, and display currency */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {/* Year input field */}
                <TextField
                    label="Year"
                    name="year"
                    type="number"
                    value={params.year}
                    onChange={handleChange}
                    sx={{ width: 100 }}
                />

                {/* Month dropdown selection (1-12) */}
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

                {/* Currency selection to control report display currency */}
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

                {/* Button to trigger report generation */}
                <Button variant="contained\" onClick={handleGenerateReport}>
                    Show Report
                </Button>
            </Box>

            {/* Display cost table only when report data exists */}
            {reportData && (
                <Box>
                    {/* Table container with monthly cost details */}
                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                        <Table>
                            {/* Table header row with column labels */}
                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell>Day</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            {/* Table body displaying individual cost records */}
                            <TableBody>
                                {reportData.costs.map((cost, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{cost.date.day}</TableCell>
                                        <TableCell>{cost.category}</TableCell>
                                        <TableCell>{cost.description}</TableCell>
                                        <TableCell align="right">{cost.sum} {cost.currency}</TableCell>
                                    </TableRow>
                                ))}
                                {/* Final summary row with total amount */}
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

            {/* Pie chart visualization of costs by category */}
            {categoryData && categoryData.data.length > 0 && (
                <Box sx={{ mt: 4 }}>
                    {/* Chart title with month and year */}
                    <Typography variant="h6" gutterBottom>
                        Category Breakdown {categoryData.month}/{categoryData.year}
                    </Typography>
                    {/* Chart container with visual styling */}
                    <Paper sx={{ p: 2 }}>
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                {/* Pie chart data, colors, and labels */}
                                <Pie
                                    data={categoryData.data}
                                    dataKey="total"
                                    nameKey="category"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={120}
                                    // Label formatter shows category name and amount
                                    label={({ category, total }) => 
                                        `${category}: ${CURRENCY_SYMBOLS[categoryData.currency]}${total}`
                                    }
                                >
                                    {/* Color each slice differently based on category */}
                                    {categoryData.data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                {/* Hover tooltip shows category total */}
                                <Tooltip 
                                    formatter={(value) => `${CURRENCY_SYMBOLS[categoryData.currency]}${value}`}
                                />
                                {/* Legend displays all category names */}
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Box>
            )}

            {/* Show message when no costs exist for the selected month */}
            {categoryData && categoryData.data.length === 0 && (
                <Typography color="textSecondary" sx={{ mt: 2 }}>
                    No costs found for this month.
                </Typography>
            )}
        </Box>
    );
};

export default MonthlyReport;
