import React, { useState, useRef, useEffect } from 'react';
import { FaCrop, FaCheck, FaUndo } from 'react-icons/fa';

export default function ImageCropper({ imageFile, onCropComplete, onCancel }) {
  const [imgElement, setImgElement] = useState(null);
  const [cropRect, setCropRect] = useState(null); // { x, y, width, height } relative to display canvas
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!imageFile) return;
    const img = new Image();
    const url = URL.createObjectURL(imageFile);
    img.onload = () => {
      URL.revokeObjectURL(url);
      setImgElement(img);
    };
    img.src = url;
  }, [imageFile]);

  useEffect(() => {
    if (!imgElement || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Fit image inside 460px max width container
    const maxWidth = 460;
    const maxHeight = 320;
    let w = imgElement.naturalWidth || imgElement.width;
    let h = imgElement.naturalHeight || imgElement.height;

    const scale = Math.min(maxWidth / w, maxHeight / h, 1);
    const displayW = Math.round(w * scale);
    const displayH = Math.round(h * scale);

    canvas.width = displayW;
    canvas.height = displayH;

    // Draw background image
    ctx.drawImage(imgElement, 0, 0, displayW, displayH);

    // Draw dark overlay and crop selection box if present
    if (cropRect && cropRect.width > 5 && cropRect.height > 5) {
      // Semi-transparent overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(0, 0, displayW, displayH);

      // Clear crop area
      ctx.clearRect(cropRect.x, cropRect.y, cropRect.width, cropRect.height);
      ctx.drawImage(
        imgElement,
        (cropRect.x / displayW) * w,
        (cropRect.y / displayH) * h,
        (cropRect.width / displayW) * w,
        (cropRect.height / displayH) * h,
        cropRect.x,
        cropRect.y,
        cropRect.width,
        cropRect.height
      );

      // Crop border box
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(cropRect.x, cropRect.y, cropRect.width, cropRect.height);
    }
  }, [imgElement, cropRect]);

  const handlePointerDown = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDragging(true);
    setStartPos({ x, y });
    setCropRect({ x, y, width: 0, height: 0 });
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const currentY = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    const x = Math.min(startPos.x, currentX);
    const y = Math.min(startPos.y, currentY);
    const width = Math.abs(currentX - startPos.x);
    const height = Math.abs(currentY - startPos.y);

    setCropRect({ x, y, width, height });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleScanCrop = () => {
    if (!imgElement || !canvasRef.current) return;
    const canvas = document.createElement('canvas');
    const origW = imgElement.naturalWidth || imgElement.width;
    const origH = imgElement.naturalHeight || imgElement.height;
    const displayW = canvasRef.current.width;
    const displayH = canvasRef.current.height;

    if (cropRect && cropRect.width > 10 && cropRect.height > 10) {
      // Scale crop coordinates back to full image resolution
      const cropX = Math.round((cropRect.x / displayW) * origW);
      const cropY = Math.round((cropRect.y / displayH) * origH);
      const cropW = Math.round((cropRect.width / displayW) * origW);
      const cropH = Math.round((cropRect.height / displayH) * origH);

      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(imgElement, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    } else {
      // Use full image if no crop box drawn
      canvas.width = origW;
      canvas.height = origH;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(imgElement, 0, 0, origW, origH);
    }

    onCropComplete(canvas);
  };

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0e7490', margin: 0 }}>
        👇 Drag a box around the QR code on the image to crop & scan:
      </p>

      <div style={{
        border: '2px solid #0e7490', borderRadius: '8px', overflow: 'hidden',
        background: '#0f172a', cursor: 'crosshair', userSelect: 'none', touchAction: 'none'
      }}>
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{ display: 'block' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => setCropRect(null)}
          style={{
            padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1',
            background: '#ffffff', color: '#475569', fontSize: '0.8rem', fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          <FaUndo /> Reset Selection
        </button>

        <button
          type="button"
          onClick={handleScanCrop}
          style={{
            padding: '8px 20px', borderRadius: '6px', border: 'none',
            background: '#0e7490', color: '#ffffff', fontSize: '0.82rem', fontWeight: 800,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            boxShadow: '0 2px 4px rgba(14,116,144,0.25)'
          }}
        >
          <FaCheck /> Scan Selected Area
        </button>

        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '8px 16px', borderRadius: '6px', border: '1px solid #e2e8f0',
            background: '#f8fafc', color: '#64748b', fontSize: '0.8rem', fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
