const QRCode = require("qrcode");

const PRODUCTION_BASE_URL = "https://academic-credential-verification.vercel.app";

/**
 * Resolve the public URL used inside credential QR codes.
 *
 * Production priority:
 * 1. PUBLIC_BASE_URL
 * 2. Known production Vercel domain
 * 3. VERCEL_URL
 *
 * Local development falls back to localhost.
 */
function getPublicBaseUrl() {
  const configured = (process.env.PUBLIC_BASE_URL || "").trim();
  if (configured) return configured.replace(/\/+$/, "");

  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    return PRODUCTION_BASE_URL;
  }

  const vercelUrl = (process.env.VERCEL_URL || "").trim();
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/^https?:\\/\\//, "").replace(/\/+$/, "")}`;
  }

  const port = process.env.PORT || 5000;
  return `http://localhost:${port}`;
}

/**
 * Encode only a credential/presentation reference into the QR code.
 * The QR contains a public verification URL and never raw credential data.
 */
async function generateQRDataUrl(reference) {
  if (!reference) {
    throw new Error("A credential or presentation reference is required to generate a QR code.");
  }

  const verificationUrl =
    `${getPublicBaseUrl()}/verify?id=${encodeURIComponent(reference)}`;

  return QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 320
  });
}

module.exports = { generateQRDataUrl, getPublicBaseUrl };
