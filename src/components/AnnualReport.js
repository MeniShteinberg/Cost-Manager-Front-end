import React, { useState } from 'react';
import { Box, TextField, Button, MenuItem, Typography, Paper } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { idb } from '../idb';

const CURRENCY_SYMBOLS = {
    'USD': '$',
    'ILS': '₪',
    'GBP': '£',
    'EURO': '€'
};

const AnnualReport = () => {
    // פרמטרים של הדוח
    const [params, setParams] = useState({
        year: new Date().getFullYear(),
        currency: 'USD'
    });

    // מצב עבור נתוני שנה
    const [annualData, setAnnualData] = useState(null);

    // עדכון הפרמטרים כשהמשתמש משנה משהו בטופס
    const handleChange = (e) => {
        const { name, value } = e.target;
        setParams({ ...params, [name]: value });
    };

    // פונקציה להפעלת הדוח
    const handleGenerateReport = async () => {
        try {
            const result = await idb.getAnnualReport(
                Number(params.year),
                params.currency
            );
            setAnnualData(result);
        } catch (error) {
            console.error("Failed to generate annual report", error);
        }
    };

    // חישוב סך הכל לשנה
    const calculateYearTotal = () => {
        if (!annualData || !annualData.data) return 0;
        return annualData.data.reduce((sum, month) => sum + month.total, 0).toFixed(2);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6">Annual Overview</Typography>

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

            {/* גרף עוגה - סקירה שנתית */}
            {annualData && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Monthly Costs for {annualData.year} (in {annualData.currency})
                    </Typography>
                    
                    {/* סיכום סך הכל לשנה */}
                    <Paper sx={{ p: 2, mb: 2, backgroundColor: '#e3f2fd' }}>
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
                                <Legend />
                                <Bar 
                                    dataKey="total" 
                                    name="Monthly Cost" 
                                    fill="#1976d2" 
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>

                    {/* טבלת פירוט חודשי */}
                    <Paper sx={{ p: 2, mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Monthly Breakdown
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
                            {annualData.data.map((item) => (
                                <Box 
                                    key={item.month} 
                                    sx={{ 
                                        p: 1.5, 
                                        backgroundColor: item.total > 0 ? '#f5f5f5' : '#fafafa',
                                        borderRadius: 1,
                                        textAlign: 'center'
                                    }}
                                >
                                    <Typography variant="body2" color="textSecondary">
                                        {item.month}
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {CURRENCY_SYMBOLS[annualData.currency]}{item.total}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Box>
            )}
        </Box>
    );
};

export default AnnualReport;
