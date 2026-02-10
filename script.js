// Hamburger Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close menu when nav link is clicked
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth Scrolling for CTA Button
const ctaButton = document.querySelector('.cta-button');
ctaButton.addEventListener('click', () => {
    document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
});

// ============ DOCUMENT UPLOAD FEATURE ============

// Document Upload Handling
const uploadArea = document.getElementById('uploadArea');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const documentsList = document.getElementById('documentsList');

// Store documents in localStorage
let uploadedDocuments = JSON.parse(localStorage.getItem('uploadedDocuments')) || [];

// Initialize documents display
displayDocuments();

// Upload button click
uploadBtn.addEventListener('click', () => {
    fileInput.click();
});

// File input change
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// Drag and drop
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

// Handle file uploads
function handleFiles(files) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                         'application/vnd.ms-excel',
                         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                         'image/jpeg', 'image/png', 'image/jpg'];

    Array.from(files).forEach(file => {
        // Validate file
        if (file.size > maxSize) {
            showErrorNotification(`${file.name} is too large (Max 5MB)`);
            return;
        }

        if (!allowedTypes.includes(file.type)) {
            showErrorNotification(`${file.name} has unsupported format`);
            return;
        }

        // Create file object
        const fileObj = {
            id: Date.now() + Math.random(),
            name: file.name,
            size: formatFileSize(file.size),
            type: getFileType(file.type),
            date: new Date().toLocaleDateString(),
            data: null // For local storage, we'll store the file info only
        };

        // Store as data URL if it's an image
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                fileObj.data = e.target.result;
                uploadedDocuments.push(fileObj);
                saveDocuments();
                displayDocuments();
                showSuccessNotification(`${file.name} uploaded successfully!`);
            };
            reader.readAsDataURL(file);
        } else {
            uploadedDocuments.push(fileObj);
            saveDocuments();
            displayDocuments();
            showSuccessNotification(`${file.name} uploaded successfully!`);
        }
    });

    // Reset file input
    fileInput.value = '';
}

// Get file type
function getFileType(mimeType) {
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('word')) return 'word';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'sheet';
    if (mimeType.startsWith('image/')) return 'image';
    return 'other';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Display documents
function displayDocuments() {
    const emptyState = documentsList.querySelector('.empty-state');
    const existingCards = documentsList.querySelectorAll('.document-card');
    existingCards.forEach(card => card.remove());

    if (uploadedDocuments.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        uploadedDocuments.forEach(doc => {
            const card = createDocumentCard(doc);
            documentsList.appendChild(card);
        });
    }
}

// Create document card
function createDocumentCard(doc) {
    const card = document.createElement('div');
    card.className = 'document-card';
    
    const iconClass = {
        pdf: 'fas fa-file-pdf',
        word: 'fas fa-file-word',
        sheet: 'fas fa-file-excel',
        image: 'fas fa-image',
        other: 'fas fa-file'
    }[doc.type];

    card.innerHTML = `
        <div class="document-icon ${doc.type}">
            <i class="${iconClass}"></i>
        </div>
        <div class="document-info">
            <div class="document-name">${doc.name}</div>
            <div class="document-details">
                <span class="document-size"><i class="fas fa-compact-disc"></i> ${doc.size}</span>
                <span class="document-date"><i class="fas fa-calendar"></i> ${doc.date}</span>
            </div>
        </div>
        <div class="document-actions">
            <button class="document-btn preview-btn" title="Preview" onclick="previewDocument('${doc.id}')">
                <i class="fas fa-eye"></i>
            </button>
            <button class="document-btn delete-btn" title="Delete" onclick="deleteDocument('${doc.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    return card;
}

// Preview document
function previewDocument(docId) {
    console.log('Preview clicked for:', docId);
    const doc = uploadedDocuments.find(d => d.id == docId);
    
    if (!doc) {
        showErrorNotification('Document not found');
        return;
    }

    if (doc.type === 'image' && doc.data) {
        showImagePreview(doc);
    } else if (doc.type === 'pdf') {
        showNotification('PDF: ' + doc.name);
    } else {
        showNotification(doc.type + ': ' + doc.name);
    }
}

// Show image preview in modal
function showImagePreview(doc) {
    console.log('Preview modal for:', doc.name, 'Has data:', !!doc.data);
    
    if (!doc.data) {
        showErrorNotification('Cannot preview - no image data');
        return;
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'preview-modal-overlay';
    overlay.onclick = function(e) {
        if (e.target === this) this.remove();
    };
    
    const content = document.createElement('div');
    content.className = 'preview-modal-content';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'preview-close-btn';
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    closeBtn.onclick = function() { overlay.remove(); };
    
    const img = document.createElement('img');
    img.className = 'preview-image';
    img.src = doc.data;
    img.alt = doc.name;
    
    const filename = document.createElement('div');
    filename.className = 'preview-filename';
    filename.textContent = doc.name;
    
    content.appendChild(closeBtn);
    content.appendChild(img);
    content.appendChild(filename);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
}

// Download document
function downloadDocument(docId) {
    const doc = uploadedDocuments.find(d => d.id == docId);
    if (!doc) return;

    if (doc.data) {
        // For base64 data (images)
        const link = document.createElement('a');
        link.href = doc.data;
        link.download = doc.name;
        link.click();
    } else {
        // For other types, show message
        showNotification('Please re-upload this document to download.');
    }
}

// PDF Notification
function showPDFNotification() {
    showNotification('📄 PDF uploaded successfully! (Preview coming soon)');
}

// Delete document
function deleteDocument(docId) {
    if (confirm('Are you sure you want to delete this document?')) {
        uploadedDocuments = uploadedDocuments.filter(d => d.id != docId);
        saveDocuments();
        displayDocuments();
        showSuccessNotification('Document deleted successfully!');
    }
}

// Save documents to localStorage
function saveDocuments() {
    localStorage.setItem('uploadedDocuments', JSON.stringify(uploadedDocuments));
}

// Success Notification
function showSuccessNotification(message) {
    showNotificationWithColor(message, '#10b981', '#34d399');
}

// Error Notification
function showErrorNotification(message) {
    showNotificationWithColor(message, '#ef4444', '#f87171');
}

// Generic Notification
function showNotification(message) {
    showNotificationWithColor(message, '#6366f1', '#818cf8');
}

function showNotificationWithColor(message, color1, color2) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(45deg, ${color1}, ${color2});
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 2000;
        max-width: 400px;
        animation: slideIn 0.4s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.4s ease-out forwards';
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

// ============ END DOCUMENT UPLOAD FEATURE ============

// ============ EMAIL.JS INITIALIZATION ============

// Initialize EmailJS (Replace with your EmailJS Account ID - get from emailjs.com)
emailjs.init("R_6e1PCSyZrqclkbo"); // We'll set this up below

// ============ CONTACT FORM WITH EMAIL INTEGRATION ============

const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nameInput = contactForm.querySelector('input[type="text"]');
    const emailInput = contactForm.querySelector('input[type="email"]');
    const subjectInput = contactForm.querySelectorAll('input[type="text"]')[1];
    const messageInput = contactForm.querySelector('textarea');
    
    // Validation
    if (!nameInput.value.trim() || !emailInput.value.trim() || !subjectInput.value.trim() || !messageInput.value.trim()) {
        showErrorNotification('Please fill all fields!');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value)) {
        showErrorNotification('Please enter a valid email!');
        return;
    }
    
    // Send email using EmailJS
    sendContactEmail({
        name: nameInput.value,
        email: emailInput.value,
        subject: subjectInput.value,
        message: messageInput.value
    });
});

// Send contact form email
function sendContactEmail(data) {
    console.log('Send email clicked');
    
    if (typeof emailjs === 'undefined') {
        showErrorNotification('EmailJS not loaded. Refresh page and try again.');
        return;
    }
    
    showNotification('Sending message...');
    
    const templateParams = {
        to_email: 'rohitkanoujiya1815@gmail.com',
        from_name: data.name,
        from_email: data.email,
        subject: data.subject,
        message: data.message,
        reply_to: data.email
    };
    
    emailjs.send('service_i1pv8xr', 'template_n6qtpq5', templateParams)
        .then(function(response) {
            console.log('Email sent');
            showSuccessNotification('Message sent! We will reply soon.');
            contactForm.reset();
        })
        .catch(function(error) {
            console.error('Email failed:', error);
            showErrorNotification('Send failed: ' + (error.text || 'Please check template setup'));
        });
}

// Success Message
function showSuccessMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #10b981, #34d399);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
        z-index: 2000;
        animation: slideIn 0.5s ease-out;
    `;
    message.textContent = '✓ Message sent successfully!';
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.animation = 'slideOut 0.5s ease-out forwards';
        setTimeout(() => message.remove(), 500);
    }, 3000);
}

// Scroll Animation for Elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'slideInUp 0.6s ease-out forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe skill cards and project cards
document.querySelectorAll('.skill-card, .project-card, .stat').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

// Active Nav Link Indicator
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.style.color = 'var(--primary-color)';
        } else {
            link.style.color = 'var(--light-text)';
        }
    });
});

// Parallax Effect on Hero
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    const scrollPosition = window.scrollY;
    if (hero) {
        hero.style.transform = `translateY(${scrollPosition * 0.5}px)`;
    }
});

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Animate skill progress bars on scroll
const skillProgress = document.querySelectorAll('.progress-bar');
let hasAnimated = false;

const skillsSection = document.querySelector('.skills');
const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
            skillProgress.forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0';
                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
            });
            hasAnimated = true;
        }
    });
}, { threshold: 0.5 });

if (skillsSection) {
    skillsObserver.observe(skillsSection);
}

// Tooltip for social links
const socialIcons = document.querySelectorAll('.social-icon');
socialIcons.forEach(icon => {
    icon.addEventListener('mouseenter', (e) => {
        const tooltip = icon.getAttribute('title');
        const tooltipEl = document.createElement('div');
        tooltipEl.style.cssText = `
            position: absolute;
            bottom: 60px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            white-space: nowrap;
            font-size: 0.85rem;
            z-index: 1000;
        `;
        tooltipEl.textContent = tooltip;
        icon.style.position = 'relative';
        icon.appendChild(tooltipEl);
        
        setTimeout(() => {
            tooltipEl.style.opacity = '0';
            tooltipEl.style.transition = 'opacity 0.3s ease';
        }, 2000);
    });
});

// Dark mode toggle (optional feature)
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Type animation effect for hero text (optional)
function typeAnimation(element, text, speed = 50) {
    let index = 0;
    element.textContent = '';
    
    function type() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize type animation on page load
window.addEventListener('load', () => {
    // Uncomment to enable type animation
    // const heroTitle = document.querySelector('.hero-title');
    // if (heroTitle) {
    //     typeAnimation(heroTitle, heroTitle.textContent);
    // }
});

// Add ripple effect to buttons
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        left: ${x}px;
        top: ${y}px;
        animation: rippleAnimation 0.6s ease-out;
        pointer-events: none;
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// Add ripple to all buttons
document.querySelectorAll('button, .project-link').forEach(button => {
    button.addEventListener('click', createRipple);
});

// Add CSS animation for ripple effect
const style = document.createElement('style');
style.textContent = `
    @keyframes rippleAnimation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// Scroll to top functionality (add button to HTML if needed)
window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        if (!document.querySelector('.scroll-to-top')) {
            const scrollBtn = document.createElement('button');
            scrollBtn.className = 'scroll-to-top';
            scrollBtn.innerHTML = '↑';
            scrollBtn.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 40px;
                height: 40px;
                background: linear-gradient(45deg, #6366f1, #ec4899);
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                z-index: 999;
                animation: slideUp 0.3s ease-out;
            `;
            
            scrollBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                scrollBtn.remove();
            });
            
            document.body.appendChild(scrollBtn);
        }
    }
});

// Add slide up animation
const scrollUpStyle = document.createElement('style');
scrollUpStyle.textContent = `
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(scrollUpStyle);

// Console message
console.log('%c Welcome to My Portfolio! ', 'background: linear-gradient(45deg, #6366f1, #ec4899); color: white; padding: 10px 20px; border-radius: 5px; font-weight: bold; font-size: 14px;');
console.log('%c Feel free to connect with me on LinkedIn or GitHub! ', 'background: #0f172a; color: #6366f1; padding: 5px 10px; border-radius: 3px;');
