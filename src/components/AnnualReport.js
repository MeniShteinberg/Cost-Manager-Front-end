// Import React hooks and Material-UI components for layout and forms
import React, { useState } from 'react';
import { Box, TextField, Button, MenuItem, Typography, Paper } from '@mui/material';
// Import Recharts for rendering bar chart visualization
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { db } from '../db';

// Map currency codes to their display symbols for formatting
const CURRENCY_SYMBOLS = {
    'USD': '$',
    'ILS': '₪',
    'GBP': '£',
    'EURO': '€'
};

/* 
 * Annual Report Component: Generates and visualizes yearly cost summaries with monthly breakdown.
 * Allows users to select year and currency, displays totals in a bar chart.
 */
const AnnualReport = () => {
    // Store report generation parameters (year and display currency)
    const [params, setParams] = useState({
        year: new Date().getFullYear(),
        currency: 'USD'
    });

    // Cache the generated annual report data from the database
    const [annualData, setAnnualData] = useState(null);

    // Update parameters when user changes form inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setParams({ ...params, [name]: value });
    };

    // Generate annual report by calling database getAnnualReport function
    const handleGenerateReport = () => {
        try {
            // Get fresh database instance and retrieve annual data
            const myDb = db.openCostsDB();
            const result = myDb.getAnnualReport(
                Number(params.year),
                params.currency
            );
            // Store result in state for rendering
            setAnnualData(result);
        } catch (error) {
            console.error("Failed to generate annual report", error);
        }
    };

    // Calculate total expenses for the entire year
    const calculateYearTotal = () => {
        if (!annualData || !annualData.data) return 0;
        // Sum all monthly totals
        return annualData.data.reduce((sum, month) => sum + month.total, 0).toFixed(2);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Component title */}
            <Typography variant="h6">Your Annual Overview</Typography>

            {/* Form section for selecting year and currency */}
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

                {/* Currency dropdown to select conversion currency */}
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
                <Button variant="contained" onClick={handleGenerateReport}>
                    Show Overview
                </Button>
            </Box>

            {/* Display chart only when data is available */}
            {annualData && (
                <Box sx={{ mt: 2 }}>
                    {/* Summary card showing total expenses for the year */}
                    <Paper sx={{ p: 2, mb: 2, backgroundColor: '#d2dbe1'}}>
                        <Typography variant="h6">
                            Total for {annualData.year}: {CURRENCY_SYMBOLS[annualData.currency]}{calculateYearTotal()}
                        </Typography>
                    </Paper>

                    {/* Bar chart visualization of monthly costs */}
                    <Paper sx={{ p: 2 }}>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                                data={annualData.data}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                {/* Chart gridlines for readability */}
                                <CartesianGrid strokeDasharray="3 3" />
                                {/* X-axis displays month names */}
                                <XAxis dataKey="month" />
                                {/* Y-axis displays amounts with currency symbol */}
                                <YAxis 
                                    tickFormatter={(value) => `${CURRENCY_SYMBOLS[annualData.currency]}${value}`}
                                />
                                {/* Tooltip shows detailed amount on hover */}
                                <Tooltip 
                                    formatter={(value) => [`${CURRENCY_SYMBOLS[annualData.currency]}${value}`, 'Total']}
                                    labelFormatter={(label) => `Month: ${label}`}
                                />
                                {/* Bar representation of monthly totals */}
                                <Bar 
                                    dataKey="total"
                                    fill="#1976d2" 
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Box>
            )}
        </Box>
    );
};

export default AnnualReport;
