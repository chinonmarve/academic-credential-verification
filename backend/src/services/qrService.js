const QRCode = require("qrcode");

/**
 * PUBLIC_BASE_URL controls what a QR code actually points to.
 *
 * - In local development it falls back to http://localhost:<PORT>, which is
 *   fine for testing on the same machine.
 * - Before deploying (or before demonstrating the phone-camera QR workflow
 *   from a different device), set PUBLIC_BASE_URL in backend/.env to the
 *   real public URL, e.g. https://your-domain.com — every QR generated
 *   after that automatically encodes the correct domain, no code changes
 *   needed.
 */
function getPublicBaseUrl() {
  const configured = (process.env.PUBLIC_BASE_URL || "").trim();
  if (configured) return configured.replace(/\/+$/, "");
  const port = process.env.PORT || 5000;
  return `http://localhost:${port}`;
}

/**
 * QRService
 * Encodes ONLY a safe, non-sensitive reference (credentialId or a short-lived
 * presentationId) into the QR code - never raw personal or academic data.
 *
 * The QR encodes a real, clickable verification URL (not raw JSON) so that
 * scanning it with a phone's normal camera app - not just this app's
 * in-browser scanner - takes the user straight to the public verification
 * page with the reference pre-filled.
 */
async function generateQRDataUrl(reference) {
  const verificationUrl = `${getPublicBaseUrl()}/verify?id=${encodeURIComponent(reference)}`;
  return QRCode.toDataURL(verificationUrl, { errorCorrectionLevel: "M", margin: 1, width: 260 });
}

module.exports = { generateQRDataUrl, getPublicBaseUrl };
