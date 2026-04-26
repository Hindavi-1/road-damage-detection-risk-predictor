/**
 * UploadBox — drag-and-drop / click-to-upload image input.
 * Purely presentational; calls `onFileSelected` callback with the chosen File.
 */

import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, ImageIcon, X } from "lucide-react";

interface UploadBoxProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  preview?: string | null;
  onClear?: () => void;
}

export default function UploadBox({ onFileSelected, disabled, preview, onClear }: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {preview ? (
          /* ── Preview state ─────────────────────────────────────── */
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="relative rounded-2xl overflow-hidden border border-blue-500/30 glow-blue"
          >
            <img
              src={preview}
              alt="Uploaded road image"
              className="w-full h-72 object-cover"
            />
            {/* Clear button */}
            {onClear && (
              <button
                onClick={onClear}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-slate-300 hover:text-white hover:bg-red-500/70 transition"
                aria-label="Remove image"
              >
                <X size={16} />
              </button>
            )}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <ImageIcon size={13} />
                <span>Image loaded — ready for analysis</span>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ── Drop zone ──────────────────────────────────────────── */
          <motion.button
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            type="button"
            onClick={() => !disabled && inputRef.current?.click()}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            disabled={disabled}
            className={`w-full h-72 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer
              ${dragging
                ? "border-cyan-400 bg-cyan-400/5 scale-[1.01]"
                : "border-slate-700 bg-white/[0.02] hover:border-blue-500/60 hover:bg-blue-500/5"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <motion.div
              animate={dragging ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"
            >
              <UploadCloud size={30} className={dragging ? "text-cyan-400" : "text-blue-400"} />
            </motion.div>

            <div className="text-center px-4">
              <p className="text-sm font-semibold text-slate-300">
                {dragging ? "Drop to upload" : "Drag & drop your road image"}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                or <span className="text-blue-400 underline underline-offset-2">click to browse</span>
                &nbsp;· JPG, PNG, WEBP up to 20 MB
              </p>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onInputChange}
        aria-label="Upload road image"
      />
    </div>
  );
}
