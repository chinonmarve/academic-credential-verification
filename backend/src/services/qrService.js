const QRCode = require("qrcode");

/**
 * Resolve the public URL used inside credential QR codes.
 *
 * Priority:
 * 1. PUBLIC_BASE_URL - recommended custom production domain.
 * 2. VERCEL_URL - automatically supplied by Vercel for the deployed project.
 * 3. localhost - local development only.
 */
function getPublicBaseUrl() {
  const configured = (process.env.PUBLIC_BASE_URL || "").trim();
  if (configured) return configured.replace(/\/+$/, "");

  const vercelUrl = (process.env.VERCEL_URL || "").trim();
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
  }

  const port = process.env.PORT || 5000;
  return `http://localhost:${port}`;
}

/**
 * Encode only a credential/presentation reference into the QR code.
 * The QR contains a real verification URL and never raw credential data.
 */
async function generateQRDataUrl(reference) {
  const verificationUrl =
    `${getPublicBaseUrl()}/verify?id=${encodeURIComponent(reference)}`;

  return QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 260
  });
}

module.exports = { generateQRDataUrl, getPublicBaseUrl };
