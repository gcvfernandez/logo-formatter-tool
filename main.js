document.getElementById("upload1").addEventListener("change", (e) => handleUpload(e, 1));
document.getElementById("upload2").addEventListener("change", (e) => handleUpload(e, 2));

const currentImgs = { 1: null, 2: null };
let currentImg1 = null;
let currentImg2 = null;

function handleUpload(e, id) {
  const file = e.target.files[0];
  if (!file) return;

  const isSVG = file.type === "image/svg+xml";

  if (isSVG) {
    const reader = new FileReader();
    reader.onload = () => {
      const svgText = reader.result;

      // Create a DOMParser to get viewBox info
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
      const svgEl = svgDoc.querySelector("svg");

      const viewBox = svgEl.getAttribute("viewBox");
      let svgWidth = parseFloat(svgEl.getAttribute("width")) || 0;
      let svgHeight = parseFloat(svgEl.getAttribute("height")) || 0;

      // If width/height not set, use viewBox values
      if ((!svgWidth || !svgHeight) && viewBox) {
        const parts = viewBox.split(" ");
        svgWidth = parseFloat(parts[2]);
        svgHeight = parseFloat(parts[3]);
      }

      if (!svgWidth || !svgHeight) {
        alert("Couldn't detect SVG dimensions.");
        return;
      }

      // Target size = 4x user-selected final size
      const targetWidth = (parseInt(document.getElementById(`customWidth${id}`).value) || 320) * 4;
      const scale = targetWidth / svgWidth;
      const targetHeight = svgHeight * scale;

      // Create temporary canvas for conversion
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      const img = new Image();
      img.onload = () => {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const pngImg = new Image();
        pngImg.onload = () => {
          if (id === 1) currentImg1 = pngImg;
          if (id === 2) currentImg2 = pngImg;
          processImage(pngImg, id);
        };
        pngImg.src = canvas.toDataURL("image/png");
      };

      // Use base64-encoded SVG string
      const svgBlob = new Blob([svgText], { type: "image/svg+xml" });
      const url = URL.createObjectURL(svgBlob);
      img.src = url;
    };

    reader.readAsText(file);
  } else {
    // Regular image (PNG, JPG, etc.)
    const img = new Image();
    img.onload = () => {
      if (id === 1) currentImg1 = img;
      if (id === 2) currentImg2 = img;
      processImage(img, id);
    };
    img.src = URL.createObjectURL(file);
  }
}

function refreshPreview(id) {
  if (id === 1 && currentImg1) {
    processImage(currentImg1, 1);
  } else if (id === 2 && currentImg2) {
    processImage(currentImg2, 2);
  } else {
    alert("Meow!");
  }
}

function toggleBorderOptions(id) {
  const toggle = document.getElementById(`borderToggle${id}`);
  const options = document.getElementById(`borderOptions${id}`);
  options.style.display = toggle.checked ? "block" : "none";
}

function processImage(img, id) {
  const tempCanvas = document.getElementById("tempCanvas");
  const tctx = tempCanvas.getContext("2d");
  tempCanvas.width = img.width;
  tempCanvas.height = img.height;
  tctx.clearRect(0, 0, img.width, img.height);
  tctx.drawImage(img, 0, 0);

  const imageData = tctx.getImageData(0, 0, img.width, img.height);
  const crop = getBoundingBox(imageData);
  drawFinalImage(img, crop, id);
}

function getBoundingBox(imageData) {
  const { data, width, height } = imageData;
  let xMin = width, xMax = 0, yMin = height, yMax = 0;
  let found = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const alpha = data[i + 3];
      if (alpha > 0) {
        found = true;
        if (x < xMin) xMin = x;
        if (x > xMax) xMax = x;
        if (y < yMin) yMin = y;
        if (y > yMax) yMax = y;
      }
    }
  }

  if (!found) return { xMin: 0, xMax: width, yMin: 0, yMax: height };
  return { xMin, xMax, yMin, yMax };
}

function drawFinalImage(img, crop, id) {
  let width = parseInt(document.getElementById(`customWidth${id}`).value) || 320;
  let height;

  if (id === 1) {
    height = width; // Square for Resizer 1
  } else {
    height = parseInt(document.getElementById(`customHeight${id}`).value) || 320;
  }

  
  const padding = parseInt(document.getElementById(`padding${id}`)?.value) || 0;
  let addBorder = false;
  let borderSize = 0;
  let borderRadius = 0;
  let borderColor = "#000000";
  
  if (document.getElementById(`borderToggle${id}`)) {
    addBorder = document.getElementById(`borderToggle${id}`).checked;
    borderSize = parseInt(document.getElementById(`borderSize${id}`)?.value) || 0;
    borderRadius = parseInt(document.getElementById(`borderRadius${id}`)?.value) || 0;
    borderColor = document.getElementById(`borderColor${id}`)?.value || "#000000";
  }  

  // Resize wrapper to match canvas
  const wrapper = document.getElementById(`previewWrapper${id}`);
  wrapper.style.width = width + "px";
  wrapper.style.height = height + "px";

  const exportCanvas = document.getElementById(`exportCanvas${id}`);
  const ectx = exportCanvas.getContext("2d");
  exportCanvas.width = width;
  exportCanvas.height = height;
  ectx.clearRect(0, 0, width, height);

  // Optional border background
  if (addBorder && borderSize > 0) {
    ectx.strokeStyle = borderColor;
    ectx.lineWidth = borderSize;
    ectx.lineJoin = "round";
  
    roundRect(
      ectx,
      borderSize / 2,
      borderSize / 2,
      width - borderSize,
      height - borderSize,
      borderRadius
    );
    ectx.stroke();
  }

  ectx.imageSmoothingEnabled = true;
  ectx.imageSmoothingQuality = "high";

  const cropWidth = crop.xMax - crop.xMin;
  const cropHeight = crop.yMax - crop.yMin;
  const targetW = width - padding * 2;
  const targetH = height - padding * 2;
  const scale = Math.min(targetW / cropWidth, targetH / cropHeight);
  const drawW = cropWidth * scale;
  const drawH = cropHeight * scale;
  const offsetX = (width - drawW) / 2;
  const offsetY = (height - drawH) / 2;
  
  ectx.drawImage(
    img,
    crop.xMin, crop.yMin, cropWidth, cropHeight,
    offsetX, offsetY, drawW, drawH
  );

  // Draw preview
  const previewCanvas = document.getElementById(`preview${id}`);
  const pctx = previewCanvas.getContext("2d");
  previewCanvas.width = width;
  previewCanvas.height = height;
  pctx.clearRect(0, 0, width, height);
  pctx.imageSmoothingEnabled = true;
  pctx.imageSmoothingQuality = "high";
  pctx.drawImage(exportCanvas, 0, 0, width, height);
}

function downloadImage(id) {
  const exportCanvas = document.getElementById(`exportCanvas${id}`);
  const link = document.createElement("a");
  link.download = `logo_${id}.png`;
  link.href = exportCanvas.toDataURL("image/png");
  link.click();
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

window.addEventListener("DOMContentLoaded", () => {
  preloadImage("images/default_320.svg", 1);
  preloadImage("images/default_1170.svg", 2); // Load default logo into Resizer 1
});

function preloadImage(src, id) {
  const img = new Image();
  img.onload = () => {
    if (id === 1) currentImg1 = img;
    if (id === 2) currentImg2 = img;
    processImage(img, id);
  };
  img.src = src;
}
