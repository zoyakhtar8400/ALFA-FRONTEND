import React, { useState, useRef, useEffect } from 'react';
import { FaQrcode, FaCamera, FaUpload, FaPaste, FaTimes, FaCropAlt, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { parseAadhaarQr } from '../../utils/aadhaar/parse.js';
import { scanAadhaarFile } from '../../utils/aadhaar/scan.js';
import { parseAadhaarOcr } from '../../utils/aadhaar/ocr.js';
import ImageCropper from './ImageCropper.jsx';

const AadhaarScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'upload' | 'text'
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [rawPayload, setRawPayload] = useState('');
  
  // Image Upload & Cropper state
  const [selectedImageSrc, setSelectedImageSrc] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setErrorMessage('');
      setSuccessMessage('');
      setRawPayload('');
      setSelectedImageSrc(null);
      setIsCropping(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isOpen, activeTab]);

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    setErrorMessage('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        scanVideoFrame();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setErrorMessage('Unable to access camera. Please allow camera permissions or upload an image.');
    }
  };

  const scanVideoFrame = () => {
    if (!videoRef.current || !canvasRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(scanVideoFrame);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Dynamic scanning pass via window.BarcodeDetector or jsQR if present
    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      detector.detect(canvas)
        .then(async (barcodes) => {
          if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
            stopCamera();
            await processParsedData(barcodes[0].rawValue);
          } else {
            animFrameRef.current = requestAnimationFrame(scanVideoFrame);
          }
        })
        .catch(() => {
          animFrameRef.current = requestAnimationFrame(scanVideoFrame);
        });
    } else {
      animFrameRef.current = requestAnimationFrame(scanVideoFrame);
    }
  };

  const processParsedData = async (rawString) => {
    setIsScanning(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const result = await parseAadhaarQr(rawString);
      setSuccessMessage(`Successfully decoded identity for ${result.name || 'Guest'}!`);
      if (onScanSuccess) {
        onScanSuccess(result);
      }
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.warn('QR parse failed, trying OCR fallback:', err);
      setErrorMessage(err.message || 'Failed to parse Aadhaar QR Code payload.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Load file as image URL for Cropper tool
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageSrc(reader.result);
      setIsCropping(true);
      setIsScanning(false);
    };
    reader.readAsDataURL(file);

    // Immediate auto-scan attempt on full file
    try {
      const scannedCode = await scanAadhaarFile(file);
      if (scannedCode) {
        await processParsedData(scannedCode);
      }
    } catch (err) {
      console.log('Direct file QR scan notice:', err);
    }
  };

  const handleCropComplete = async (croppedBlob) => {
    setIsCropping(false);
    setIsScanning(true);
    setErrorMessage('');

    try {
      const croppedFile = new File([croppedBlob], 'cropped_qr.png', { type: 'image/png' });
      const scannedCode = await scanAadhaarFile(croppedFile);

      if (scannedCode) {
        await processParsedData(scannedCode);
      } else {
        // Fallback: Run Tesseract OCR on cropped area
        const ocrResult = await parseAadhaarOcr(croppedBlob);
        if (ocrResult && (ocrResult.name || ocrResult.referenceId)) {
          setSuccessMessage(`Extracted identity details via OCR fallback!`);
          if (onScanSuccess) {
            onScanSuccess(ocrResult);
          }
          setTimeout(() => onClose(), 1200);
        } else {
          setErrorMessage('Could not find QR Code or text in selected area. Try zooming into the QR square.');
        }
      }
    } catch (err) {
      setErrorMessage('Error scanning selected image crop. Please try another area.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!rawPayload.trim()) return;
    await processParsedData(rawPayload.trim());
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(6px)', zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{
        background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '580px',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)'
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', background: '#0e7490', color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaQrcode size={22} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
              Aadhaar QR Scanner & Biometric Reader
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            style={{
              flex: 1, padding: '12px 8px', fontSize: '0.82rem', fontWeight: 800, border: 'none',
              background: activeTab === 'camera' ? '#fff' : 'transparent',
              color: activeTab === 'camera' ? '#0e7490' : '#64748b',
              borderBottom: activeTab === 'camera' ? '3px solid #0e7490' : '3px solid transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            <FaCamera /> Camera Scan
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            style={{
              flex: 1, padding: '12px 8px', fontSize: '0.82rem', fontWeight: 800, border: 'none',
              background: activeTab === 'upload' ? '#fff' : 'transparent',
              color: activeTab === 'upload' ? '#0e7490' : '#64748b',
              borderBottom: activeTab === 'upload' ? '3px solid #0e7490' : '3px solid transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            <FaUpload /> Upload & Crop
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('text')}
            style={{
              flex: 1, padding: '12px 8px', fontSize: '0.82rem', fontWeight: 800, border: 'none',
              background: activeTab === 'text' ? '#fff' : 'transparent',
              color: activeTab === 'text' ? '#0e7490' : '#64748b',
              borderBottom: activeTab === 'text' ? '3px solid #0e7490' : '3px solid transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            <FaPaste /> Paste QR Text
          </button>
        </div>

        {/* Tab Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {errorMessage && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b',
              padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.8rem',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <FaExclamationTriangle size={14} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div style={{
              background: '#f0fdf4', border: '1px solid #86efac', color: '#166534',
              padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.82rem',
              display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700
            }}>
              <FaCheck size={14} style={{ flexShrink: 0 }} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: CAMERA SCAN */}
          {activeTab === 'camera' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                position: 'relative', width: '100%', maxWidth: '400px', height: '280px',
                borderRadius: '12px', overflow: 'hidden', background: '#000', border: '3px solid #0e7490'
              }}>
                <video
                  ref={videoRef}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {/* Animated viewfinder overlay */}
                <div style={{
                  position: 'absolute', top: '20px', left: '20px', right: '20px', bottom: '20px',
                  border: '2px dashed #00f2fe', borderRadius: '12px', pointerEvents: 'none',
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)'
                }} />
              </div>
              <p style={{ marginTop: '12px', fontSize: '0.8rem', color: '#64748b', textAlign: 'center', fontWeight: 600 }}>
                Align the Aadhaar QR code within the viewfinder frame
              </p>
            </div>
          )}

          {/* TAB 2: UPLOAD & CROP */}
          {activeTab === 'upload' && (
            <div>
              {isCropping && selectedImageSrc ? (
                <ImageCropper
                  imageSrc={selectedImageSrc}
                  onCropComplete={handleCropComplete}
                  onCancel={() => setIsCropping(false)}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
                  <label style={{
                    width: '100%', maxWidth: '380px', padding: '30px 20px',
                    border: '2px dashed #0e7490', borderRadius: '12px', background: '#ecfeff',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                    cursor: 'pointer', transition: 'all 0.15s'
                  }}>
                    <FaUpload size={28} color="#0e7490" />
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0e7490' }}>
                      Click to Select Aadhaar Card Image
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Supports Secure QR, Legacy XML, and Card Photo OCR
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PASTE TEXT */}
          {activeTab === 'text' && (
            <form onSubmit={handleTextSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                Paste Raw Payload / 2D Scanner Barcode Data:
              </label>
              <textarea
                rows={5}
                value={rawPayload}
                onChange={e => setRawPayload(e.target.value)}
                placeholder="Paste UIDAI BigInt numbers or XML text here..."
                style={{
                  width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1',
                  fontSize: '0.78rem', fontFamily: 'monospace', outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={isScanning || !rawPayload.trim()}
                style={{
                  padding: '10px 16px', borderRadius: '8px', background: '#0e7490', color: '#fff',
                  fontWeight: 800, fontSize: '0.85rem', border: 'none', cursor: 'pointer'
                }}
              >
                {isScanning ? 'Decoding...' : 'Decode Payload'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AadhaarScannerModal;
