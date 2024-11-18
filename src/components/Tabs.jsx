import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import ImageAnalysis from './ImageAnalysis';
import DocumentAnalysis from './DocumentAnalysis';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ padding: '24px 0' }}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function AnalysisTabs() {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Image Analysis" />
          <Tab label="Document Analysis" />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <ImageAnalysis />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <DocumentAnalysis />
      </TabPanel>
    </Box>
  );
}

export default AnalysisTabs;
