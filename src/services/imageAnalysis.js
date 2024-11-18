import * as tf from '@tensorflow/tfjs';
import axios from 'axios';

const NVIDIA_API_KEY = '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';

export class ImageAnalysis {
  constructor() {
    this.apiKey = NVIDIA_API_KEY;
  }

  async analyzeSimilarity(image1, image2) {
    const tensor1 = await this.imageToTensor(image1);
    const tensor2 = await this.imageToTensor(image2);
    
    // Ensure same dimensions
    const [height, width] = [
      Math.min(tensor1.shape[0], tensor2.shape[0]),
      Math.min(tensor1.shape[1], tensor2.shape[1])
    ];
    
    const resized1 = tf.image.resizeBilinear(tensor1, [height, width]);
    const resized2 = tf.image.resizeBilinear(tensor2, [height, width]);
    
    // Calculate SSIM
    const ssim = await this.calculateSSIM(resized1, resized2);
    
    // Calculate size difference
    const sizeDiff = this.calculateSizeDifference(image1, image2);
    
    tf.dispose([tensor1, tensor2, resized1, resized2]);
    
    return { ssim, sizeDiff };
  }

  async imageToTensor(image) {
    return tf.browser.fromPixels(image);
  }

  async calculateSSIM(tensor1, tensor2) {
    // Implement SSIM calculation using TensorFlow.js
    const meanX = tf.mean(tensor1);
    const meanY = tf.mean(tensor2);
    const varX = tf.variance(tensor1);
    const varY = tf.variance(tensor2);
    const covXY = tf.mean(tf.mul(tf.sub(tensor1, meanX), tf.sub(tensor2, meanY)));
    
    const c1 = 0.01 ** 2;
    const c2 = 0.03 ** 2;
    
    const numerator = tf.mul(
      tf.add(tf.mul(tf.mul(meanX, meanY), 2), c1),
      tf.add(tf.mul(covXY, 2), c2)
    );
    
    const denominator = tf.mul(
      tf.add(tf.add(tf.square(meanX), tf.square(meanY)), c1),
      tf.add(tf.add(varX, varY), c2)
    );
    
    const ssim = tf.div(numerator, denominator);
    const result = await ssim.array();
    
    tf.dispose([meanX, meanY, varX, varY, covXY, numerator, denominator, ssim]);
    
    return result;
  }

  calculateSizeDifference(image1, image2) {
    const size1 = image1.width * image1.height;
    const size2 = image2.width * image2.height;
    const diff = Math.abs(size1 - size2);
    const percentage = (diff / Math.max(size1, size2)) * 100;
    
    return {
      difference: diff,
      percentage,
      dimensions: {
        image1: { width: image1.width, height: image1.height },
        image2: { width: image2.width, height: image2.height }
      }
    };
  }

  async detectDeepfake(imageFile) {
    try {
      const base64Data = await this.fileToBase64(imageFile);
      const headers = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      const payload = {
        input: [`data:image/jpeg;base64,${base64Data}`]
      };
      
      const response = await axios.post(
        'https://ai.api.nvidia.com/v1/cv/hive/deepfake-image-detection',
        payload,
        { headers }
      );
      
      return this.processDeepfakeResponse(response.data);
    } catch (error) {
      console.error('Deepfake detection failed:', error);
      throw error;
    }
  }

  processDeepfakeResponse(data) {
    if (!data.data || !data.data[0]) {
      throw new Error('Invalid response from deepfake detection API');
    }

    const result = data.data[0];
    return {
      boundingBoxes: result.bounding_boxes?.map(box => ({
        vertices: box.vertices,
        isDeepfake: box.is_deepfake,
        confidence: box.bbox_confidence,
        coordinates: {
          x1: box.vertices[0].x,
          y1: box.vertices[0].y,
          x2: box.vertices[1].x,
          y2: box.vertices[1].y
        }
      })) || [],
      rawResponse: data
    };
  }

  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  extractMetadata(image) {
    const metadata = {};
    
    // Basic image properties
    metadata.dimensions = {
      width: image.width,
      height: image.height
    };
    
    // EXIF data if available
    if (image.exifdata) {
      metadata.exif = {
        make: image.exifdata.Make,
        model: image.exifdata.Model,
        software: image.exifdata.Software,
        dateTime: image.exifdata.DateTime,
        exposureTime: image.exifdata.ExposureTime,
        fNumber: image.exifdata.FNumber,
        iso: image.exifdata.ISO,
        focalLength: image.exifdata.FocalLength
      };
    }
    
    return metadata;
  }

  compareMetadata(metadata1, metadata2) {
    const differences = {};
    
    // Compare dimensions
    if (metadata1.dimensions.width !== metadata2.dimensions.width ||
        metadata1.dimensions.height !== metadata2.dimensions.height) {
      differences.dimensions = {
        image1: metadata1.dimensions,
        image2: metadata2.dimensions
      };
    }
    
    // Compare EXIF data
    if (metadata1.exif && metadata2.exif) {
      differences.exif = {};
      for (const key in metadata1.exif) {
        if (metadata1.exif[key] !== metadata2.exif[key]) {
          differences.exif[key] = {
            image1: metadata1.exif[key],
            image2: metadata2.exif[key]
          };
        }
      }
    }
    
    return differences;
  }
}
