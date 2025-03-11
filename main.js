document.getElementById("upload1").addEventListener("change", (e) => handleUpload(e, 1));
document.getElementById("upload2").addEventListener("change", (e) => handleUpload(e, 2));

const currentImgs = { 1: null, 2: null };

function handleUpload(e, id) {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    currentImgs[id] = img;
    processImage(img, id);
  };
  img.src = URL.createObjectURL(file);
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
  const width = parseInt(document.getElementById(`customWidth${id}`).value) || 320;
  const height = parseInt(document.getElementById(`customHeight${id}`).value) || 320;

  // Resize wrapper to match canvas
  const wrapper = document.getElementById(`previewWrapper${id}`);
  wrapper.style.width = width + "px";
  wrapper.style.height = height + "px";

  const exportCanvas = document.getElementById(`exportCanvas${id}`);
  const ectx = exportCanvas.getContext("2d");
  exportCanvas.width = width;
  exportCanvas.height = height;
  ectx.clearRect(0, 0, width, height);
  ectx.imageSmoothingEnabled = true;
  ectx.imageSmoothingQuality = "high";

  const cropWidth = crop.xMax - crop.xMin;
  const cropHeight = crop.yMax - crop.yMin;

  const scale = Math.min(width / cropWidth, height / cropHeight);
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