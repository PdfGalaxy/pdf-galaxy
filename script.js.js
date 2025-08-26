// ===== GLOBAL VARIABLES =====
const { jsPDF } = window.jspdf;
let extractedTextContent = '';

// ===== UTILITY FUNCTIONS =====
function showThankYouModal() {
    const modal = document.getElementById('thank-you-modal');
    modal.style.display = 'block';
    
    // Auto-close after 3 seconds
    setTimeout(() => {
        closeThankYouModal();
    }, 3000);
}

function closeThankYouModal() {
    const modal = document.getElementById('thank-you-modal');
    modal.style.display = 'none';
}

function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show thank you modal
    showThankYouModal();
}

function showError(message) {
    alert(`Error: ${message}`);
}

function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'block';
    }
}

function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
}

// ===== PHOTO TO PDF FUNCTIONALITY =====
function initPhotoToPdf() {
    const uploadArea = document.getElementById('photo-upload-area');
    const fileInput = document.getElementById('photo-input');
    const previewArea = document.getElementById('photo-preview');
    const previewImg = document.getElementById('photo-preview-img');

    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        handlePhotoFile(e.target.files[0]);
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#b347d9';
        uploadArea.style.background = 'rgba(179, 71, 217, 0.1)';
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#00d4ff';
        uploadArea.style.background = 'rgba(0, 212, 255, 0.02)';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#00d4ff';
        uploadArea.style.background = 'rgba(0, 212, 255, 0.02)';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handlePhotoFile(files[0]);
        }
    });

    function handlePhotoFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            showError('Please select a valid image file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            uploadArea.style.display = 'none';
            previewArea.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function convertPhotoToPDF() {
    const img = document.getElementById('photo-preview-img');
    if (!img.src) return;

    try {
        // Create new PDF document
        const pdf = new jsPDF();
        
        // Get image dimensions
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const image = new Image();
        
        image.onload = function() {
            // Calculate dimensions to fit PDF page
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgRatio = image.width / image.height;
            const pdfRatio = pdfWidth / pdfHeight;
            
            let width, height;
            if (imgRatio > pdfRatio) {
                width = pdfWidth - 20; // 10px margin on each side
                height = width / imgRatio;
            } else {
                height = pdfHeight - 20; // 10px margin on top/bottom
                width = height * imgRatio;
            }
            
            // Center the image
            const x = (pdfWidth - width) / 2;
            const y = (pdfHeight - height) / 2;
            
            // Add image to PDF
            pdf.addImage(img.src, 'JPEG', x, y, width, height);
            
            // Generate filename with timestamp
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `photo-to-pdf-${timestamp}.pdf`;
            
            // Download PDF
            const pdfBlob = pdf.output('blob');
            downloadFile(pdfBlob, filename);
        };
        
        image.src = img.src;
        
    } catch (error) {
        console.error('Error converting photo to PDF:', error);
        showError('Failed to convert photo to PDF. Please try again.');
    }
}

function resetPhotoTool() {
    const uploadArea = document.getElementById('photo-upload-area');
    const previewArea = document.getElementById('photo-preview');
    const fileInput = document.getElementById('photo-input');
    
    uploadArea.style.display = 'block';
    previewArea.style.display = 'none';
    fileInput.value = '';
}

// ===== TEXT TO PDF FUNCTIONALITY =====
function initTextToPdf() {
    const uploadArea = document.getElementById('text-file-upload-area');
    const fileInput = document.getElementById('text-file-input');

    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        handleTextFile(e.target.files[0]);
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#b347d9';
        uploadArea.style.background = 'rgba(179, 71, 217, 0.1)';
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#00d4ff';
        uploadArea.style.background = 'rgba(0, 212, 255, 0.02)';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#00d4ff';
        uploadArea.style.background = 'rgba(0, 212, 255, 0.02)';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleTextFile(files[0]);
        }
    });

    async function handleTextFile(file) {
        if (!file) return;

        const allowedTypes = [
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/rtf',
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        const allowedExtensions = ['.txt', '.doc', '.docx', '.rtf', '.csv', '.xls', '.xlsx'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

        if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
            showError('Please select a supported file type (TXT, DOC, DOCX, RTF, CSV, XLS, XLSX).');
            return;
        }

        try {
            let text = '';
            
            if (file.type === 'text/plain' || file.type === 'text/csv' || fileExtension === '.txt' || fileExtension === '.csv') {
                // Handle plain text and CSV files
                text = await readTextFile(file);
            } else if (fileExtension === '.rtf') {
                // Handle RTF files (basic text extraction)
                const rtfContent = await readTextFile(file);
                text = extractTextFromRTF(rtfContent);
            } else {
                // For other file types, show a message about limitations
                showError('For DOC, DOCX, XLS, and XLSX files, please copy and paste the content into the text area below, as these formats require specialized parsing that works best when pasted as text.');
                return;
            }

            if (text.trim()) {
                const textArea = document.getElementById('text-input');
                textArea.value = text;
                textArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Visual feedback
                uploadArea.style.borderColor = '#00ff88';
                uploadArea.style.background = 'rgba(0, 255, 136, 0.1)';
                
                setTimeout(() => {
                    uploadArea.style.borderColor = '#00d4ff';
                    uploadArea.style.background = 'rgba(0, 212, 255, 0.02)';
                }, 2000);
            } else {
                showError('No text content found in the file.');
            }

        } catch (error) {
            console.error('Error reading file:', error);
            showError('Failed to read the file. Please try again or paste the content manually.');
        }
    }

    function readTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    function extractTextFromRTF(rtfContent) {
        // Basic RTF text extraction (removes RTF formatting codes)
        let text = rtfContent;
        
        // Remove RTF header and control words
        text = text.replace(/\\rtf\d+/g, '');
        text = text.replace(/\\[a-z]+\d*/g, '');
        text = text.replace(/\\[^a-z]/g, '');
        text = text.replace(/[{}]/g, '');
        
        // Clean up extra whitespace
        text = text.replace(/\s+/g, ' ').trim();
        
        return text;
    }
}

function convertTextToPDF() {
    const textInput = document.getElementById('text-input');
    const text = textInput.value.trim();
    
    if (!text) {
        showError('Please enter some text to convert.');
        return;
    }
    
    try {
        // Create new PDF document
        const pdf = new jsPDF();
        
        // Set font and size
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(12);
        
        // Split text into lines that fit the page width
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 20;
        const maxWidth = pageWidth - (margin * 2);
        
        const lines = pdf.splitTextToSize(text, maxWidth);
        
        // Add text to PDF with proper line spacing
        let yPosition = margin;
        const lineHeight = 7;
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        for (let i = 0; i < lines.length; i++) {
            // Check if we need a new page
            if (yPosition + lineHeight > pageHeight - margin) {
                pdf.addPage();
                yPosition = margin;
            }
            
            pdf.text(lines[i], margin, yPosition);
            yPosition += lineHeight;
        }
        
        // Generate filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `text-to-pdf-${timestamp}.pdf`;
        
        // Download PDF
        const pdfBlob = pdf.output('blob');
        downloadFile(pdfBlob, filename);
        
    } catch (error) {
        console.error('Error converting text to PDF:', error);
        showError('Failed to convert text to PDF. Please try again.');
    }
}

function clearText() {
    const textInput = document.getElementById('text-input');
    textInput.value = '';
}

// ===== PDF TO IMAGE FUNCTIONALITY =====
function initPdfToImage() {
    const uploadArea = document.getElementById('pdf-upload-area');
    const fileInput = document.getElementById('pdf-input');
    const previewArea = document.getElementById('pdf-preview');

    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        handlePdfFile(e.target.files[0]);
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#b347d9';
        uploadArea.style.background = 'rgba(179, 71, 217, 0.1)';
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#00d4ff';
        uploadArea.style.background = 'rgba(0, 212, 255, 0.02)';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#00d4ff';
        uploadArea.style.background = 'rgba(0, 212, 255, 0.02)';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handlePdfFile(files[0]);
        }
    });

    async function handlePdfFile(file) {
        if (!file || file.type !== 'application/pdf') {
            showError('Please select a valid PDF file.');
            return;
        }

        uploadArea.style.display = 'none';
        previewArea.style.display = 'block';
        showLoading('pdf-loading');

        try {
            const arrayBuffer = await file.arrayBuffer();
            await convertPdfToImages(arrayBuffer);
        } catch (error) {
            console.error('Error processing PDF:', error);
            showError('Failed to process PDF file. Please try again.');
            uploadArea.style.display = 'block';
            previewArea.style.display = 'none';
        }
    }
}

async function convertPdfToImages(arrayBuffer) {
    try {
        // Load PDF using pdf.js
        const loadingTask = pdfjsLib.getDocument(arrayBuffer);
        const pdf = await loadingTask.promise;
        
        const container = document.getElementById('pdf-images-container');
        container.innerHTML = '';
        
        hideLoading('pdf-loading');
        
        // Process each page
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            
            // Set up canvas for rendering
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            // Render page to canvas
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            
            await page.render(renderContext).promise;
            
            // Create container for this page
            const pageContainer = document.createElement('div');
            pageContainer.className = 'pdf-page-container';
            
            const pageTitle = document.createElement('h4');
            pageTitle.textContent = `Page ${pageNum}`;
            
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'btn btn-primary';
            downloadBtn.textContent = 'Download PNG';
            downloadBtn.style.marginTop = '16px';
            
            downloadBtn.onclick = () => {
                canvas.toBlob((blob) => {
                    downloadFile(blob, `page-${pageNum}.png`);
                }, 'image/png');
            };
            
            pageContainer.appendChild(pageTitle);
            pageContainer.appendChild(canvas);
            pageContainer.appendChild(downloadBtn);
            container.appendChild(pageContainer);
        }
        
    } catch (error) {
        console.error('Error converting PDF to images:', error);
        showError('Failed to convert PDF to images. Please try again.');
        hideLoading('pdf-loading');
    }
}

// ===== PDF TO TEXT FUNCTIONALITY =====
function initPdfToText() {
    const uploadArea = document.getElementById('pdf-text-upload-area');
    const fileInput = document.getElementById('pdf-text-input');
    const previewArea = document.getElementById('pdf-text-preview');

    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        handlePdfTextFile(e.target.files[0]);
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#b347d9';
        uploadArea.style.background = 'rgba(179, 71, 217, 0.1)';
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#00d4ff';
        uploadArea.style.background = 'rgba(0, 212, 255, 0.02)';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#00d4ff';
        uploadArea.style.background = 'rgba(0, 212, 255, 0.02)';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handlePdfTextFile(files[0]);
        }
    });

    async function handlePdfTextFile(file) {
        if (!file || file.type !== 'application/pdf') {
            showError('Please select a valid PDF file.');
            return;
        }

        uploadArea.style.display = 'none';
        previewArea.style.display = 'block';
        showLoading('pdf-text-loading');

        try {
            const arrayBuffer = await file.arrayBuffer();
            await extractTextFromPdf(arrayBuffer);
        } catch (error) {
            console.error('Error processing PDF:', error);
            showError('Failed to extract text from PDF. Please try again.');
            uploadArea.style.display = 'block';
            previewArea.style.display = 'none';
        }
    }
}

async function extractTextFromPdf(arrayBuffer) {
    try {
        // Load PDF using pdf.js
        const loadingTask = pdfjsLib.getDocument(arrayBuffer);
        const pdf = await loadingTask.promise;
        
        let fullText = '';
        
        // Extract text from each page
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            
            // Combine text items
            const pageText = textContent.items
                .map(item => item.str)
                .join(' ');
            
            fullText += `--- Page ${pageNum} ---\n${pageText}\n\n`;
        }
        
        // Display extracted text
        extractedTextContent = fullText.trim();
        const textArea = document.getElementById('extracted-text');
        textArea.value = extractedTextContent;
        
        hideLoading('pdf-text-loading');
        
        const textOutput = document.querySelector('.text-output');
        textOutput.classList.add('active');
        textOutput.style.display = 'block';
        
        if (!extractedTextContent) {
            textArea.value = 'No text found in this PDF file. The PDF may contain only images or scanned content.';
        }
        
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        showError('Failed to extract text from PDF. Please try again.');
        hideLoading('pdf-text-loading');
    }
}

function downloadExtractedText() {
    if (!extractedTextContent) {
        showError('No text available to download.');
        return;
    }
    
    const blob = new Blob([extractedTextContent], { type: 'text/plain' });
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `extracted-text-${timestamp}.txt`;
    
    downloadFile(blob, filename);
}

function copyExtractedText() {
    const textArea = document.getElementById('extracted-text');
    
    if (!textArea.value.trim()) {
        showError('No text available to copy.');
        return;
    }
    
    // Select and copy text
    textArea.select();
    textArea.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        document.execCommand('copy');
        
        // Visual feedback
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.background = 'var(--success)';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 2000);
        
    } catch (error) {
        console.error('Failed to copy text:', error);
        showError('Failed to copy text. Please try manually selecting and copying.');
    }
}

// ===== MODAL FUNCTIONALITY =====
// Close modal when clicking outside of it
window.addEventListener('click', (event) => {
    const modal = document.getElementById('thank-you-modal');
    if (event.target === modal) {
        closeThankYouModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeThankYouModal();
    }
});

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all tools
    initPhotoToPdf();
    initTextToPdf();
    initPdfToImage();
    initPdfToText();
    
    // Set up PDF.js worker
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
    
    // Smooth scrolling for any internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    console.log('PDF Galaxy initialized successfully! 🌟');
});

// ===== SECTION NAVIGATION =====
function showSection(sectionName) {
    // Hide all sections
    const sections = ['main', 'about', 'privacy', 'terms', 'faq'];
    sections.forEach(section => {
        const element = document.getElementById(section === 'main' ? 'main-content' : section);
        if (element) {
            if (section === 'main') {
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }
        }
    });
    
    // Show requested section
    if (sectionName === 'main') {
        document.querySelector('.main-content').style.display = 'block';
        document.querySelector('.header').style.display = 'block';
        document.querySelectorAll('.ad-banner').forEach(banner => {
            banner.style.display = 'flex';
        });
    } else {
        document.querySelector('.main-content').style.display = 'none';
        document.querySelector('.header').style.display = 'none';
        document.querySelectorAll('.ad-banner').forEach(banner => {
            banner.style.display = 'none';
        });
        document.getElementById(sectionName).style.display = 'block';
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== ERROR HANDLING =====
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
});

// ===== PERFORMANCE OPTIMIZATION =====
// Preload critical resources
const preloadCriticalResources = () => {
    // Preload PDF.js worker
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    link.as = 'script';
    document.head.appendChild(link);
};

// Call preload function
preloadCriticalResources();