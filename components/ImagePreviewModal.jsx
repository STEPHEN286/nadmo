import React from "react";

export default function ImagePreviewModal({ open, onClose, img }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-lg p-4 max-w-lg w-full flex flex-col items-center relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-red-600 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close preview"
        >
          &times;
        </button>
        <img
          src={img}
          alt="Preview"
          className="max-h-[70vh] w-auto object-contain rounded"
        />
      </div>
    </div>
  );
} 