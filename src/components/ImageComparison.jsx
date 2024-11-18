import React, { useState, useEffect } from 'react'
import { Box, Typography, Paper, Grid, Button, CircularProgress } from '@mui/material'
import { useDropzone } from 'react-dropzone'

function ImageComparison() {
  const [image1, setImage1] = useState(null)
  const [image2, setImage2] = useState(null)
  const [preview1, setPreview1] = useState(null)
  const [preview2, setPreview2] = useState(null)
  const [comparing, setComparing] = useState(false)
  const [comparisonResult, setComparisonResult] = useState(null)

  const onDrop1 = (acceptedFiles) => {
    const file = acceptedFiles[0]
    setImage1(file)
    const objectUrl = URL.createObjectURL(file)
    setPreview1(objectUrl)
  }

  const onDrop2 = (acceptedFiles) => {
    const file = acceptedFiles[0]
    setImage2(file)
    const objectUrl = URL.createObjectURL(file)
    setPreview2(objectUrl)
  }

  useEffect(() => {
    // Cleanup URLs on unmount
    return () => {
      if (preview1) URL.revokeObjectURL(preview1)
      if (preview2) URL.revokeObjectURL(preview2)
    }
  }, [])

  const { getRootProps: getRootProps1, getInputProps: getInputProps1, isDragActive: isDragActive1 } = useDropzone({
    onDrop: onDrop1,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  })

  const { getRootProps: getRootProps2, getInputProps: getInputProps2, isDragActive: isDragActive2 } = useDropzone({
    onDrop: onDrop2,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  })

  const handleCompare = async () => {
    if (!image1 || !image2) return
    
    setComparing(true)
    try {
      // Simulated comparison result
      await new Promise(resolve => setTimeout(resolve, 1000))
      setComparisonResult({
        similarity: '87%',
        differences: ['Color variation', 'Size difference']
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
        Image Comparison
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3}>
            <Box {...getRootProps1()} sx={dropzoneStyle(isDragActive1)}>
              <input {...getInputProps1()} />
              {preview1 ? (
                <Box sx={{ width: '100%', position: 'relative' }}>
                  <img 
                    src={preview1} 
                    alt="Original" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: 400,
                      objectFit: 'contain'
                    }} 
                  />
                  <Typography variant="caption" sx={{ mt: 1 }}>
                    {image1.name}
                  </Typography>
                </Box>
              ) : (
                <Typography>
                  Drag and drop original image here or click to select
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3}>
            <Box {...getRootProps2()} sx={dropzoneStyle(isDragActive2)}>
              <input {...getInputProps2()} />
              {preview2 ? (
                <Box sx={{ width: '100%', position: 'relative' }}>
                  <img 
                    src={preview2} 
                    alt="Compare" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: 400,
                      objectFit: 'contain'
                    }} 
                  />
                  <Typography variant="caption" sx={{ mt: 1 }}>
                    {image2.name}
                  </Typography>
                </Box>
              ) : (
                <Typography>
                  Drag and drop comparison image here or click to select
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleCompare}
            disabled={!image1 || !image2 || comparing}
            fullWidth
            sx={{ mt: 2 }}
          >
            {comparing ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                Comparing Images...
              </>
            ) : (
              'Compare Images'
            )}
          </Button>
        </Grid>

        {comparisonResult && (
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Comparison Results
              </Typography>
              <Typography>
                Similarity: {comparisonResult.similarity}
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 1 }}>
                Detected Differences:
              </Typography>
              <ul>
                {comparisonResult.differences.map((diff, index) => (
                  <li key={index}>{diff}</li>
                ))}
              </ul>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default ImageComparison
