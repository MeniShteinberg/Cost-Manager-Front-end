import React, { useState } from 'react';
import { Box, TextField, Button, MenuItem, Typography, Paper } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { db } from '../db';

const CURRENCY_SYMBOLS = {
    'USD': '$',
    'ILS': '₪',
    'GBP': '£',
    'EURO': '€'
};

const AnnualReport = () => {
    // Report parameters
    const [params, setParams] = useState({
        year: new Date().getFullYear(),
        currency: 'USD'
    });

    // State for annual data
    const [annualData, setAnnualData] = useState(null);

    // Update parameters when the user changes something in the form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setParams({ ...params, [name]: value });
    };

    // Function to generate the report
    const handleGenerateReport = async () => {
        try {
            const myDb = db.openCostsDB();
            const result = await myDb.getAnnualReport(
                Number(params.year),
                params.currency
            );
            setAnnualData(result);
        } catch (error) {
            console.error("Failed to generate annual report", error);
        }
    };

    // Calculate the total for the year
    const calculateYearTotal = () => {
        if (!annualData || !annualData.data) return 0;
        return annualData.data.reduce((sum, month) => sum + month.total, 0).toFixed(2);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6">Your Annual Overview</Typography>

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
                    Show Overview
                </Button>
            </Box>

            {/* Bar chart - annual overview */}
            {annualData && (
                <Box sx={{ mt: 2 }}>
                    
                    {/* Total for the year summary */}
                    <Paper sx={{ p: 2, mb: 2, backgroundColor: '#d2dbe1'}}>
                        <Typography variant="h6">
                            Total for {annualData.year}: {CURRENCY_SYMBOLS[annualData.currency]}{calculateYearTotal()}
                        </Typography>
                    </Paper>

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
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis 
                                    tickFormatter={(value) => `${CURRENCY_SYMBOLS[annualData.currency]}${value}`}
                                />
                                <Tooltip 
                                    formatter={(value) => [`${CURRENCY_SYMBOLS[annualData.currency]}${value}`, 'Total']}
                                    labelFormatter={(label) => `Month: ${label}`}
                                />
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
