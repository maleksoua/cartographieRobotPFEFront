import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonMenuButton,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonModal,
  IonInput,
  IonButtons,
  IonIcon,
  IonCol,
} from '@ionic/react';
import { pencil, trash, add, eye } from 'ionicons/icons';
import { getMapList, DeleteMap, getMapId, saveEditedMap } from '../services/mapService';
import ImageEditorModal from './ImageEditorModal';

const MapList: React.FC = () => {
  const [maps, setMaps] = useState([]);
  const [selectedMap, setSelectedMap] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filename, setFilename] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [uploadDate, setUploadDate] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [currentMapId, setCurrentMapId] = useState<string | null>(null);

  // Récupérer la liste des maps
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const data = await getMapList();
        setMaps(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des maps:', error);
      }
    };
    fetchMaps();
  }, []);

  // Mettre à jour le nom quand une map est sélectionnée
  useEffect(() => {
    if (selectedMap) {
      setFilename(selectedMap.filename || '');
      setUploadDate(selectedMap.uploadDate || '');
    }
  }, [selectedMap]);

  // Gérer le clic sur le bouton "pencil"
  const handleEditClick = async (map) => {
    setSelectedMap(map);
    setCurrentMapId(map._id);
    try {
      const response = await getMapId(map._id);
      setImageUrl(response.url);
      setShowEditModal(true);
    } catch (error) {
      console.error('Error fetching map image:', error);
    }
  };

  // Sauvegarder l'image modifiée
  const handleSaveEditedImage = async (imageData, filename) => {
    if (!currentMapId) {
      console.error('No map selected for editing.');
      return;
    }

    try {
      const response = await saveEditedMap(currentMapId, imageData, filename);
      console.log('Map saved successfully:', response);

      // Rafraîchir la liste des maps
      const updatedMaps = await getMapList();
      setMaps(updatedMaps);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la map:', error);
    }
  };

  // Gérer l'ouverture du modal pour l'ajout
  const handleAddClick = () => {
    setSelectedMap(null);
    setIsAdding(true);
    setFilename('');
    setUploadDate('');
    setShowModal(true);
  };

  const handleDeleteClick = async (map: any) => {
    try {
      await DeleteMap(map._id);
      setMaps(maps.filter((r) => r._id !== map._id));
      console.log('map deleted successfully');
    } catch (error) {
      console.error('Error deleting map:', error);
    }
  };

  // Gérer le clic sur le bouton "eye"
  const handleGetClick = async (map) => {
    try {
      const response = await getMapId(map._id);
      setImageUrl(response.url);
      setShowImageModal(true);
    } catch (error) {
      console.error('Error fetching map image:', error);
    }
  };

  return (
    <IonPage id="main-content">
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>Liste des Maps</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonCol size="12" sizeMd="8" sizeLg="6">
          <IonButton onClick={handleAddClick}>
            <IonIcon icon={add} />
          </IonButton>
          <IonList>
            {maps.map((map: any) => (
              <IonItem key={map._id}>
                <IonLabel>{map.filename}</IonLabel>
                <IonLabel>{map.uploadDate}</IonLabel>
                <IonButton onClick={() => handleEditClick(map)}>
                  <IonIcon icon={pencil} />
                </IonButton>
                <IonButton onClick={() => handleDeleteClick(map)}>
                  <IonIcon icon={trash} />
                </IonButton>
                <IonButton onClick={() => handleGetClick(map)}>
                  <IonIcon icon={eye} />
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        </IonCol>
      </IonContent>

      {/* Popup pour afficher l'image */}
      <IonModal isOpen={showImageModal} onDidDismiss={() => setShowImageModal(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Map Image</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowImageModal(false)}>Close</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {imageUrl && <img src={imageUrl} alt="Map" style={{ width: '100%', height: 'auto' }} />}
        </IonContent>
      </IonModal>

      {/* Popup pour éditer l'image */}
      {showEditModal && (
        <ImageEditorModal
          imageUrl={imageUrl}
          initialFilename={selectedMap?.filename || ''}
          onSave={({ imageData, filename }) => {
            handleSaveEditedImage(imageData, filename);
          }}
          onClose={() => {
            setShowEditModal(false);
            setImageUrl('');
            setSelectedMap(null);
            setCurrentMapId(null);
          }}
        />
      )}
    </IonPage>
  );
};

export default MapList;