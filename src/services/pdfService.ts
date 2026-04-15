import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";

/**
 * Generates a PDF from HTML content, optionally filling placeholders
 * @param title The title of the contract
 * @param htmlContent The HTML content of the contract template
 * @param filledData Optional data to fill placeholders
 */
export async function downloadContractPDF(title: string, htmlContent: string, filledData?: Record<string, string>) {
  // Create a temporary container to render the HTML
  const container = document.createElement("div");
  container.style.width = "800px"; // Fixed width for consistent rendering
  container.style.padding = "40px";
  container.style.fontFamily = "'Inter', sans-serif";
  container.style.lineHeight = "1.6";
  container.style.color = "#000";
  container.style.backgroundColor = "#fff";
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  
  // Replace placeholders
  let processedHtml = htmlContent;
  if (filledData) {
    processedHtml = htmlContent.replace(/\{\{(.*?)\}\}/g, (match, id) => {
      return `<span style="font-weight: bold; border-bottom: 1px solid #000; padding: 0 4px;">${filledData[id] || "__________"}</span>`;
    });
  } else {
    // Blank version
    processedHtml = htmlContent.replace(/\{\{(.*?)\}\}/g, "____________________");
  }
  
  container.innerHTML = `
    <div style="margin-bottom: 30px; text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px;">
      <h1 style="font-size: 24pt; margin: 0; font-family: serif;">${title}</h1>
    </div>
    <div style="font-size: 12pt;">
      ${processedHtml}
    </div>
    <div style="margin-top: 50px; display: flex; justify-content: space-between;">
      <div style="width: 45%; border-top: 1px solid #000; padding-top: 5px;">
        <p style="margin: 0; font-weight: bold;">Signature</p>
        <p style="margin: 0; font-size: 10pt; color: #666;">Date: ____/____/____</p>
      </div>
      <div style="width: 45%; border-top: 1px solid #000; padding-top: 5px;">
        <p style="margin: 0; font-weight: bold;">Signature</p>
        <p style="margin: 0; font-size: 10pt; color: #666;">Date: ____/____/____</p>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    // Wait for images or fonts to load if any
    await new Promise(resolve => setTimeout(resolve, 500));

    const imgData = await toPng(container, {
      quality: 1.0,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Create a temporary image to get dimensions
    const img = new Image();
    img.src = imgData;
    await new Promise((resolve) => (img.onload = resolve));

    const imgWidth = img.width;
    const imgHeight = img.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    
    const finalWidth = imgWidth * ratio;
    const finalHeight = imgHeight * ratio;
    
    const x = (pdfWidth - finalWidth) / 2;
    const y = 10;

    pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);
    pdf.save(`${title.replace(/\s+/g, "_")}${filledData ? "" : "_Blank"}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF. Please try again.");
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Alias for backward compatibility
 */
export async function downloadBlankTemplate(title: string, htmlContent: string) {
  return downloadContractPDF(title, htmlContent);
}
