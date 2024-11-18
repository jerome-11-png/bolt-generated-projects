import axios from 'axios';

const NVIDIA_API_KEY = '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';

export class NvidiaDetection {
  constructor() {
    this.apiKey = NVIDIA_API_KEY;
    this.invokeUrl = "https://ai.api.nvidia.com/v1/cv/hive/ai-generated-image-detection";
    this.assetsUrl = "https://api.nvcf.nvidia.com/v2/nvcf/assets";
  }

  async analyzeImage(file) {
    try {
      const base64Data = await this.fileToBase64(file);
      const imageSize = this.calculateBase64Size(base64Data);

      if (imageSize < 180000) {
        return await this.detectDirectly(base64Data);
      } else {
        return await this.detectViaAsset(file);
      }
    } catch (error) {
      console.error('NVIDIA Analysis failed:', error);
      throw error;
    }
  }

  calculateBase64Size(base64String) {
    return base64String.length * 0.75;
  }

  fileToBase64(file) {
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

  async detectDirectly(base64Data) {
    const payload = {
      input: [`data:image/jpeg;base64,${base64Data}`]
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'Accept': 'application/json'
    };

    try {
      const response = await axios.post(this.invokeUrl, payload, { headers });
      return this.processResponse(response.data);
    } catch (error) {
      throw new Error(`Direct detection failed: ${error.message}`);
    }
  }

  async uploadAsset(file, description) {
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    try {
      // Get upload URL
      const response = await axios.post(this.assetsUrl, {
        contentType: 'image/jpeg',
        description: description
      }, { headers });

      const { uploadUrl, assetId } = response.data;

      // Upload to S3
      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': 'image/jpeg',
          'x-amz-meta-nvcf-asset-description': description
        }
      });

      return assetId;
    } catch (error) {
      throw new Error(`Asset upload failed: ${error.message}`);
    }
  }

  async detectViaAsset(file) {
    try {
      const assetId = await this.uploadAsset(file, "Input Image");

      const payload = {
        input: [`data:image/jpeg;asset_id,${assetId}`]
      };

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'NVCF-INPUT-ASSET-REFERENCES': assetId
      };

      const response = await axios.post(this.invokeUrl, payload, { headers });
      return this.processResponse(response.data);
    } catch (error) {
      throw new Error(`Asset-based detection failed: ${error.message}`);
    }
  }

  processResponse(data) {
    if (!data || !data.result) {
      throw new Error('Invalid response from NVIDIA API');
    }

    return {
      isAiGenerated: data.result.isAiGenerated,
      confidence: data.result.confidence,
      details: data.result.details || null
    };
  }
}
