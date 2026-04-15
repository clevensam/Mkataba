import jsPDF from "jspdf";
import { toPng } from "html-to-image";

export async function generateContractPDF(elementId: string, fileName: string) {
  const element = document.getElementById(elementId);
  if (!element) throw new Error("Element not found");

  // Use html-to-image instead of html2canvas for better modern CSS support
  const imgData = await toPng(element, {
    quality: 1.0,
    pixelRatio: 2,
    backgroundColor: "#ffffff",
  });
  
  // Create a temporary image to get dimensions
  const img = new Image();
  img.src = imgData;
  await new Promise((resolve) => (img.onload = resolve));

  // A4 dimensions in mm: 210 x 297
  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  
  const imgWidth = img.width;
  const imgHeight = img.height;
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  
  const finalWidth = imgWidth * ratio;
  const finalHeight = imgHeight * ratio;
  
  // Center horizontally
  const x = (pdfWidth - finalWidth) / 2;
  const y = 10; // Top margin

  pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);
  pdf.save(fileName);
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}
