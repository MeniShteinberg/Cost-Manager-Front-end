// Import React hooks and Material-UI components for form handling
import React, { useState } from 'react';
// MUI components provide accessible, styled form elements and feedback
import { TextField, Button, MenuItem, Box, Alert, Typography } from '@mui/material';
// Database layer handles cost persistence and validation
import { db } from '../db';

/* 
 * Add Cost Form Component: Captures user input for new expense entries.\n * Validates data before storing and provides user feedback on success/failure.
 */
const AddCostForm = () => {
    // State object tracks all form field values for a new cost record
    const [cost, setCost] = useState({
        sum: '',
        currency: 'USD',
        category: 'FOOD',
        description: ''
    });

    // Track form submission feedback (success or error message display)
    const [status, setStatus] = useState(null);

    // Update specific cost field when user types in any input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCost({ ...cost, [name]: value });
    };

    // Validate and submit form data to database
    const handleSubmit = (e) => {
        e.preventDefault();

        // Ensure amount is positive to prevent invalid cost entries
        if (Number(cost.sum) <= 0) {
            setStatus({ type: 'error', msg: 'Sum must be a positive number.' });
            return;
        }

        try {
            // Create database instance and add the cost record
            const myDb = db.openCostsDB();
            myDb.addCost(cost);
            // Show success feedback to user
            setStatus({ type: 'success', msg: 'Cost added successfully!' });
            // Clear form fields for next entry
            setCost({ sum: '', currency: 'USD', category: 'FOOD', description: '' });
        } catch (error) {
            // Display error if database operation fails
            setStatus({ type: 'error', msg: 'Failed to add cost.' });
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Form title */}
            <Typography variant="h6">Add New Cost</Typography>
            {/* Amount field - type="number" ensures numeric input only */}
            <TextField
                label="Sum"
                name="sum"
                type="number"
                value={cost.sum}
                onChange={handleChange}
                required
                fullWidth
            />

            {/* Currency dropdown - user selects denomination for the expense */}
            <TextField
                select
                label="Currency"
                name="currency"
                value={cost.currency}
                onChange={handleChange}
                fullWidth
            >
                {['USD', 'ILS', 'GBP', 'EURO'].map((curr) => (
                    <MenuItem key={curr} value={curr}>{curr}</MenuItem>
                ))}
            </TextField>

            {/* Category selection - organizes expenses for reporting and analysis */}
            <TextField
                select
                label="Category"
                name="category"
                value={cost.category}
                onChange={handleChange}
                fullWidth
            >
                {['FOOD', 'HEALTH', 'HOUSING', 'EDUCATION', 'CAR', 'OTHER'].map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
            </TextField>

            {/* Description field - allows user to add details about the cost */}
            <TextField
                label="Description"
                name="description"
                value={cost.description}
                onChange={handleChange}
                multiline
                rows={2}
                required
                fullWidth
            />

            {/* Submit button to save the cost to database */}
            <Button type="submit" variant="contained" color="primary" size="large">
                Add Cost
            </Button>

            {/* Display feedback message from form submission attempt */}
            {status && <Alert severity={status.type}>{status.msg}</Alert>}
        </Box>
    );
};

export default AddCostForm;