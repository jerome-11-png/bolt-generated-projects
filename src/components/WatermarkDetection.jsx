import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, Alert } from '@mui/material';
import { WatermarkDetector } from '../services/watermarkDetector';

const detector = new WatermarkDetector();

function WatermarkDetection({ image }) {
  const [detecting, setDetecting] = useState(false);
  const [detections, setDetections] = useState(null);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        await detector.loadModel();
      } catch (err) {
        setError('Failed to load detection model');
      }
    };
    loadModel();
  }, []);

  const drawDetections = (detections) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Draw detections
      detections.forEach(detection => {
        const [x, y, width, height] = detection.box;
        
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          x * canvas.width,
          y * canvas.height,
          width * canvas.width,
          height * canvas.height
        );
        
        // Draw label
        ctx.fillStyle = '#00ff00';
        ctx.font = '16px Arial';
        ctx.fillText(
          `Watermark ${Math.round(detection.confidence * 100)}%`,
          x * canvas.width,
          y * canvas.height - 5
        );
      });
    };
    
    img.src = image;
  };

  const handleDetect = async () => {
    if (!image) return;
    
    setDetecting(true);
    setError(null);
    
    try {
      const img = new Image();
      img.src = image;
      await new Promise(resolve => { img.onload = resolve; });
      
      const detections = await detector.detectWatermark(img);
      setDetections(detections);
      drawDetections(detections);
    } catch (err) {
      setError('Failed to detect watermarks');
      console.error(err);
    } finally {
      setDetecting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Watermark Detection
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Button
          variant="contained"
          onClick={handleDetect}
          disabled={!image || detecting}
          fullWidth
        >
          {detecting ? (
            <>
              <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
              Detecting Watermarks...
            </>
          ) : (
            'Detect Watermarks'
          )}
        </Button>
      </Paper>
      
      {detections && (
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Detection Results
          </Typography>
          <canvas
            ref={canvasRef}
            style={{
              maxWidth: '100%',
              height: 'auto'
            }}
          />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Found {detections.length} watermark(s)
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

export default WatermarkDetection;
