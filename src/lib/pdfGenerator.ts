import jsPDF from "jspdf";
import { toPng } from "html-to-image";

export async function generateContractPDF(elementId: string, fileName: string) {
  const element = document.getElementById(elementId);
  if (!element) throw new Error("Element not found");

  try {
    // Ensure all styles are applied
    await new Promise(resolve => setTimeout(resolve, 1500));

    const imgData = await toPng(element, {
      quality: 1.0,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      cacheBust: true,
      style: {
        visibility: 'visible',
        opacity: '1'
      }
    });

    if (!imgData || imgData === "data:,") {
      throw new Error("Generated image is empty");
    }
    
    // Create a temporary image to get dimensions
    const img = new Image();
    img.src = imgData;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = img.width;
    const imgHeight = img.height;
    const ratio = Math.min(pdfWidth / (imgWidth / 2), pdfHeight / (imgHeight / 2));
    
    const finalWidth = (imgWidth / 2) * ratio;
    const finalHeight = (imgHeight / 2) * ratio;
    
    const x = (pdfWidth - finalWidth) / 2;
    const y = 10;

    pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);
    pdf.save(fileName);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}
