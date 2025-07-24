export function buildFormData(data) {
    const formData = new FormData();
  
    for (const key in data) {
      if (key === "uploaded_images") {
        if (Array.isArray(data[key]) && data[key].length > 0) {
          data[key].forEach(file => {
            formData.append("uploaded_images", file); 
          });
        } else {
          // Always append an empty field if no images
          formData.append("uploaded_images", "");
        }
      } else {
        formData.append(key, data[key]);
      }
    }
  
    return formData;
  }
  