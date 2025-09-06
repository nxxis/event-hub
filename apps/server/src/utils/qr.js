const QRCode = require('qrcode');
async function toDataURL(text) {
  return QRCode.toDataURL(text); // base64 PNG
}
module.exports = { toDataURL };
