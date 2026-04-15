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
  // Ensure the container is in the DOM but not visible to the user
  container.style.width = "800px";
  container.style.padding = "60px";
  container.style.fontFamily = "'Inter', 'Segoe UI', Roboto, sans-serif";
  container.style.lineHeight = "1.6";
  container.style.color = "#000";
  container.style.backgroundColor = "#fff";
  container.style.position = "fixed";
  container.style.left = "0";
  container.style.top = "0";
  container.style.zIndex = "-1000";
  container.style.visibility = "hidden";
  
  // Replace placeholders
  let processedHtml = htmlContent;
  if (filledData && Object.keys(filledData).length > 0) {
    processedHtml = htmlContent.replace(/\{\{(.*?)\}\}/g, (match, id) => {
      const value = filledData[id];
      return `<span style="font-weight: bold; border-bottom: 1px solid #000; padding: 0 4px; min-width: 100px; display: inline-block;">${value || "__________"}</span>`;
    });
  } else {
    // Blank version - use a more visible placeholder
    processedHtml = htmlContent.replace(/\{\{(.*?)\}\}/g, '<span style="border-bottom: 1px solid #000; min-width: 150px; display: inline-block; margin: 0 4px;">&nbsp;</span>');
  }
  
  container.innerHTML = `
    <div style="margin-bottom: 40px; text-align: center; border-bottom: 3px solid #000; padding-bottom: 15px;">
      <h1 style="font-size: 28pt; margin: 0; font-family: serif; color: #1a202c;">${title}</h1>
    </div>
    <div style="font-size: 13pt; color: #2d3748;">
      ${processedHtml}
    </div>
    <div style="margin-top: 80px; display: flex; justify-content: space-between;">
      <div style="width: 42%; border-top: 2px solid #000; padding-top: 10px;">
        <p style="margin: 0; font-weight: bold; font-size: 11pt;">SIGNATURE</p>
        <p style="margin: 10px 0 0 0; font-size: 10pt; color: #718096;">Date: ____/____/20____</p>
      </div>
      <div style="width: 42%; border-top: 2px solid #000; padding-top: 10px;">
        <p style="margin: 0; font-weight: bold; font-size: 11pt;">SIGNATURE</p>
        <p style="margin: 10px 0 0 0; font-size: 10pt; color: #718096;">Date: ____/____/20____</p>
      </div>
    </div>
    <div style="margin-top: 40px; text-align: center; font-size: 9pt; color: #a0aec0;">
      Generated via ContractFlow • ${new Date().toLocaleDateString()}
    </div>
  `;

  document.body.appendChild(container);

  try {
    // Give more time for rendering
    await new Promise(resolve => setTimeout(resolve, 800));

    const imgData = await toPng(container, {
      quality: 1.0,
      pixelRatio: 3, // Higher quality
      backgroundColor: "#ffffff",
      skipFonts: false,
    });

    if (!imgData || imgData === "data:,") {
      throw new Error("Generated image is empty");
    }

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const img = new Image();
    img.src = imgData;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const imgWidth = img.width;
    const imgHeight = img.height;
    const ratio = Math.min(pdfWidth / (imgWidth / 3), pdfHeight / (imgHeight / 3));
    
    const finalWidth = (imgWidth / 3) * ratio;
    const finalHeight = (imgHeight / 3) * ratio;
    
    const x = (pdfWidth - finalWidth) / 2;
    const y = 10;

    pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight, undefined, 'FAST');
    pdf.save(`${title.replace(/\s+/g, "_")}${filledData ? "" : "_Blank"}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF. The document might be too large or complex. Please try again.");
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
