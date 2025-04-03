// Load TensorFlow.js and rembg.js
const loadDependencies = async () => {
    const statusText = document.getElementById('statusText');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    try {
        loadingIndicator.style.display = 'block';
        statusText.textContent = 'Loading AI models... (this may take a minute)';
        
        // Load TensorFlow.js
        await new Promise((resolve) => {
            const tfScript = document.createElement('script');
            tfScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.18.0/dist/tf.min.js';
            tfScript.onload = resolve;
            document.head.appendChild(tfScript);
        });
        
        // Load rembg.js
        await new Promise((resolve) => {
            const rembgScript = document.createElement('script');
            rembgScript.src = 'https://cdn.jsdelivr.net/npm/rembg@2.0.0/dist/rembg.min.js';
            rembgScript.onload = resolve;
            document.head.appendChild(rembgScript);
        });
        
        // Initialize TensorFlow.js
        await tf.ready();
        
        // Initialize rembg
        await rembg.init();
        
        statusText.textContent = 'AI models loaded successfully!';
        setTimeout(() => {
            loadingIndicator.style.display = 'none';
        }, 1000);
        
        return true;
    } catch (error) {
        console.error('Error loading dependencies:', error);
        statusText.textContent = 'Error loading AI models. Please refresh the page.';
        return false;
    }
};

// Main application
document.addEventListener('DOMContentLoaded', async () => {
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const dropZone = document.getElementById('dropZone');
    const originalImg = document.getElementById('originalImg');
    const resultImg = document.getElementById('resultImg');
    const previewSection = document.getElementById('previewSection');
    const actionButtons = document.getElementById('actionButtons');
    const downloadBtn = document.getElementById('downloadBtn');
    const resetBtn = document.getElementById('resetBtn');
    const errorMsg = document.getElementById('errorMsg');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const statusText = document.getElementById('statusText');
    
    // Load dependencies first
    const dependenciesLoaded = await loadDependencies();
    if (!dependenciesLoaded) return;
    
    // Set up event listeners
    uploadBtn.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    });
    
    // Drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
        dropZone.addEventListener(event, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(event => {
        dropZone.addEventListener(event, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(event => {
        dropZone.addEventListener(event, unhighlight, false);
    });
    
    function highlight() {
        dropZone.style.borderColor = '#4a6bff';
        dropZone.style.background = '#f0f4ff';
    }
    
    function unhighlight() {
        dropZone.style.borderColor = '#ccc';
        dropZone.style.background = '#f9f9f9';
    }
    
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) {
            handleFile(files[0]);
        }
    });
    
    // Handle file processing
    async function handleFile(file) {
        if (!file.type.match('image.*')) {
            errorMsg.textContent = 'Please select an image file (JPEG, PNG, etc.)';
            errorMsg.style.display = 'block';
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            errorMsg.textContent = 'Image size should be less than 5MB';
            errorMsg.style.display = 'block';
            return;
        }
        
        errorMsg.style.display = 'none';
        
        const reader = new FileReader();
        reader.onload = async function(e) {
            originalImg.src = e.target.result;
            previewSection.style.display = 'flex';
            
            // Process the image
            loadingIndicator.style.display = 'block';
            statusText.textContent = 'Removing background...';
            
            try {
                // Create image element for processing
                const img = new Image();
                img.src = e.target.result;
                
                await new Promise((resolve) => {
                    img.onload = resolve;
                });
                
                // Process with rembg
                const result = await rembg.remove(img);
                resultImg.src = result;
                
                loadingIndicator.style.display = 'none';
                actionButtons.style.display = 'flex';
            } catch (error) {
                console.error('Error processing image:', error);
                statusText.textContent = 'Error processing image. Please try another.';
                setTimeout(() => {
                    loadingIndicator.style.display = 'none';
                }, 2000);
            }
        };
        reader.readAsDataURL(file);
    }
    
    // Download button
    downloadBtn.addEventListener('click', () => {
        if (!resultImg.src) return;
        
        const link = document.createElement('a');
        link.href = resultImg.src;
        link.download = 'background_removed.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    
    // Reset button
    resetBtn.addEventListener('click', () => {
        fileInput.value = '';
        originalImg.src = '';
        resultImg.src = '';
        previewSection.style.display = 'none';
        actionButtons.style.display = 'none';
        errorMsg.style.display = 'none';
    });
});
