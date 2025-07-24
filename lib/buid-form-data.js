export function buildFormData(data) {
    const formData = new FormData();
  
    for (const key in data) {
      if (key === "photo" && Array.isArray(data[key])) {
        data[key].forEach(file => {
          formData.append("photo", file); 
        });
      } else {
        formData.append(key, data[key]);
      }
    }
  
    return formData;
  }
  