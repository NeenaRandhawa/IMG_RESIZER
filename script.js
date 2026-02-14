// --- Elements ---
const uploadBox = document.getElementById("upload-box");
const fileInput = document.getElementById("file-input");
const editorPanel = document.getElementById("editor-panel");
const imageElement = document.getElementById("image-to-edit");

const widthInput = document.getElementById("width-input");
const heightInput = document.getElementById("height-input");
const sizePreset = document.getElementById("size-preset");
const qualitySlider = document.getElementById("quality-slider");
const qualityValue = document.getElementById("quality-value");
const downloadBtn = document.getElementById("download-btn");

// Toolbar Buttons
const rotateLeftBtn = document.getElementById("rotate-left");
const rotateRightBtn = document.getElementById("rotate-right");
const flipXBtn = document.getElementById("flip-x");
const flipYBtn = document.getElementById("flip-y");
const resetBtn = document.getElementById("reset-crop");

let cropper = null;
let scaleX = 1;
let scaleY = 1;

// --- Extensive Sizes Database (Pixels) ---
const presets = {
    // Documents (High DPI for Print)
    passport: { w: 413, h: 531 },   // 3.5cm x 4.5cm @ 300dpi
    pancard: { w: 295, h: 413 },    // 2.5cm x 3.5cm
    idcard: { w: 1004, h: 638 },    // CR80 Card
    visa_us: { w: 600, h: 600 },    // 2x2 inch

    // Mobile
    mobile_hd: { w: 1080, h: 1920 },
    iphone_pro: { w: 1290, h: 2796 },
    samsung_s: { w: 1440, h: 3088 },

    // Tablets & Desktop
    ipad: { w: 2048, h: 2732 },
    laptop: { w: 1920, h: 1080 },
    macbook_pro: { w: 3456, h: 2234 },
    desktop_4k: { w: 3840, h: 2160 },

    // Social Media
    insta_sq: { w: 1080, h: 1080 },
    insta_port: { w: 1080, h: 1350 },
    story: { w: 1080, h: 1920 },
    yt_thumb: { w: 1280, h: 720 },
    yt_banner: { w: 2560, h: 1440 },
    twitter_header: { w: 1500, h: 500 },
    linkedin_banner: { w: 1584, h: 396 }
};

// --- 1. Initialize Cropper ---
uploadBox.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    imageElement.src = url;

    uploadBox.style.display = "none";
    editorPanel.style.display = "block";

    if (cropper) cropper.destroy();

    cropper = new Cropper(imageElement, {
        viewMode: 1,
        dragMode: 'move',
        autoCropArea: 0.8,
        restore: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
        ready() {
            // Default: Image ke original size inputs mein dikhao
            widthInput.value = Math.round(imageElement.naturalWidth);
            heightInput.value = Math.round(imageElement.naturalHeight);
        }
    });
});

// --- 2. Toolbar Logic ---
rotateLeftBtn.addEventListener("click", () => cropper.rotate(-90));
rotateRightBtn.addEventListener("click", () => cropper.rotate(90));
flipXBtn.addEventListener("click", () => {
    scaleX = -scaleX;
    cropper.scaleX(scaleX);
});
flipYBtn.addEventListener("click", () => {
    scaleY = -scaleY;
    cropper.scaleY(scaleY);
});
resetBtn.addEventListener("click", () => {
    cropper.reset();
    sizePreset.value = "custom";
});

// --- 3. Preset Selection Logic (Main Feature) ---
sizePreset.addEventListener("change", () => {
    const selected = sizePreset.value;

    if (selected === "custom") {
        // Free Crop Mode
        cropper.setAspectRatio(NaN);
        return;
    }

    const size = presets[selected];
    if (size) {
        // 1. Inputs update karo
        widthInput.value = size.w;
        heightInput.value = size.h;
        
        // 2. Cropper ka Aspect Ratio Set karo
        // Isse crop box automatically sahi shape le lega (e.g., Square for Instagram)
        cropper.setAspectRatio(size.w / size.h);
    }
});

// Quality Display
qualitySlider.addEventListener("input", () => {
    qualityValue.innerText = `${qualitySlider.value}%`;
});

// --- 4. Download Logic ---
downloadBtn.addEventListener("click", () => {
    if (!cropper) return;

    const w = parseInt(widthInput.value);
    const h = parseInt(heightInput.value);

    // Get the cropped area
    const canvas = cropper.getCroppedCanvas({
        fillColor: '#fff', // Agar transparent PNG jpg banegi toh white background aayega
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
    });

    // Create a new resized canvas
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = w;
    finalCanvas.height = h;
    const ctx = finalCanvas.getContext("2d");

    // Draw resized image
    ctx.drawImage(canvas, 0, 0, w, h);

    // Download
    const quality = qualitySlider.value / 100;
    const link = document.createElement("a");
    link.download = `pixelperfect_${Date.now()}.jpg`;
    link.href = finalCanvas.toDataURL("image/jpeg", quality);
    link.click();
});