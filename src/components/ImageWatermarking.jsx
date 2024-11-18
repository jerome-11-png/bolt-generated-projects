import React, { useState, useEffect, useRef } from 'react'
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  TextField, 
  Button, 
  CircularProgress,
  Alert,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import { useDropzone } from 'react-dropzone'
import { NvidiaDetection } from '../services/nvidiaDetection'

function ImageWatermarking() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [watermarkText, setWatermarkText] = useState('')
  const [watermarkPosition, setWatermarkPosition] = useState('bottomRight')
  const [watermarkOpacity, setWatermarkOpacity] = useState(50)
  const [watermarkSize, setWatermarkSize] = useState(20)
  const [watermarking, setWatermarking] = useState(false)
  const [watermarkedPreview, setWatermarkedPreview] = useState(null)
  const [detectedWatermark, setDetectedWatermark] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [nvidiaResult, setNvidiaResult] = useState(null)
  const [isNvidiaAnalyzing, setIsNvidiaAnalyzing] = useState(false)

  const nvidiaDetector = new NvidiaDetection()

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0]
    setImage(file)
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    setWatermarkedPreview(null)
    setDetectedWatermark(null)
    setNvidiaResult(null)
  }

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
      if (watermarkedPreview) URL.revokeObjectURL(watermarkedPreview)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  })

  const handleWatermark = async () => {
    if (!image || !watermarkText) return
    
    setWatermarking(true)
    try {
      const img = new Image()
      img.src = preview
      await new Promise(resolve => {
        img.onload = resolve
      })

      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      
      ctx.drawImage(img, 0, 0)
      
      ctx.globalAlpha = watermarkOpacity / 100
      ctx.font = `${watermarkSize}px Arial`
      ctx.fillStyle = 'white'
      ctx.strokeStyle = 'black'
      ctx.lineWidth = 2

      let x, y
      switch (watermarkPosition) {
        case 'topLeft':
          x = 20
          y = watermarkSize + 10
          break
        case 'topRight':
          x = canvas.width - ctx.measureText(watermarkText).width - 20
          y = watermarkSize + 10
          break
        case 'bottomLeft':
          x = 20
          y = canvas.height - 20
          break
        default: // bottomRight
          x = canvas.width - ctx.measureText(watermarkText).width - 20
          y = canvas.height - 20
      }

      ctx.strokeText(watermarkText, x, y)
      ctx.fillText(watermarkText, x, y)

      const watermarkedUrl = canvas.toDataURL('image/jpeg')
      setWatermarkedPreview(watermarkedUrl)
    } catch (error) {
      console.error('Watermarking failed:', error)
    } finally {
      setWatermarking(false)
    }
  }

  const handleNvidiaAnalysis = async () => {
    if (!image) return
    
    setIsNvidiaAnalyzing(true)
    try {
      const result = await nvidiaDetector.analyzeImage(image)
      setNvidiaResult(result)
    } catch (error) {
      console.error('NVIDIA Analysis failed:', error)
      setNvidiaResult({
        error: true,
        message: error.message
      })
    } finally {
      setIsNvidiaAnalyzing(false)
    }
  }

  const dropzoneStyle = {
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
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom color="primary">
        Image Analysis & Watermarking
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3}>
            <Box {...getRootProps()} sx={dropzoneStyle}>
              <input {...getInputProps()} />
              {preview ? (
                <Box sx={{ width: '100%', position: 'relative' }}>
                  <img 
                    src={preview} 
                    alt="Original" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: 400,
                      objectFit: 'contain'
                    }} 
                  />
                  <Typography variant="caption" sx={{ mt: 1 }}>
                    {image.name}
                  </Typography>
                </Box>
              ) : (
                <Typography>
                  Drag and drop image here or click to select
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Image Analysis & Watermark Controls
            </Typography>
            
            <Button
              variant="contained"
              onClick={handleNvidiaAnalysis}
              disabled={!image || isNvidiaAnalyzing}
              fullWidth
              sx={{ mb: 2 }}
            >
              {isNvidiaAnalyzing ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                  Analyzing with NVIDIA AI...
                </>
              ) : (
                'Analyze with NVIDIA AI'
              )}
            </Button>

            <Divider sx={{ my: 2 }} />
            
            <TextField
              fullWidth
              label="Watermark Text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              margin="normal"
              variant="outlined"
            />

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Position</InputLabel>
              <Select
                value={watermarkPosition}
                label="Position"
                onChange={(e) => setWatermarkPosition(e.target.value)}
              >
                <MenuItem value="topLeft">Top Left</MenuItem>
                <MenuItem value="topRight">Top Right</MenuItem>
                <MenuItem value="bottomLeft">Bottom Left</MenuItem>
                <MenuItem value="bottomRight">Bottom Right</MenuItem>
              </Select>
            </FormControl>

            <Typography gutterBottom sx={{ mt: 2 }}>
              Opacity: {watermarkOpacity}%
            </Typography>
            <Slider
              value={watermarkOpacity}
              onChange={(e, newValue) => setWatermarkOpacity(newValue)}
              aria-label="Opacity"
            />

            <Typography gutterBottom sx={{ mt: 2 }}>
              Size: {watermarkSize}px
            </Typography>
            <Slider
              value={watermarkSize}
              onChange={(e, newValue) => setWatermarkSize(newValue)}
              min={10}
              max={100}
              aria-label="Size"
            />

            <Button
              variant="contained"
              onClick={handleWatermark}
              disabled={!image || !watermarkText || watermarking}
              fullWidth
              sx={{ mt: 2 }}
            >
              {watermarking ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                  Adding Watermark...
                </>
              ) : (
                'Add Watermark'
              )}
            </Button>
          </Paper>
        </Grid>

        {nvidiaResult && (
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                NVIDIA AI Analysis Results
              </Typography>
              
              {nvidiaResult.error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {nvidiaResult.message}
                </Alert>
              ) : (
                <>
                  <Alert 
                    severity={nvidiaResult.isAiGenerated ? "warning" : "success"} 
                    sx={{ mb: 2 }}
                  >
                    {nvidiaResult.isAiGenerated 
                      ? "This image appears to be AI-generated" 
                      : "This image appears to be authentic"}
                  </Alert>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Confidence Score:</Typography>
                      <Typography>
                        {(nvidiaResult.confidence * 100).toFixed(2)}%
                      </Typography>
                    </Grid>
                    {nvidiaResult.details && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2">Additional Details:</Typography>
                        <Typography>{nvidiaResult.details}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </>
              )}
            </Paper>
          </Grid>
        )}

        {watermarkedPreview && (
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Watermarked Result
              </Typography>
              <Box sx={{ textAlign: 'center' }}>
                <img 
                  src={watermarkedPreview} 
                  alt="Watermarked" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: 400,
                    objectFit: 'contain'
                  }} 
                />
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default ImageWatermarking
