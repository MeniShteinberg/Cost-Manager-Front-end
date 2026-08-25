import React, { useState } from 'react';
// Import MUI components from the library
import { TextField, Button, MenuItem, Box, Alert, Typography } from '@mui/material';
import { db } from '../db'; // Import our database layer

const AddCostForm = () => {
    // Create state to manage form fields (React Standard)
    const [cost, setCost] = useState({
        sum: '',
        currency: 'USD',
        category: 'FOOD',
        description: ''
    });

    const [status, setStatus] = useState(null); // Show success/error message

    // Update state whenever the user types something
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCost({ ...cost, [name]: value });
    };

    // Submit function
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent page refresh

        if (Number(cost.sum) <= 0) {
            setStatus({ type: 'error', msg: 'Sum must be a positive number.' });
            return;
        }

        try {
            // Call the addCost function we created in db.js
            const myDb = db.openCostsDB();
            await myDb.addCost(cost);
            setStatus({ type: 'success', msg: 'Cost added successfully!' });
            // Reset the form
            setCost({ sum: '', currency: 'USD', category: 'FOOD', description: '' });
        } catch (error) {
            setStatus({ type: 'error', msg: 'Failed to add cost.' });
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h6">Add New Cost</Typography>
            {/* Amount field - use type="number" to ensure numeric input */}
            <TextField
                label="Sum"
                name="sum"
                type="number"
                value={cost.sum}
                onChange={handleChange}
                required
                fullWidth
            />

            {/* Currency selection field - Dropdown (Select) */}
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

            {/* Category selection field */}
            <TextField
                select
                label="Category"
                name="category"
                value={cost.category}
                onChange={handleChange}
                fullWidth
            >
                {['FOOD', 'HEALTH', 'HOUSING', 'SPORT', 'EDUCATION', 'TRANSPORTATION'].map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
            </TextField>

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

            <Button type="submit" variant="contained" color="primary" size="large">
                Add Cost
            </Button>

            {/* Show a message to the user if it succeeded or failed */}
            {status && <Alert severity={status.type}>{status.msg}</Alert>}
        </Box>
    );
};

export default AddCostForm;