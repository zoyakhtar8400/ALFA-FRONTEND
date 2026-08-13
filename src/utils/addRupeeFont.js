import { fontBase64 } from './fontData';

export const addRupeeFont = (doc) => {
  try {
    if (!doc.existsFileInVFS('ArialRupee.ttf')) {
      doc.addFileToVFS('ArialRupee.ttf', fontBase64);
      doc.addFont('ArialRupee.ttf', 'ArialRupee', 'normal');
      doc.addFont('ArialRupee.ttf', 'ArialRupee', 'bold');
      doc.addFont('ArialRupee.ttf', 'ArialRupee', 'italic');
      doc.addFont('ArialRupee.ttf', 'ArialRupee', 'bolditalic');
    }
    doc.setFont('ArialRupee', 'normal');
  } catch (err) {
    console.warn('Error registering ArialRupee font in jsPDF:', err);
  }
};
