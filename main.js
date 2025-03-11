const upload = document.getElementById("upload");
upload.addEventListener("change", handleUpload);

let currentImg = null;

function handleUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    currentImg = img;
    processImage(img);
  };
  img.src = URL.createObjectURL(file);
}

function processImage(img) {
  const tempCanvas = document.getElementById("tempCanvas");
  const tctx = tempCanvas.getContext("2d");
  tempCanvas.width = img.width;
  tempCanvas.height = img.height;
  tctx.clearRect(0, 0, img.width, img.height);
  tctx.drawImage(img, 0, 0);

  const imageData = tctx.getImageData(0, 0, img.width, img.height);
  const crop = getBoundingBox(imageData);
  drawFinalImage(img, crop);
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

function drawFinalImage(img, crop) {
  const exportCanvas = document.getElementById("exportCanvas");
  const ectx = exportCanvas.getContext("2d");
  const previewCanvas = document.getElementById("preview");
  const pctx = previewCanvas.getContext("2d");

  const width = parseInt(document.getElementById("customWidth").value) || 320;
  const height = parseInt(document.getElementById("customHeight").value) || 320;
  const padding = 0;

  // Dynamically update wrapper size to match canvas
  const wrapper = document.getElementById("previewWrapper");
  wrapper.style.width = width + "px";
  wrapper.style.height = height + "px";

  exportCanvas.width = width;
  exportCanvas.height = height;
  ectx.clearRect(0, 0, width, height);

  // High-quality smoothing
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

  // Preview update
  previewCanvas.width = width;
  previewCanvas.height = height;
  pctx.clearRect(0, 0, width, height);
  pctx.imageSmoothingEnabled = true;
  pctx.imageSmoothingQuality = "high";
  pctx.drawImage(exportCanvas, 0, 0, width, height);
}

function downloadImage() {
  const exportCanvas = document.getElementById("exportCanvas");
  const link = document.createElement("a");
  link.download = "logo.png";
  link.href = exportCanvas.toDataURL("image/png");
  link.click();
}