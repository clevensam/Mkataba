import { jsPDF } from "jspdf";

/**
 * Generates a PDF from HTML content, optionally filling placeholders
 * @param title The title of the contract
 * @param htmlContent The HTML content of the contract template
 * @param filledData Optional data to fill placeholders
 */
export async function downloadContractPDF(title: string, htmlContent: string, filledData?: Record<string, string>) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Create a temporary container to render the HTML
  const container = document.createElement("div");
  container.style.width = "190mm"; // A4 width minus margins
  container.style.padding = "20mm";
  container.style.fontFamily = "serif";
  container.style.lineHeight = "1.6";
  container.style.color = "#000";
  container.style.backgroundColor = "#fff";
  container.style.position = "absolute";
  container.style.left = "-9999px";
  
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
      <h1 style="font-size: 24pt; margin: 0;">${title}</h1>
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
    await doc.html(container, {
      callback: function (doc) {
        doc.save(`${title.replace(/\s+/g, "_")}${filledData ? "" : "_Blank"}.pdf`);
      },
      x: 10,
      y: 10,
      width: 190,
      windowWidth: 800,
    });
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
