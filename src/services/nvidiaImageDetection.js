import axios from 'axios';

export class NvidiaImageDetection {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.invokeUrl = "https://ai.api.nvidia.com/v1/cv/hive/ai-generated-image-detection";
    this.assetsUrl = "https://api.nvcf.nvidia.com/v2/nvcf/assets";
  }

  async analyzeImage(imageFile) {
    try {
      const imageBase64 = await this.fileToBase64(imageFile);
      
      if (imageBase64.length < 180000) {
        return await this.detectDirectly(imageBase64);
      } else {
        return await this.detectViaAsset(imageFile);
      }
    } catch (error) {
      console.error('Image analysis failed:', error);
      throw error;
    }
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

  async detectDirectly(base64Image) {
    const payload = {
      input: [`data:image/jpeg;base64,${base64Image}`]
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'Accept': 'application/json'
    };

    const response = await axios.post(this.invokeUrl, payload, { headers });
    return response.data;
  }

  async uploadAsset(file, description) {
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'accept': 'application/json'
    };

    const payload = {
      contentType: 'image/jpeg',
      description: description
    };

    // Get upload URL
    const response = await axios.post(this.assetsUrl, payload, { headers });
    const { uploadUrl, assetId } = response.data;

    // Upload file to S3
    const s3Headers = {
      'x-amz-meta-nvcf-asset-description': description,
      'content-type': 'image/jpeg'
    };

    await axios.put(uploadUrl, file, { headers: s3Headers });
    return assetId.toString();
  }

  async detectViaAsset(file) {
    const assetId = await this.uploadAsset(file, "Input Image");

    const payload = {
      input: [`data:image/jpeg;asset_id,${assetId}`]
    };

    const headers = {
      'Content-Type': 'application/json',
      'NVCF-INPUT-ASSET-REFERENCES': assetId,
      'Authorization': `Bearer ${this.apiKey}`
    };

    const response = await axios.post(this.invokeUrl, payload, { headers });
    return response.data;
  }
}
