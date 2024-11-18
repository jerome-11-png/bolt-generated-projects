import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDropzone } from 'react-dropzone';

function DocumentAnalysis() {
  const [doc1, setDoc1] = useState(null);
  const [doc2, setDoc2] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const onDrop1 = (acceptedFiles) => {
    setDoc1(acceptedFiles[0]);
  };

  const onDrop2 = (acceptedFiles) => {
    setDoc2(acceptedFiles[0]);
  };

  const { getRootProps: getRootProps1, getInputProps: getInputProps1 } = useDropzone({
    onDrop: onDrop1,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  const { getRootProps: getRootProps2, getInputProps: getInputProps2 } = useDropzone({
    onDrop: onDrop2,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  const analyzeDocuments = async () => {
    if (!doc1 || !doc2) return;
    
    setAnalyzing(true);
    try {
      // Simulated analysis results
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setResults({
        textSimilarity: 0.85,
        structuralSimilarity: 0.92,
        differences: [
          { type: 'text', location: 'Page 1, Paragraph 2', details: 'Content modified' },
          { type: 'formatting', location: 'Page 2', details: 'Font size changed' },
          { type: 'structure', location: 'Page 3', details: 'New section added' }
        ],
        metadata: {
          doc1: {
            pages: 5,
            wordCount: 2500,
            created: '2023-11-15',
            modified: '2023-11-18'
          },
          doc2: {
            pages: 6,
            wordCount: 2750,
            created: '2023-11-15',
            modified: '2023-11-20'
          }
        }
      });
    } catch (error) {
      console.error('Document analysis failed:', error);
      setResults({ error: error.message });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom color="primary">
        Document Analysis
      </Typography>

      <Grid container spacing={3}>
        {/* Document Upload Section */}
        <Grid item xs={12} md={6}>
          <Paper {...getRootProps1()} elevation={3} sx={{ p: 2, textAlign: 'center' }}>
            <input {...getInputProps1()} />
            <Typography>
              {doc1 ? `Selected: ${doc1.name}` : 'Drop first document here'}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper {...getRootProps2()} elevation={3} sx={{ p: 2, textAlign: 'center' }}>
            <input {...getInputProps2()} />
            <Typography>
              {doc2 ? `Selected: ${doc2.name}` : 'Drop second document here'}
            </Typography>
          </Paper>
        </Grid>

        {/* Analysis Button */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={analyzeDocuments}
            disabled={!doc1 || !doc2 || analyzing}
            fullWidth
          >
            {analyzing ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                Analyzing Documents...
              </>
            ) : (
              'Compare Documents'
            )}
          </Button>
        </Grid>

        {/* Results Section */}
        {results && !results.error && (
          <>
            {/* Similarity Scores */}
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Similarity Analysis
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1">
                      Text Similarity: {(results.textSimilarity * 100).toFixed(1)}%
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1">
                      Structural Similarity: {(results.structuralSimilarity * 100).toFixed(1)}%
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Differences */}
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Detected Differences
                </Typography>
                <List>
                  {results.differences.map((diff, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemText
                          primary={diff.location}
                          secondary={`${diff.type}: ${diff.details}`}
                        />
                      </ListItem>
                      {index < results.differences.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Metadata Comparison */}
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Document Metadata
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Document 1
                    </Typography>
                    <List dense>
                      {Object.entries(results.metadata.doc1).map(([key, value]) => (
                        <ListItem key={key}>
                          <ListItemText
                            primary={key.charAt(0).toUpperCase() + key.slice(1)}
                            secondary={value}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Document 2
                    </Typography>
                    <List dense>
                      {Object.entries(results.metadata.doc2).map(([key, value]) => (
                        <ListItem key={key}>
                          <ListItemText
                            primary={key.charAt(0).toUpperCase() + key.slice(1)}
                            secondary={value}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Detailed Analysis */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Detailed Analysis</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Content Changes
                      </Typography>
                      {/* Add detailed content changes here */}
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Format Changes
                      </Typography>
                      {/* Add format changes here */}
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </>
        )}

        {/* Error Display */}
        {results?.error && (
          <Grid item xs={12}>
            <Alert severity="error">
              Analysis failed: {results.error}
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default DocumentAnalysis;
