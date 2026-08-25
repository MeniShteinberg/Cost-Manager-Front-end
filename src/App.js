import React, { useState } from 'react';
import { Container, Typography, Box, Paper, Tabs, Tab } from '@mui/material';
import AddCostForm from './components/AddCostForm';
import MonthlyReport from './components/MonthlyReport';
import AnnualReport from './components/AnnualReport';
import Settings from './components/Settings';
import SettingsIcon from '@mui/icons-material/Settings';

function App() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" align="center" sx={{ fontWeight: 700 }}>
            Smart Spend
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            My Personal Cost Manager
          </Typography>

          <Paper square>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab label="Add New Cost" />
              <Tab label="Monthly Report" />
              <Tab label="Annual Overview" />
              <Tab 
                icon={<SettingsIcon />} 
                iconPosition="start"
                sx={{ 
                    minHeight: 48,
                    '&.Mui-selected': {
                        color: 'primary.main',
                        fontWeight: 'bold',
                    }
                }} 
            />
            </Tabs>
          </Paper>

          <Box sx={{ p: 3 }}>
            {tabValue === 0 && <AddCostForm />}
            {tabValue === 1 && <MonthlyReport />}
            {tabValue === 2 && <AnnualReport />}
            {tabValue === 3 && <Settings />}
          </Box>
        </Box>
      </Container>
  );
}

export default App;