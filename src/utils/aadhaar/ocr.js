import { createWorker } from 'tesseract.js';
import { GENDER_LABELS } from './types.js';

/**
 * Extracts identity fields from Aadhaar Card image via Tesseract OCR fallback
 */
export async function parseAadhaarOcr(imageSource) {
  let worker = null;
  try {
    worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(imageSource);
    await worker.terminate();

    if (!text || text.trim().length === 0) return null;

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const fullText = text.replace(/\r?\n/g, ' ');

    // 1. Extract 12-digit Aadhaar Number (pattern: 4722 1288 8060 or 472212888060)
    let last4 = '';
    let referenceId = '';
    const aadhaarMatch = fullText.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/);
    if (aadhaarMatch) {
      const cleanNum = aadhaarMatch[0].replace(/\s+/g, '');
      last4 = cleanNum.slice(-4);
      referenceId = cleanNum;
    }

    // 2. Extract DOB / YOB (pattern: 10/09/2002 or 2002)
    let dob = '';
    let age = '';
    const dobMatch = fullText.match(/(?:DOB|Date of Birth|birth|DOB:)\s*[:\s]?\s*(\d{2}\/\d{2}\/\d{4})/i)
      || fullText.match(/\b(\d{2}\/\d{2}\/\d{4})\b/);
    if (dobMatch) {
      dob = dobMatch[1];
      const parts = dob.split('/');
      if (parts.length === 3) {
        const birthYear = parseInt(parts[2], 10);
        const currentYear = new Date().getFullYear();
        if (birthYear > 1900 && birthYear <= currentYear) {
          age = String(currentYear - birthYear);
        }
      }
    }

    // 3. Extract Gender (MALE / FEMALE / TRANSGENDER)
    let gender = '';
    if (/FEMALE/i.test(fullText)) {
      gender = 'Female';
    } else if (/MALE/i.test(fullText)) {
      gender = 'Male';
    } else if (/TRANSGENDER/i.test(fullText)) {
      gender = 'Other';
    }

    // 4. Extract Name
    // Usually line above DOB or line after "GOVERNMENT OF INDIA" / "Government of India"
    let name = '';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/Government of India|INDIA|BHARAT|SARKAR/i.test(line)) {
        // Next non-header line is usually Name
        for (let j = i + 1; j < lines.length; j++) {
          const candidate = lines[j].replace(/[^a-zA-Z\s.]/g, '').trim();
          if (candidate.length > 2 && !/Government|India|Sarkar|DOB|Male|Female|Father/i.test(candidate)) {
            name = candidate;
            break;
          }
        }
        if (name) break;
      }
    }

    // Fallback name search if not found
    if (!name) {
      for (const line of lines) {
        const clean = line.replace(/[^a-zA-Z\s.]/g, '').trim();
        if (clean.length > 3 && !/Government|India|Father|Address|Male|Female|Date/i.test(clean)) {
          name = clean;
          break;
        }
      }
    }

    if (!name && !last4 && !dob) return null;

    return {
      version: 'OCR Extracted',
      referenceId,
      last4,
      name,
      dob,
      age,
      gender,
      address: {},
      fullAddress: '',
      photoBytes: null,
      photoMime: null,
      isOcrFallback: true,
      warnings: ['Extracted via OCR document reader (QR code matrix too low resolution).']
    };
  } catch (err) {
    console.error('Tesseract OCR parsing error:', err);
    if (worker) {
      try { await worker.terminate(); } catch (e) {}
    }
    return null;
  }
}
