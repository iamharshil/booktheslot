"use client";

import { ImagePlus, LoaderCircle, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function ImagePicker({
  files = [],
  onFilesChange,
  accept = "image/jpeg,image/png,image/webp,image/gif",
  maxFiles = 1,
  maxSizeMB = 5,
  existingCount = 0,
  disabled = false,
  uploading = false,
  onError,
  hint,
}) {
  const inputId = useId();
  const [dragging, setDragging] = useState(false);
  const [previews, setPreviews] = useState([]);
  const multiple = maxFiles > 1;
  const totalCount = existingCount + files.length;
  const atLimit = totalCount >= maxFiles;

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  function addFiles(fileList) {
    if (disabled || uploading) return;
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;

    const room = Math.max(0, maxFiles - existingCount - (multiple ? files.length : 0));
    const invalidFiles = incoming.filter((file) => !allowedTypes.includes(file.type) || file.size > maxSizeMB * 1024 * 1024);
    const valid = incoming.filter((file) => {
      if (!allowedTypes.includes(file.type)) {
        onError?.(`${file.name} is not a supported image. Choose JPG, PNG, WebP, or GIF.`);
        return false;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        onError?.(`${file.name} is larger than ${maxSizeMB} MB.`);
        return false;
      }
      return true;
    });
    if (incoming.length > room) {
      onError?.(room > 0 ? `You can add ${room} more photo${room === 1 ? "" : "s"}.` : `You’ve reached the ${maxFiles}-photo limit.`);
      return;
    }
    const accepted = valid.slice(0, room);
    if (accepted.length) {
      if (!invalidFiles.length) onError?.("");
      onFilesChange(multiple ? [...files, ...accepted] : [accepted[0]]);
    }
  }

  function removeFile(index) {
    onFilesChange(files.filter((_, fileIndex) => fileIndex !== index));
  }

  return (
    <div
      className={`image-picker${dragging ? " image-picker-dragging" : ""}${disabled ? " image-picker-disabled" : ""}`}
      onDragEnter={(event) => { event.preventDefault(); if (!disabled && !uploading) setDragging(true); }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false); }}
      onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files); }}
    >
      <input
        id={inputId}
        className="image-picker-input"
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled || uploading || atLimit}
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <label htmlFor={inputId} className="image-picker-target">
        <span className="image-picker-icon" aria-hidden="true">
          {uploading ? <LoaderCircle className="image-picker-spinner" size={21} /> : <ImagePlus size={21} />}
        </span>
        <span className="image-picker-copy">
          <span className="image-picker-title">
            {uploading ? "Uploading photos…" : atLimit ? "Photo limit reached" : files.length ? "Add or replace photos" : "Choose photos"}
          </span>
          <span className="image-picker-hint">
            {hint || `${multiple ? `${totalCount} of ${maxFiles} selected · ` : ""}Click to browse or drag and drop · JPG, PNG, WebP, GIF · Up to ${maxSizeMB} MB each`}
          </span>
        </span>
        {!uploading && !atLimit && <span className="image-picker-browse">Browse</span>}
      </label>

      {files.length > 0 && (
        <div className="image-picker-files">
          {files.map((file, index) => (
            <div className="image-picker-file" key={`${file.name}-${file.size}-${index}`}>
              {previews[index] && <img src={previews[index]} alt={`Preview of ${file.name}`} />}
              <span className="image-picker-filename" title={file.name}>{file.name}</span>
              {!uploading && (
                <button type="button" onClick={() => removeFile(index)} aria-label={`Remove ${file.name}`}>
                  <X size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
