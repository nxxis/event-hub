const crypto = require('crypto');
const SECRET = process.env.QR_SECRET || 'qr_secret';

function sign(data) {
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('hex');
  return `${data}|SIG:${sig}`;
}

function verify(payload) {
  const idx = payload.lastIndexOf('|SIG:');
  if (idx === -1) return null;
  const data = payload.slice(0, idx);
  const provided = payload.slice(idx + 5);
  const expected = crypto
    .createHmac('sha256', SECRET)
    .update(data)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
    ? data
    : null;
}

module.exports = { sign, verify };
