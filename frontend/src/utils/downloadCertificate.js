import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function downloadCertificateAsPdf(node, filename) {
  if (!node) throw new Error("Certificate preview is not ready. Please try again.");

  const canvas = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#FBFAF5",
    logging: false
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  pdf.addImage(imgData, "PNG", 0, 0, 297, 210, undefined, "FAST");
  pdf.save(filename);
}
