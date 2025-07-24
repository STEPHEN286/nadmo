export function buildFormData(data) {
    const formData = new FormData();
  
    for (const key in data) {
      if (key === "uploaded_images" && Array.isArray(data[key])) {
        data[key].forEach(file => {
          formData.append("uploaded_images", file); 
        });
      } else {
        formData.append(key, data[key]);
      }
    }
  
    return formData;
  }
  