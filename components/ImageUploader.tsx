
import React, { useCallback, useState } from 'react';
import { Upload, X, Plus, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  subLabel?: string;
  image?: string | null;
  onImageChange?: (base64: string | null) => void;
  images?: string[];
  onImagesChange?: (base64s: string[]) => void;
  onImageRemove?: (index: number) => void;
  onImageClick?: (index: number) => void;
  getOverlay?: (index: number) => React.ReactNode;
  multiple?: boolean;
  maxImages?: number;
  className?: string;
  compact?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  label, 
  subLabel, 
  image, 
  onImageChange,
  images = [],
  onImagesChange,
  onImageRemove,
  onImageClick,
  getOverlay,
  multiple = false,
  maxImages = 1,
  className = "",
  compact = false
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) await processFiles(Array.from(files));
  };

  const processFiles = async (files: File[]) => {
    const base64Promises = files.map(readFile);
    const newBase64s = await Promise.all(base64Promises);

    if (multiple && onImagesChange) {
      const currentImages = images || [];
      const remainingSlots = maxImages - currentImages.length;
      const imagesToAdd = newBase64s.slice(0, remainingSlots);
      onImagesChange([...currentImages, ...imagesToAdd]);
    } else if (!multiple && onImageChange) {
      onImageChange(newBase64s[0]);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) await processFiles(files);
  }, [images, multiple, maxImages]);

  const removeImage = (index: number) => {
    if (multiple && onImagesChange) {
      if (onImageRemove) {
        onImageRemove(index);
      }
      const newImages = [...images];
      newImages.splice(index, 1);
      onImagesChange(newImages);
    } else if (!multiple && onImageChange) {
      onImageChange(null);
    }
  };

  const hasImages = multiple ? images.length > 0 : !!image;
  const canAddMore = multiple ? images.length < maxImages : !image;
  const showBigDropZone = !hasImages;
  const showSmallAddButton = hasImages && canAddMore && multiple;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-baseline justify-between">
        <span className="font-comic text-xl text-black uppercase bg-white border-2 border-black px-2 shadow-[2px_2px_0_#000] transform -rotate-1 inline-block">
          {label}
        </span>
        {subLabel && <span className="text-xs font-bold text-gray-500 font-mono bg-gray-100 px-1">{subLabel}</span>}
      </div>

      {/* Multi Mode Grid */}
      {multiple && hasImages && (
        <div className="grid grid-cols-3 gap-3 mb-2">
          {images.map((img, idx) => (
            <div 
              key={idx} 
              className="relative aspect-square bg-white border-2 border-black shadow-comic group overflow-hidden cursor-pointer"
              onClick={() => onImageClick && onImageClick(idx)}
            >
              <img src={img} alt={`Upload ${idx}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
              
              <button
                onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                className="absolute -top-1 -right-1 p-1 bg-red-500 text-white border-2 border-black hover:scale-110 transition-transform z-10"
              >
                <X className="w-3 h-3" />
              </button>
              
              <div className="absolute bottom-0 right-0 bg-black text-white px-1 border-t-2 border-l-2 border-black text-[10px] font-bold font-mono">
                {idx + 1}
              </div>

              {/* Custom Overlay (e.g., badges) */}
              {getOverlay && getOverlay(idx)}
              
              {/* Click Hint */}
              {onImageClick && (
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100 pointer-events-none">
                   <span className="bg-white text-black text-[10px] font-bold px-1 border border-black">EDIT</span>
                </div>
              )}
            </div>
          ))}
          
          {showSmallAddButton && (
             <div className="relative aspect-square border-2 border-dashed border-black bg-gray-50 hover:bg-yellow-50 transition-colors flex items-center justify-center cursor-pointer group shadow-[inset_0_0_10px_rgba(0,0,0,0.1)]">
               <input
                  type="file"
                  accept="image/*"
                  multiple={multiple}
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
               <Plus className="w-8 h-8 text-black group-hover:scale-110 transition-transform" />
             </div>
          )}
        </div>
      )}

      {/* Single Image Mode */}
      {!multiple && hasImages && (
        <div className={`relative w-full bg-white border-2 border-black shadow-comic group overflow-hidden ${compact ? 'h-24' : 'h-40'}`}>
          <div className="absolute inset-0 bg-dots opacity-20"></div>
          <img src={image || ''} alt="Preview" className="w-full h-full object-contain relative z-10" />
          <button
            onClick={() => removeImage(0)}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white border-2 border-black hover:scale-110 transition-transform z-20"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-2 bg-yellow-300 text-black px-2 border-2 border-black text-xs font-bold font-comic transform -rotate-2 z-20">
            REF IMG
          </div>
        </div>
      )}
      
      {/* Main Drop Zone - Comic Panel Style */}
      {showBigDropZone && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          className={`
            relative overflow-hidden
            flex flex-col items-center justify-center w-full 
            ${compact ? 'h-24' : 'h-32'}
            border-4 border-dashed transition-all duration-200
            cursor-pointer bg-white
            ${isDragging 
              ? 'border-black bg-yellow-100 scale-[0.99]' 
              : 'border-gray-300 hover:border-black hover:bg-gray-50'
            }
          `}
        >
          <input
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          
          <div className={`flex flex-col items-center text-center p-2 transition-transform ${isDragging ? 'scale-110' : ''}`}>
            <Upload className={`w-8 h-8 mb-2 text-black`} />
            {!compact && (
              <p className="text-sm font-comic text-black tracking-wide uppercase bg-white px-2">
                {multiple ? 'Drop Files Here!' : 'Insert Source!'}
              </p>
            )}
          </div>
          
          {/* Screentone Overlay */}
          <div className="absolute inset-0 bg-dots opacity-5 pointer-events-none"></div>
        </div>
      )}
    </div>
  );
};
