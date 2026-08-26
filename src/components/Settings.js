import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import { db } from '../db';

const Settings = () => {
    const [url, setUrl] = useState('');
    const [status, setStatus] = useState(null);

    // Load the existing URL from browser storage on first load
    useEffect(() => {
        const savedUrl = localStorage.getItem('currency_url') || '';
        setUrl(savedUrl);
    }, []);

    const handleSave = () => {
        try {
            // Save to localStorage - it is preserved even if the page is refreshed
            localStorage.setItem('currency_url', url);
            db.refreshRates();

            setStatus({ type: 'success', msg: 'URL saved successfully!' });
        } catch (e) {
            setStatus({ type: 'error', msg: 'Failed to save URL' });
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            <Typography variant="h6">Change Settings</Typography>
            <Typography variant="body2" color="textSecondary">
                Enter the URL for getting currency exchange rates (in JSON format).
            </Typography>

            <TextField
                label="Paste the URL here"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                fullWidth
                placeholder="https://example.com/rates.json"
            />

            <Button variant="contained" onClick={handleSave} sx={{ width: 150 }}>
                Save
            </Button>

            {status && <Alert severity={status.type}>{status.msg}</Alert>}
        </Box>
    );
};

export default Settings;