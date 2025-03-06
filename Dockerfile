FROM node:20

# Create app directory and set working directory
WORKDIR /usr/src/app

# Install Node.js dependencies first (for better caching)
COPY package*.json ./
RUN npm ci --only=production

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-full \
    python3-pip \
    python3-venv \
    libvips \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Set up Python virtual environment
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Install PaddleOCR in virtual environment
RUN pip3 install --no-cache-dir paddleocr

# Create required directories
RUN mkdir -p tessdata data/servers data/ocr-cache

# Download OCR models
RUN cd tessdata && \
    wget https://paddleocr.bj.bcebos.com/PP-OCRv3/english/en_PP-OCRv3_rec_infer.tar && \
    tar xf en_PP-OCRv3_rec_infer.tar && \
    wget https://paddleocr.bj.bcebos.com/PP-OCRv3/multilingual/korean_PP-OCRv3_rec_infer.tar && \
    tar xf korean_PP-OCRv3_rec_infer.tar && \
    wget https://paddleocr.bj.bcebos.com/PP-OCRv3/multilingual/japan_PP-OCRv3_rec_infer.tar && \
    tar xf japan_PP-OCRv3_rec_infer.tar && \
    wget https://paddleocr.bj.bcebos.com/PP-OCRv3/chinese/ch_PP-OCRv3_det_infer.tar && \
    tar xf ch_PP-OCRv3_det_infer.tar && \
    wget https://paddleocr.bj.bcebos.com/PP-OCRv3/chinese/ch_ppocr_mobile_v2.0_cls_infer.tar && \
    tar xf ch_ppocr_mobile_v2.0_cls_infer.tar && \
    rm *.tar

# Copy application source
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV OCR_MODEL_DIR=/usr/src/app/tessdata

# Set permissions
RUN chown -R node:node /usr/src/app /opt/venv

# Switch to non-root user
USER node

# Add tini for proper signal handling
ENV TINI_VERSION v0.19.0
ADD --chmod=755 https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
ENTRYPOINT ["/tini", "--"]

# Run the application
CMD ["node", "src/index.js"]
