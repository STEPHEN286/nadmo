import React, { useState } from "react";
import ImagePreviewModal from "./ImagePreviewModal";

export default function PhotoGridCard({ photos, title = "Photo(s)" }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImg, setModalImg] = useState(null);

  // Normalize to array
  const photoArray = Array.isArray(photos)
    ? photos
    : photos
    ? [photos]
    : [];

  if (photoArray.length === 0) return null;

  return (
    <>
      <div className="mb-2 bg-white shadow rounded-lg p-4">
        <div className="font-semibold mb-1">{title}</div>
        <div className="flex flex-wrap gap-2">
          {photoArray.map((img, idx) => (
            <img
              key={idx}
              src={typeof img === "string" ? img : URL.createObjectURL(img)}
              alt={`Report photo ${idx + 1}`}
              className="w-24 h-24 object-cover rounded border cursor-pointer"
              onClick={() => {
                setModalImg(typeof img === "string" ? img : URL.createObjectURL(img));
                setModalOpen(true);
              }}
            />
          ))}
        </div>
        <ImagePreviewModal open={modalOpen} onClose={() => setModalOpen(false)} img={modalImg} />
      </div>
    </>
  );
} 