// services/mapService.js
import axios from 'axios';

// Ajouter un robot 
export const AddMap = async (mapData) => {
  try {
    const response = await axios.post(`http://localhost:3001/api/map/upload`, mapData, {
      timeout: 5000, // Délai d'attente de 5 secondes
    });
    return response.data;
  } catch (error) {
    console.error('Error adding connected robot', error);
    throw error;
  }
};

const base64ToFile = (base64, filename) => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};

export const saveEditedMap = async (id, imageData, filename) => {
  try {
    const file = base64ToFile(imageData, filename); // Convertir base64 en fichier
    const formData = new FormData();
    formData.append('file', file); // Ajouter le fichier
    formData.append('filename', filename); // Ajouter le nom du fichier

    const response = await axios.put(`http://localhost:3001/api/map/update/file/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error saving edited map:', error);
    throw error;
  }
};
// getMap 
export const getMapId = async (id) => {
  try {
    const response = await axios.get(`http://localhost:3001/api/map/file/${id}`, {
      responseType: 'blob', // Indiquer que la réponse est un fichier binaire
      timeout: 5000,
    });
    const imageUrl = URL.createObjectURL(response.data); // Créer une URL pour l'image
    return { url: imageUrl };
  } catch (error) {
    console.error('Error fetching map image:', error);
    throw error;
  }
};
// delete un map 
export const DeleteMap = async (id) => {
  try {
    const response = await axios.delete(`http://localhost:3001/api/map/file/${id}`, {
      timeout: 5000, // Délai d'attente de 5 secondes
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting map', error);
    throw error;
  }
};
export const getMapList = async () => {
  try {
    const response = await axios.get('http://localhost:3001/api/map/files');
    return response.data;
  } catch (error) {
    console.error('Error fetching maps', error);
    throw error;
  }
};