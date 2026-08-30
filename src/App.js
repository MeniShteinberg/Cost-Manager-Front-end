// Import React hooks and Material-UI components for layout and navigation
import React, { useState } from 'react';
import { Container, Typography, Box, Paper, Tabs, Tab } from '@mui/material';
// Import feature components for each tab
import AddCostForm from './components/AddCostForm';
import MonthlyReport from './components/MonthlyReport';
import AnnualReport from './components/AnnualReport';
import Settings from './components/Settings';
// Import icon for the Settings tab
import SettingsIcon from '@mui/icons-material/Settings';

function App() {
  // Track which tab is currently active (0: Add Cost, 1: Monthly, 2: Annual, 3: Settings)
  const [tabValue, setTabValue] = useState(0);

  // Update active tab when user clicks on a different tab
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          {/* Application title and subtitle */}
          <Typography variant="h4" component="h1" align="center" sx={{ fontWeight: 700 }}>
            Smart Spend
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            My Personal Cost Manager
          </Typography>

          {/* Tab navigation bar with 4 main sections */}
          <Paper square>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab label="Add New Cost" />
              <Tab label="Monthly Report" />
              <Tab label="Annual Overview" />
              {/* Settings tab uses icon instead of text for compact display */}
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

          {/* Content area: conditionally render component based on active tab */}
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