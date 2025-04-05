import React, { useEffect, useState, useCallback } from 'react';

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
  IonCard,
  IonCol,
} from '@ionic/react';
import { pencil } from 'ionicons/icons';
import { getRobotIPs, addConnectedRobot } from '../services/robotService';

const RobotList: React.FC = () => {
  const [robots, setRobots] = useState([]);
  const [selectedRobot, setSelectedRobot] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');

  // Récupérer la liste des robots
  useEffect(() => {
    const fetchRobots = async () => {
      try {
        const data = await getRobotIPs();
        setRobots(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des robots:', error);
      }
    };
    fetchRobots();
  }, []);

  // Mettre à jour le nom quand un robot est sélectionné
  useEffect(() => {
    if (selectedRobot) {
      setName(selectedRobot.name || ''); // Assurez-vous que name est initialisé
    }
  }, [selectedRobot]);

  // Gérer l'ouverture du modal
  const handleEditClick = (robot: any) => {
    setSelectedRobot(robot);
    setShowModal(true);
  };

  const handleAddClick = (robot: any) => {
    setSelectedRobot(robot);
    setShowModal(true);
  };
  // Gérer la sauvegarde des modifications
  const handleSave = useCallback(async () => {
    const trimmedName = name.trim();
    if (!selectedRobot || !trimmedName) {
      console.error('Erreur: Le nom du robot est vide');
      return;
    }

    try {
      const robotData = {
        name: trimmedName,
        status: 'connected',
       
      };

      const response = await addConnectedRobot(selectedRobot._id, robotData);
      console.log('Robot ajouté avec succès:', response);

      setShowModal(false);
      setSelectedRobot(null);
      setName('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du robot:', error);
    }
  }, [selectedRobot, name]);

  return (
    <IonPage id="main-content">
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>Liste des Robots Connectes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonCol size="12" sizeMd="8" sizeLg="6">
          <IonCard>
        
            <IonList>
              {robots.map((robot: any) => (
                <IonItem key={robot._id}>
                  <IonLabel>{robot.ip}</IonLabel>
                  <IonLabel>{robot.rosVersion}</IonLabel>
                  <IonButton onClick={() => handleEditClick(robot)}>
                    <IonIcon icon={pencil} />
                  </IonButton>
                </IonItem>
              ))}
            </IonList>
          </IonCard>
        </IonCol>

        <IonModal isOpen={showModal}>
          <IonHeader>
          <IonToolbar>
  <IonTitle>Ajouter un Robot Connecté</IonTitle>
  <IonButtons slot="end">
    <IonButton onClick={() => setShowModal(false)}>Fermer</IonButton>
  </IonButtons>
</IonToolbar>

          </IonHeader>
          <IonContent>
            {selectedRobot && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (name.trim()) {
                    handleSave();
                  }
                }}
              >
                <IonItem>
                  <IonLabel position="floating">Adresse IP</IonLabel>
                  <IonInput value={selectedRobot.ip} readonly />
                </IonItem>
                <IonItem>
                  <IonLabel position="floating">ROS Version</IonLabel>
                  <IonInput value={selectedRobot.rosVersion} readonly />
                </IonItem>
                <IonItem>
                  <IonLabel position="floating">Nom du Robot</IonLabel>
                  <IonInput
                    value={name}
                    onIonChange={(e) => setName(e.detail.value!)}
                    required
                  />
                </IonItem>
                <IonButton expand="full" type="submit" disabled={!name.trim()}>
                  Ajouter
                </IonButton>
              </form>
            )}
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default RobotList;
