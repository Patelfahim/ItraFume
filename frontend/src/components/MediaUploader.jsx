import { useRef, useState } from 'react';
import { FiUploadCloud, FiX, FiVideo, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';

const MAX_IMAGE_MB = 8;
const MAX_VIDEO_MB = 50;
const ACCEPTED = 'image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime';

/**
 * MediaUploader
 * props:
 *  - files: File[] (controlled list of newly selected files)
 *  - onChange: (files: File[]) => void
 *  - maxFiles: number
 */
const MediaUploader = ({ files, onChange, maxFiles = 5, label = 'Add photos or videos' }) => {
  const inputRef = useRef(null);
  const [previews, setPreviews] = useState([]);

  const rebuildPreviews = (fileList) => {
    const next = fileList.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' : 'image',
      name: file.name,
    }));
    setPreviews(next);
  };

  const handleFiles = (selected) => {
    const incoming = Array.from(selected);
    const valid = [];

    for (const file of incoming) {
      const isVideo = file.type.startsWith('video');
      const isImage = file.type.startsWith('image');
      if (!isVideo && !isImage) {
        toast.error(`${file.name}: unsupported file type`);
        continue;
      }
      const capMB = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB;
      if (file.size > capMB * 1024 * 1024) {
        toast.error(`${file.name} exceeds ${capMB}MB limit for ${isVideo ? 'videos' : 'images'}`);
        continue;
      }
      valid.push(file);
    }

    const combined = [...files, ...valid].slice(0, maxFiles);
    if (files.length + valid.length > maxFiles) {
      toast.error(`You can upload up to ${maxFiles} files`);
    }
    onChange(combined);
    rebuildPreviews(combined);
  };

  const removeAt = (index) => {
    const updated = files.filter((_, i) => i !== index);
    onChange(updated);
    rebuildPreviews(updated);
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="border-2 border-dashed border-outline-variant rounded-md p-6 text-center cursor-pointer hover:border-primary transition-colors bg-surface-container-low"
      >
        <FiUploadCloud className="mx-auto text-2xl text-on-surface-variant mb-2" />
        <p className="text-sm text-on-surface-variant">
          {label} <span className="text-primary font-semibold">browse</span>
        </p>
        <p className="text-xs text-on-surface-variant mt-1">
          JPEG/PNG/WebP up to {MAX_IMAGE_MB}MB · MP4/WebM up to {MAX_VIDEO_MB}MB · max {maxFiles} files
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
          {previews.map((p, idx) => (
            <div key={idx} className="relative aspect-square rounded-sm overflow-hidden bg-surface-container-high group">
              {p.type === 'video' ? (
                <video src={p.url} className="w-full h-full object-cover" muted />
              ) : (
                <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
              )}
              <div className="absolute top-1 left-1 bg-black/60 text-white rounded-full p-1">
                {p.type === 'video' ? <FiVideo size={10} /> : <FiImage size={10} />}
              </div>
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove file"
              >
                <FiX size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
