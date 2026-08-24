import React, { useState } from 'react';
import { Container, Typography, Box, Paper, Tabs, Tab } from '@mui/material';
import AddCostForm from './components/AddCostForm';
import MonthlyReport from './components/MonthlyReport';
import AnnualReport from './components/AnnualReport';
import Settings from './components/Settings';

function App() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Cost Manager
          </Typography>

          <Paper square>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab label="Add New Cost" />
              <Tab label="Monthly Report" />
              <Tab label="Annual Report" />
              <Tab label="Settings" />
            </Tabs>
          </Paper>

          <Box sx={{ p: 3 }}>
            {tabValue === 0 && <AddCostForm />}
            {tabValue === 1 && <MonthlyReport />}
            {tabValue === 2 && <AnnualReport />}
            {tabValue === 3 && <Settings />} {/* השורה ששאלת עליה */}
          </Box>
        </Box>
      </Container>
  );
}

export default App;