import streamlit as st
from PIL import Image, ImageDraw, ImageFont, ExifTags
import cv2
import numpy as np
from skimage.metrics import structural_similarity as ssim
import pandas as pd
import fitz
import docx
from difflib import HtmlDiff, SequenceMatcher
import os
import uuid
import logging
import requests
import zipfile
from typing import Union, Dict, Any
import time
import base64
from io import BytesIO

# Constants
UPLOAD_DIR = "uploaded_files"
NVIDIA_API_KEY = "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"
ICON_URL = "https://raw.githubusercontent.com/noumanjavaid96/ai-as-an-api/refs/heads/master/image%20(39).png"

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create upload directory
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Load icon
response = requests.get(ICON_URL)
icon_image = Image.open(BytesIO(response.content))

# Page configuration
st.set_page_config(
    page_title="Centurion Analysis Tool",
    page_icon=icon_image,
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
.title-container {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}
.title-icon {
    width: 50px;
    height: 50px;
    margin-right: 10px;
}
.title-text {
    font-size: 36px;
    font-weight: bold;
}
</style>
""", unsafe_allow_html=True)

# Title with icon
st.markdown(f"""
<div class="title-container">
    <img class="title-icon" src="{ICON_URL}" alt="Icon">
    <div class="title-text">Centurion Analysis Tool</div>
</div>
""", unsafe_allow_html=True)

st.write("Welcome to the Centurion Analysis Tool! Use the tabs above to navigate.")

[Rest of your code including all functions: main(), image_comparison(), 
image_comparison_and_watermarking(), document_comparison_tool(), etc.]

if __name__ == "__main__":
    main()
