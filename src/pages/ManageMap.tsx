import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonMenuButton,
  IonList,
  IonLabel,
  IonButton,
  IonModal,
  IonInput,
  IonButtons,
  IonIcon,
  IonCol,
  IonItem,
} from '@ionic/react';
import { pencil, trash, add, eye } from 'ionicons/icons';
import { getMapList, DeleteMap, getMapId, saveEditedMap, AddMap } from '../services/mapService';
import ImageEditorModal from './ImageEditorModal';
import './ManageMap.css';

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
  const [newImage, setNewImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const data = await getMapList();
        setMaps(data);
        console.log('List of Maps with IDs:');
        data.forEach((map: any) => {
          console.log(`ID: ${map._id}, Filename: ${map.filename}`);
        });
        setError(null);
      } catch (error) {
        console.error('Erreur lors de la récupération des maps:', error);
        setError('Failed to load maps. Please try again later.');
      }
    };
    fetchMaps();
  }, []);

  useEffect(() => {
    if (selectedMap) {
      setFilename(selectedMap.filename || '');
      setUploadDate(selectedMap.uploadDate || '');
    }
  }, [selectedMap]);

  const handleEditClick = async (map: any) => {
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

  const handleSaveEditedImage = async (imageData: string, filename: string) => {
    if (!currentMapId) {
      console.error('No map selected for editing.');
      return;
    }

    try {
      const response = await saveEditedMap(currentMapId, imageData, filename);
      console.log('Map saved successfully:', response);
      const updatedMaps = await getMapList();
      setMaps(updatedMaps);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la map:', error);
    }
  };

  const handleAddClick = () => {
    setSelectedMap(null);
    setIsAdding(true);
    setFilename('');
    setUploadDate('');
    setShowModal(true);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setNewImage(event.target.files[0]);
    }
  };

  const handleAddMap = async () => {
    if (!filename || !newImage) {
      console.error('Veuillez remplir tous les champs.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', filename);
      formData.append('image', newImage);

      const response = await AddMap(formData);
      console.log('Carte ajoutée avec succès:', response);
      const updatedMaps = await getMapList();
      setMaps(updatedMaps);

      setFilename('');
      setNewImage(null);
      setShowModal(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la carte:', error);
    }
  };

  const handleDeleteClick = async (map: any) => {
    try {
      await DeleteMap(map._id);
      setMaps(maps.filter((r: any) => r._id !== map._id));
      console.log('Map deleted successfully');
    } catch (error) {
      console.error('Error deleting map:', error);
    }
  };

  const handleGetClick = async (map: any) => {
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
        <IonToolbar className="header-toolbar">
          <IonMenuButton slot="start" />
          <IonTitle>Liste des Maps</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="map-list-container">
        <IonCol size="12" sizeMd="8" sizeLg="6">
          <IonButton className="add-button" onClick={handleAddClick}>
            <IonIcon slot="start" icon={add} />
            Ajouter Map
          </IonButton>
          <div className="map-table">
            <div className="table-header">
              <IonLabel>Nom</IonLabel>
              <IonLabel>Date de Téléversement</IonLabel>
              <IonLabel>Actions</IonLabel>
            </div>
            <IonList>
              {maps.map((map: any) => (
                <div className="map-item" key={map._id}>
                  <IonLabel>{map.filename}</IonLabel>
                  <IonLabel>{new Date(map.uploadDate).toLocaleDateString()}</IonLabel>
                  <div className="actions-container">
                    <IonButton className="action-button" onClick={() => handleEditClick(map)}>
                      <IonIcon icon={pencil} />
                    </IonButton>
                    <IonButton className="action-button" onClick={() => handleDeleteClick(map)}>
                      <IonIcon icon={trash} />
                    </IonButton>
                    <IonButton className="action-button" onClick={() => handleGetClick(map)}>
                      <IonIcon icon={eye} />
                    </IonButton>
                  </div>
                </div>
              ))}
            </IonList>
          </div>
        </IonCol>

        {/* Popup pour ajouter une nouvelle map */}
        <IonModal isOpen={showModal} cssClass="modal-content" onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Ajouter une Map</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>Fermer</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonItem>
              <IonLabel position="floating">Nom de la Map</IonLabel>
              <IonInput
                className="modal-input"
                value={filename}
                onIonChange={(e) => setFilename(e.detail.value!)}
                required
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Image de la Map</IonLabel>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
                className="file-input"
              />
            </IonItem>
            <IonButton className="save-button" expand="full" onClick={handleAddMap}>
              Ajouter
            </IonButton>
          </IonContent>
        </IonModal>

        {/* Popup pour afficher l'image */}
        <IonModal isOpen={showImageModal} cssClass="modal-content" onDidDismiss={() => setShowImageModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Map Image</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowImageModal(false)}>Fermer</IonButton>
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
      </IonContent>
    </IonPage>
  );
};

export default MapList;