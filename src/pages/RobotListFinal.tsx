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
  IonCol,
} from '@ionic/react';
import { pencil, trash, add } from 'ionicons/icons';
import { getRobotList, EditRobot, DeleteRobot, AddRobot } from '../services/robotService';

const RobotList: React.FC = () => {
  const [robots, setRobots] = useState([]);
  const [selectedRobot, setSelectedRobot] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [ip, setIp] = useState('');
  const [rosVersion, setRosVersion] = useState('');
  const [status, setStatus] = useState('');
  const [isAdding, setIsAdding] = useState(false); // Nouvel état pour distinguer l'ajout de l'édition

  // Récupérer la liste des robots
  useEffect(() => {
    const fetchRobots = async () => {
      try {
        const data = await getRobotList();
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
      setName(selectedRobot.name || '');
      setStatus(selectedRobot.status || '');
    }
  }, [selectedRobot]);

  // Gérer l'ouverture du modal pour l'édition
  const handleEditClick = (robot: any) => {
    setSelectedRobot(robot);
    setIsAdding(false); // Ce n'est pas une action d'ajout
    setShowModal(true);
  };

  // Gérer l'ouverture du modal pour l'ajout
  const handleAddClick = () => {
    setSelectedRobot(null); // Pas de robot sélectionné pour l'ajout
    setIsAdding(true); // C'est une action d'ajout
    setName(''); // Réinitialiser les champs
    setStatus('');
    setShowModal(true);
  };

  const handleDeleteClick = async (robot: any) => {
    try {
      await DeleteRobot(robot._id);
      setRobots(robots.filter((r) => r._id !== robot._id));
      console.log('Robot deleted successfully');
    } catch (error) {
      console.error('Error deleting robot:', error);
    }
  };

  // Gérer la sauvegarde des modifications ou l'ajout
  const handleSave = useCallback(async () => {
    const trimmedName = name.trim();
    const trimmedStatus = status.trim();
    const trimmedIp = ip.trim();
    const trimmedRosVersion = rosVersion.trim();
    if (!trimmedName || !trimmedStatus) {


      console.error('Erreur: champ du robot est vide');
      return;
    }

    try {
      const robotData = {
        name: trimmedName,
        status: trimmedStatus,
          ...(isAdding && { ip: trimmedIp,rosVersion:trimmedRosVersion }), // Inclure l'IP uniquement lors de l'ajout
      };

      if (isAdding) {
        console.log('Données envoyées:', robotData);
        const response = await AddRobot(robotData);
        console.log('Données envoyées:', robotData);
        console.log('Robot ajouté avec succès:', response);
        setRobots([...robots, response]); // Ajouter le nouveau robot à la liste
      } else {
        const response = await EditRobot(selectedRobot._id, robotData);
        console.log('Robot modifié avec succès:', response);
        setRobots(robots.map((r) => (r._id === selectedRobot._id ? response : r))); // Mettre à jour le robot dans la liste
      }

      setShowModal(false);
      setSelectedRobot(null);
      setName('');
      setStatus('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout/modification du robot:', error);
    }
  }, [selectedRobot, name, status, isAdding, robots]);

  return (
    <IonPage id="main-content">
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>Liste des Robots</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonCol size="12" sizeMd="8" sizeLg="6">
          <IonButton onClick={handleAddClick}>
            <IonIcon icon={add} />
          </IonButton>
          <IonList>
            {robots.map((robot: any) => (
              <IonItem key={robot._id}>
                <IonLabel>{robot.ip}</IonLabel>
                <IonLabel>{robot.rosVersion}</IonLabel>
                <IonLabel>{robot.name}</IonLabel>
                <IonLabel>{robot.status}</IonLabel>
                <IonButton onClick={() => handleEditClick(robot)}>
                  <IonIcon icon={pencil} />
                </IonButton>
                <IonButton onClick={() => handleDeleteClick(robot)}>
                  <IonIcon icon={trash} />
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        </IonCol>

        <IonModal isOpen={showModal}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{isAdding ? 'Ajouter un Robot' : 'Modifier un Robot'}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>Fermer</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              {!isAdding && (
                <IonItem>
                  <IonLabel position="floating">Adresse IP</IonLabel>
                  <IonInput value={selectedRobot?.ip || ''} readonly />
                </IonItem>
              )}
               {isAdding && (
                <IonItem>
                  <IonLabel position="floating">Adresse IP</IonLabel>
                  <IonInput value={ip}  onIonChange={(e) => setIp(e.detail.value!)}
                  required />
                </IonItem>
              )}
               {!isAdding && (
                <IonItem>
                  <IonLabel position="floating">Ros Version</IonLabel>
                  <IonInput value={selectedRobot?.rosVersion || ''} readonly />
                </IonItem>
              )}
               {isAdding && (
                <IonItem>
                  <IonLabel position="floating">Ros Version</IonLabel>
                  <IonInput value={rosVersion}  onIonChange={(e) => setRosVersion(e.detail.value!)}
                  required />
                </IonItem>
              )}
              <IonItem>
                <IonLabel position="floating">Nom du Robot</IonLabel>
                <IonInput
                  value={name}
                  onIonChange={(e) => setName(e.detail.value!)}
                  required
                />
              </IonItem>
              <IonItem>
                <IonLabel position="floating">Status du Robot</IonLabel>
                <IonInput
                  value={status}
                  onIonChange={(e) => setStatus(e.detail.value!)}
                  required
                />
              </IonItem>
              <IonButton expand="full" type="submit" disabled={!name.trim() || !status.trim()}>
                {isAdding ? 'Ajouter' : 'Modifier'}
              </IonButton>
            </form>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default RobotList;