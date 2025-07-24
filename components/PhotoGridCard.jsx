import React, { useState } from "react";
import ImagePreviewModal from "./ImagePreviewModal";

export default function PhotoGridCard({ images, title = "Photo(s)" }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImg, setModalImg] = useState(null);

  // Normalize to array
 

  console.log('photoArray', images)
  if (images?.length === 0) return null;

  return (
    <>
      <div className="mb-2 bg-white shadow rounded-lg p-4">
        <div className="font-semibold mb-1">{title}</div>
        <div className="flex flex-wrap gap-2">
          {images?.map((img, idx) => (
            <img
              key={idx}
              src={img.image}
              alt={`Report photo ${idx + 1}`}
              className="w-24 h-24 object-cover rounded border cursor-pointer"
              onClick={() => {
                setModalImg(img.image);
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