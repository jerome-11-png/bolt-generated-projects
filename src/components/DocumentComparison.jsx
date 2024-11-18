
import React, { useState } from 'react'
import { Box, Typography, Paper, Grid, Button, CircularProgress, List, ListItem, ListItemText } from '@mui/material'
import { useDropzone } from 'react-dropzone'

function DocumentComparison() {
  const [doc1, setDoc1] = useState(null)
  const [doc2, setDoc2] = useState(null)
  const [comparing, setComparing] = useState(false)
  const [comparisonResult, setComparisonResult] = useState(null)

  const onDrop1 = (acceptedFiles) => {
    const file = acceptedFiles[0]
    setDoc1(file)
  }

  const onDrop2 = (acceptedFiles) => {
    const file = acceptedFiles[0]
    setDoc2(file)
  }

  const { getRootProps: getRootProps1, getInputProps: getInputProps1, isDragActive: isDragActive1 } = useDropzone({
    onDrop: onDrop1,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  })

  const { getRootProps: getRootProps2, getInputProps: getInputProps2, isDragActive: isDragActive2 } = useDropzone({
    onDrop: onDrop2,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  })

  const handleCompare = async () => {
    if (!doc1 || !doc2) return
    
    setComparing(true)
    try {
      // Simulated comparison process
      await new Promise(resolve => setTimeout(resolve, 1500))
      setComparisonResult({
        similarity: '92%',
        differences: [
          'Page 1: Content modification in paragraph 2',
          'Page 3: Added new section',
          'Page 4: Removed image'
        ]
      })
    } catch (error) {
      console.error('Comparison failed:', error)
    } finally {
      setComparing(false)
    }
  }

  const dropzoneStyle = (isDragActive) => ({
    p: 2,
    textAlign: 'center',
    cursor: 'pointer',
    minHeight: 200,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px dashed',
    borderColor: isDragActive ? 'primary.main' : 'grey.300',
    borderRadius: 1,
    bgcolor: isDragActive ? 'action.hover' : 'background.paper',
    transition: 'all 0.2s ease'
  })

  return (
    <Box>
      <Typography variant="h5" gutterBottom color="primary">
        Document Comparison
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3}>
            <Box {...getRootProps1()} sx={dropzoneStyle(isDragActive1)}>
              <input {...getInputProps1()} />
              {doc1 ? (
                <Box>
                  <Typography variant="h6" color="primary">
                    Document 1 Selected
                  </Typography>
                  <Typography>{doc1.name}</Typography>
                  <Typography variant="caption">
                    Size: {(doc1.size / 1024).toFixed(2)} KB
                  </Typography>
                </Box>
              ) : (
                <Typography>
                  Drag and drop original document here or click to select
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3}>
            <Box {...getRootProps2()} sx={dropzoneStyle(isDragActive2)}>
              <input {...getInputProps2()} />
              {doc2 ? (
                <Box>
                  <Typography variant="h6" color="primary">
                    Document 2 Selected
                  </Typography>
                  <Typography>{doc2.name}</Typography>
                  <Typography variant="caption">
                    Size: {(doc2.size / 1024).toFixed(2)} KB
                  </Typography>
                </Box>
              ) : (
                <Typography>
                  Drag and drop comparison document here or click to select
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleCompare}
            disabled={!doc1 || !doc2 || comparing}
            fullWidth
            sx={{ mt: 2 }}
          >
            {comparing ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                Comparing Documents...
              </>
            ) : (
              'Compare Documents'
            )}
          </Button>
        </Grid>

        {comparisonResult && (
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Comparison Results
              </Typography>
              <Typography variant="h4" color="primary" sx={{ mb: 2 }}>
                {comparisonResult.similarity} Similar
              </Typography>
              <Typography variant="subtitle1">
                Detected Differences:
              </Typography>
              <List>
                {comparisonResult.differences.map((diff, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={diff} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default DocumentComparison
