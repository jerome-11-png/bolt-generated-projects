import * as tf from '@tensorflow/tfjs';

export class WatermarkDetector {
  constructor() {
    this.model = null;
    this.isModelLoaded = false;
  }

  async init() {
    try {
      // Load YOLOv8 model converted to TensorFlow.js format
      this.model = await tf.loadGraphModel('/models/watermark-detection/model.json');
      this.isModelLoaded = true;
      return true;
    } catch (error) {
      console.error('Error loading watermark detection model:', error);
      return false;
    }
  }

  async detectWatermarks(imageElement) {
    if (!this.isModelLoaded) {
      throw new Error('Model not loaded');
    }

    try {
      // Preprocess image
      const tensor = await this.preprocessImage(imageElement);
      
      // Run inference
      const predictions = await this.model.predict(tensor);
      
      // Post-process predictions
      const boxes = await this.postprocessPredictions(predictions, imageElement.width, imageElement.height);
      
      // Cleanup
      tf.dispose([tensor, predictions]);
      
      return boxes;
    } catch (error) {
      console.error('Watermark detection error:', error);
      throw error;
    }
  }

  async preprocessImage(imageElement) {
    // Convert image to tensor and normalize
    return tf.tidy(() => {
      const tensor = tf.browser.fromPixels(imageElement)
        .resizeBilinear([640, 640]) // YOLOv8 default input size
        .expandDims(0)
        .div(255.0);
      return tensor;
    });
  }

  async postprocessPredictions(predictions, originalWidth, originalHeight) {
    const boxes = await predictions.array();
    const processedBoxes = [];

    // Process each detection
    for (let i = 0; i < boxes[0].length; i++) {
      const [x1, y1, x2, y2, confidence, ...classScores] = boxes[0][i];
      
      if (confidence > 0.5) { // Confidence threshold
        // Convert normalized coordinates to pixel coordinates
        const box = {
          x: (x1 * originalWidth),
          y: (y1 * originalHeight),
          width: ((x2 - x1) * originalWidth),
          height: ((y2 - y1) * originalHeight),
          confidence: confidence,
          class: 'watermark'
        };
        
        processedBoxes.push(box);
      }
    }

    return processedBoxes;
  }
}

export const drawDetections = (canvas, detections) => {
  const ctx = canvas.getContext('2d');
  
  detections.forEach(detection => {
    // Draw bounding box
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      detection.x,
      detection.y,
      detection.width,
      detection.height
    );

    // Draw label
    ctx.fillStyle = '#00ff00';
    ctx.font = '16px Arial';
    const label = `${detection.class} ${Math.round(detection.confidence * 100)}%`;
    const textWidth = ctx.measureText(label).width;
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(
      detection.x,
      detection.y - 20,
      textWidth + 10,
      20
    );
    
    ctx.fillStyle = '#00ff00';
    ctx.fillText(
      label,
      detection.x + 5,
      detection.y - 5
    );
  });
};
