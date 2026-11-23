import React, { useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import { validateImageFile, getImageUrl } from '../utils/imageHelper';
import { useNotification } from '../context/NotificationContext';

function ImageUploadInput({
  label = 'Upload Photograph',
  selectedFile,
  onFileChange,
  currentImageUrl,
  onRemoveCurrentImage,
  disabled = false,
}) {
  const { showToast } = useNotification();
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      showToast(validation.error, 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    onFileChange(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = () => {
    onFileChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Preview URL from new selected file
  const localPreviewUrl = selectedFile ? URL.createObjectURL(selectedFile) : null;
  const existingPreviewUrl = !selectedFile && currentImageUrl ? getImageUrl(currentImageUrl) : null;

  return (
    <div className="image-upload-wrapper">
      <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
        {label} <span style={{ color: '#64748b', fontWeight: 400 }}>(Optional &bull; Max 5 MB)</span>
      </label>

      {/* Case 1: Newly selected file with live preview */}
      {selectedFile && localPreviewUrl ? (
        <div className="image-preview-card">
          <img
            src={localPreviewUrl}
            alt="Upload Preview"
            className="image-preview-thumbnail"
          />
          <div className="image-preview-meta">
            <div className="image-preview-title">{selectedFile.name}</div>
            <div className="image-preview-hint">
              Ready to upload &bull; {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="btn-remove-image"
            disabled={disabled}
            title="Remove selected image"
          >
            <X size={15} />
            <span>Remove</span>
          </button>
        </div>
      ) : existingPreviewUrl ? (
        /* Case 2: Existing saved image (editing mode) */
        <div className="image-preview-card">
          <img
            src={existingPreviewUrl}
            alt="Current listing photo"
            className="image-preview-thumbnail"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="image-preview-meta">
            <div className="image-preview-title">Current Photograph</div>
            <div className="image-preview-hint">Click below to replace with a new photo</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <label
              className="btn-secondary"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer', margin: 0 }}
            >
              Replace
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                disabled={disabled}
                style={{ display: 'none' }}
              />
            </label>
            {onRemoveCurrentImage && (
              <button
                type="button"
                onClick={onRemoveCurrentImage}
                className="btn-remove-image"
                disabled={disabled}
                title="Remove current image"
              >
                <X size={15} />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Case 3: Empty upload dropzone */
        <div className="image-upload-zone">
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            disabled={disabled}
          />
          <div className="image-upload-zone-content">
            <div style={{ background: '#d8f3dc', padding: '0.65rem', borderRadius: '50%', color: '#16a34a' }}>
              <UploadCloud size={24} />
            </div>
            <div className="image-upload-zone-title">
              Click or drag & drop to upload a photo
            </div>
            <div className="image-upload-zone-hint">
              Supports JPG, JPEG, PNG, or WEBP (up to 5 MB)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageUploadInput;
