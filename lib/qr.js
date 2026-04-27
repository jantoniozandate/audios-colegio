import QRCode from "qrcode";

export const qrTheme = {
  dark: "#2c2754",
  light: "#f8f1e7"
};

export async function generateQrDataUrl(value, width = 260) {
  return QRCode.toDataURL(value, {
    errorCorrectionLevel: "H",
    margin: 1,
    width,
    color: qrTheme
  });
}
