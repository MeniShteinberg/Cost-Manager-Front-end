import React, { useState } from 'react';
// ייבוא הרכיבים מהספרייה של MUI
import { TextField, Button, MenuItem, Box, Alert } from '@mui/material';
import { idb } from '../idb'; // ייבוא בסיס הנתונים שלנו

const AddCostForm = () => {
    // יצירת State לניהול השדות בטופס (React Standard)
    const [cost, setCost] = useState({
        sum: '',
        currency: 'USD',
        category: 'FOOD',
        description: ''
    });

    const [status, setStatus] = useState(null); // להצגת הודעת הצלחה/שגיאה

    // פונקציה שמתעדכנת בכל פעם שהמשתמש מקליד משהו
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCost({ ...cost, [name]: value });
    };

    // פונקציית השליחה
    const handleSubmit = async (e) => {
        e.preventDefault(); // מניעת ריענון הדף
        try {
            // קריאה לפונקציית ה-addCost שבנינו ב-idb.js
            await idb.addCost(cost);
            setStatus({ type: 'success', msg: 'Cost added successfully!' });
            // איפוס הטופס
            setCost({ sum: '', currency: 'USD', category: 'FOOD', description: '' });
        } catch (error) {
            setStatus({ type: 'error', msg: 'Failed to add cost.' });
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* שדה סכום - משתמשים ב-type="number" לוודא שהקלט מספרי */}
            <TextField
                label="Sum"
                name="sum"
                type="number"
                value={cost.sum}
                onChange={handleChange}
                required
                fullWidth
            />

            {/* שדה בחירת מטבע - Dropdown (Select) */}
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

            {/* שדה בחירת קטגוריה */}
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
                fullWidth
            />

            <Button type="submit" variant="contained" color="primary" size="large">
                Add Cost
            </Button>

            {/* הצגת הודעה למשתמש אם הצליח או נכשל */}
            {status && <Alert severity={status.type}>{status.msg}</Alert>}
        </Box>
    );
};

export default AddCostForm;