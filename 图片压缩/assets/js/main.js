// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化函数
    init();
});

// 初始化函数
function init() {
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const compressBtn = document.getElementById('compressBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    
    // 处理拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
    
    // 处理点击上传
    uploadArea.addEventListener('click', () => {
        imageInput.click();
    });
    
    imageInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    
    // 处理质量滑块
    qualitySlider.addEventListener('input', () => {
        qualityValue.textContent = `${qualitySlider.value}%`;
    });
    
    // 压缩按钮点击事件
    compressBtn.addEventListener('click', compressImage);
    
    // 下载按钮点击事件
    downloadBtn.addEventListener('click', downloadImage);
}

// 处理文件上传
function handleFiles(files) {
    if (files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
        alert('请上传图片文件！');
        return;
    }
    
    // 显示原图预览
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('originalPreview').src = e.target.result;
        document.getElementById('originalSize').textContent = formatFileSize(file.size);
        document.getElementById('previewArea').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// 压缩图片
function compressImage() {
    const originalImage = document.getElementById('originalPreview');
    const quality = document.getElementById('quality').value / 100;
    const maxWidth = parseInt(document.getElementById('maxWidth').value);
    const keepFormat = document.getElementById('keepFormat').checked;
    
    const canvas = document.createElement('canvas');
    // 计算压缩后的尺寸
    let width = originalImage.naturalWidth;
    let height = originalImage.naturalHeight;
    
    // 如果设置了最大宽度且图片宽度超过设定值，按比例缩小
    if (maxWidth > 0 && width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = Math.round(height * ratio);
    }
    
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    // 使用双线性插值算法
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(originalImage, 0, 0, width, height);
    
    // 根据图片类型和设置选择压缩格式
    const originalType = getImageType(originalImage.src);
    const mimeType = keepFormat ? 
        (originalType === 'png' ? 'image/png' : 'image/jpeg') : 
        'image/jpeg';
    
    canvas.toBlob((blob) => {
        const compressedImage = document.getElementById('compressedPreview');
        compressedImage.src = URL.createObjectURL(blob);
        document.getElementById('compressedSize').textContent = formatFileSize(blob.size);
        document.getElementById('downloadBtn').disabled = false;
    }, mimeType, quality);
}

// 获取图片类型
function getImageType(src) {
    if (src.startsWith('data:image/')) {
        return src.split(';')[0].split('/')[1];
    }
    return src.split('.').pop().toLowerCase();
}

// 下载压缩后的图片
function downloadImage() {
    const compressedImage = document.getElementById('compressedPreview');
    const originalImage = document.getElementById('originalPreview');
    const originalType = getImageType(originalImage.src);
    
    const link = document.createElement('a');
    link.download = `compressed-image.${originalType}`;
    link.href = compressedImage.src;
    link.click();
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 工具函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
} 