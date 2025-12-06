import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { http } from '@eventhub/api';
import jsQR from 'jsqr';

export default function Checkin() {
  const { auth } = useContext(AuthContext);
  const nav = useNavigate();
  const [payload, setPayload] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  const [imgPreview, setImgPreview] = useState(null);
  const [decoding, setDecoding] = useState(false);
  const canvasRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (auth && auth.loading === false && auth.user) {
      if (!(auth.user.role === 'organiser' || auth.user.role === 'admin')) {
        // redirect non-organisers away
        nav('/', {
          replace: true,
          state: { message: 'Only organisers can access Checkin' },
        });
      }
    }
  }, [auth, nav]);

  async function handleScan(e) {
    e?.preventDefault?.();
    setErr('');
    setResult(null);
    if (!payload || payload.trim().length === 0) {
      setErr('Paste a QR payload (the signed string) into the box');
      return;
    }
    setLoading(true);
    try {
      const res = await http.post('/checkins/scan', {
        payload: payload.trim(),
      });
      setResult(res.data);
    } catch (error) {
      if (error?.response?.data?.message) setErr(error.response.data.message);
      else setErr(error?.message || 'Checkin failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setErr('');
    setResult(null);
    setImgPreview(null);
    try {
      const dataUrl = await new Promise((res, rej) => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result);
        fr.onerror = rej;
        fr.readAsDataURL(file);
      });
      setImgPreview(dataUrl);
      // decode after preview loads
      await decodeImageFromDataUrl(dataUrl);
    } catch {
      setErr('Failed to read image');
    }
  }

  async function decodeImageFromDataUrl(dataUrl) {
    setDecoding(true);
    try {
      const img = await new Promise((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = dataUrl;
      });

      // draw to canvas (use offscreen canvas)
      const canvas = canvasRef.current || document.createElement('canvas');
      const maxDim = 1024;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        const ratio = Math.min(maxDim / w, maxDim / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const code = jsQR(imgData.data, w, h);
      if (code && code.data) {
        setPayload(code.data);
        setErr('');
      } else {
        setErr('No QR code found in image');
      }
    } catch {
      setErr('Failed to decode image');
    } finally {
      setDecoding(false);
    }
  }

  return (
    <div className="card">
      <div className="h1">Event Checkin</div>
      <div className="subtle">
        Scan or paste a ticket QR payload to check attendees in.
      </div>

      <form onSubmit={handleScan} style={{ marginTop: 12 }}>
        <label style={{ display: 'block', marginBottom: 6 }}>QR Payload</label>
        <textarea
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          placeholder={'Paste the QR payload here (e.g. EV:...|TK:...)'}
          rows={4}
          style={{ width: '100%', fontFamily: 'monospace' }}
        />

        <div style={{ marginTop: 10 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>
            Or upload a QR image
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {imgPreview && (
            <div style={{ marginTop: 8 }}>
              <img
                src={imgPreview}
                alt="preview"
                style={{ maxWidth: 320, maxHeight: 240, display: 'block' }}
              />
            </div>
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <button className="btn" type="submit" disabled={loading || decoding}>
            {loading ? 'Checking…' : decoding ? 'Decoding…' : 'Check In'}
          </button>
          <button
            className="btn muted"
            type="button"
            onClick={() => {
              setPayload('');
              setResult(null);
              setErr('');
            }}
          >
            Clear
          </button>
        </div>
      </form>

      {err && (
        <div style={{ marginTop: 12 }} className="card">
          <b>Error:</b> {err}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 12 }} className="card">
          <div>
            <b>Valid:</b> {String(result.valid)}
          </div>
          {result.ticketStatus && (
            <div>
              <b>Status:</b> {result.ticketStatus}
            </div>
          )}
          {result.checkedInAt && (
            <div>
              <b>Checked In At:</b>{' '}
              {new Date(result.checkedInAt).toLocaleString()}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 12 }} className="subtle">
        Tip: Open a ticket's QR image, long-press or right-click and copy the QR
        text, then paste it here. I can also integrate camera scanning if you
        want that — ask and I'll add it.
      </div>
    </div>
  );
}
