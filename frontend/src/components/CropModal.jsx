import React, { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';

export default function CropModal({ src, onCancel, onComplete }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleDone = async () => {
    try {
      const blob = await getCroppedImg(src, croppedAreaPixels);
      const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });
      onComplete(file);
    } catch (e) {
      console.error('Crop failed', e);
      onCancel();
    }
  };

  return (
    <div className="crop-modal-overlay">
      <div className="crop-modal">
        <div style={{ position: 'relative', width: '100%', height: 400, background: '#333' }}>
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="auth-primary-button" onClick={handleDone}>Use Image</button>
        </div>
      </div>
    </div>
  );
}
