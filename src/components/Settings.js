// Import React hooks and Material-UI components for form and messaging
import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import { db } from '../db';

/* 
 * Settings Component: Manages user-provided URL for custom exchange rates.
 * Allows users to override the default rates source for currency conversions.
 */
const Settings = () => {
    // Store the URL input by the user for custom exchange rates
    const [url, setUrl] = useState('');
    // Track success/error feedback from save operations
    const [status, setStatus] = useState(null);

    // Load saved URL from localStorage when component mounts for continuity
    useEffect(() => {
        const savedUrl = localStorage.getItem('currency_url') || '';
        setUrl(savedUrl);
    }, []);

    // Handle saving the custom URL and triggering rate refresh
    const handleSave = () => {
        try {
            // Persist URL to localStorage for use across app sessions
            localStorage.setItem('currency_url', url);
            // Immediately fetch new rates using the updated URL
            db.refreshRates();

            // Show success message to user for feedback
            setStatus({ type: 'success', msg: 'URL saved successfully!' });
        } catch (e) {
            // Handle and display errors during URL save
            setStatus({ type: 'error', msg: 'Failed to save URL' });
        }
    };

    // Render settings form with URL input and save button
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Section title and instructions */}
            <Typography variant="h6">Change Settings</Typography>
            <Typography variant="body2" color="textSecondary">
                Enter the URL for getting currency exchange rates (in JSON format).
            </Typography>

            {/* Input field for the custom exchange rates URL */}
            <TextField
                label="Paste the URL here"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                fullWidth
                placeholder="https://example.com/rates.json"
            />

            {/* Button to persist the URL and refresh rates */}
            <Button variant="contained" onClick={handleSave} sx={{ width: 150 }}>
                Save
            </Button>

            {/* Display success or error message after save attempt */}
            {status && <Alert severity={status.type}>{status.msg}</Alert>}
        </Box>
    );
};

export default Settings;