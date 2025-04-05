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
import { pencil, trash, add, checkmarkCircle, closeCircle } from 'ionicons/icons';
import { getRobotList, EditRobot, DeleteRobot, AddRobot } from '../services/robotService';
import './RobotListFinal.css';

const RobotList: React.FC = () => {
  const [robots, setRobots] = useState([]);
  const [selectedRobot, setSelectedRobot] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [ip, setIp] = useState('');
  const [rosVersion, setRosVersion] = useState('');
  const [status, setStatus] = useState('');
  const [isAdding, setIsAdding] = useState(false);

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

  useEffect(() => {
    if (selectedRobot) {
      setName(selectedRobot.name || '');
      setStatus(selectedRobot.status || '');
      setIp(selectedRobot.ip || '');
      setRosVersion(selectedRobot.rosVersion || '');
    }
  }, [selectedRobot]);

  const handleEditClick = (robot: any) => {
    setSelectedRobot(robot);
    setIsAdding(false);
    setShowModal(true);
  };

  const handleAddClick = () => {
    setSelectedRobot(null);
    setIsAdding(true);
    setName('');
    setStatus('');
    setIp('');
    setRosVersion('');
    setShowModal(true);
  };

  const handleDeleteClick = async (robot: any) => {
    try {
      await DeleteRobot(robot._id);
      setRobots(robots.filter((r: any) => r._id !== robot._id));
    } catch (error) {
      console.error('Error deleting robot:', error);
    }
  };

  const handleSave = useCallback(async () => {
    const trimmedName = name.trim();
    const trimmedStatus = status.trim();
    const trimmedIp = ip.trim();
    const trimmedRosVersion = rosVersion.trim();

    if (!trimmedName || (!isAdding && !trimmedStatus) || (isAdding && (!trimmedIp || !trimmedRosVersion))) {
      console.error('Erreur: champ requis vide');
      return;
    }

    try {
      const robotData = {
        name: trimmedName,
        status: trimmedStatus,
        ...(isAdding && { ip: trimmedIp, rosVersion: trimmedRosVersion }),
      };

      if (isAdding) {
        const response = await AddRobot(robotData);
        setRobots([...robots, response]);
      } else {
        const response = await EditRobot(selectedRobot._id, robotData);
        setRobots(robots.map((r: any) => (r._id === selectedRobot._id ? response : r)));
      }

      setShowModal(false);
      setSelectedRobot(null);
      setName('');
      setStatus('');
      setIp('');
      setRosVersion('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout/modification du robot:', error);
    }
  }, [selectedRobot, name, status, ip, rosVersion, isAdding, robots]);

  return (
    <IonPage id="main-content">
      <IonHeader>
        <IonToolbar className="header-toolbar">
          <IonMenuButton slot="start" />
          <IonTitle>Liste des Robots</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="robot-list-container">
        <IonCol size="12" sizeMd="8" sizeLg="6">
          <IonButton className="add-button" onClick={handleAddClick}>
            <IonIcon slot="start" icon={add} />
            Ajouter Robot
          </IonButton>
          <div className="robot-table">
            <div className="table-header">
              <IonLabel>Adresse IP</IonLabel>
              <IonLabel>ROS Version</IonLabel>
              <IonLabel>Nom</IonLabel>
              <IonLabel>Statut</IonLabel>
              <IonLabel>Actions</IonLabel>
            </div>
            <IonList>
              {robots.map((robot: any) => (
                <div className="robot-item" key={robot._id}>
                  <IonLabel>{robot.ip}</IonLabel>
                  <IonLabel>{robot.rosVersion}</IonLabel>
                  <IonLabel>{robot.name}</IonLabel>
                  <IonLabel>
                    {robot.status === 'connected' ? (
                      <IonIcon icon={checkmarkCircle} color="success" />
                    ) : (
                      <IonIcon icon={closeCircle} color="danger" />
                    )}
                  </IonLabel>
                  <div className="actions-container">
                    <IonButton className="action-button" onClick={() => handleEditClick(robot)}>
                      <IonIcon icon={pencil} />
                    </IonButton>
                    <IonButton className="action-button" onClick={() => handleDeleteClick(robot)}>
                      <IonIcon icon={trash} />
                    </IonButton>
                  </div>
                </div>
              ))}
            </IonList>
          </div>
        </IonCol>

        <IonModal isOpen={showModal} cssClass="modal-content">
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
              {isAdding ? (
                <IonItem>
                  <IonLabel position="floating">Adresse IP</IonLabel>
                  <IonInput
                    className="modal-input"
                    value={ip}
                    onIonChange={(e) => setIp(e.detail.value!)}
                    required
                  />
                </IonItem>
              ) : (
                <IonItem>
                  <IonLabel position="floating">Adresse IP</IonLabel>
                  <IonInput className="modal-input" value={selectedRobot?.ip || ''} readonly />
                </IonItem>
              )}
              {isAdding ? (
                <IonItem>
                  <IonLabel position="floating">Version ROS</IonLabel>
                  <IonInput
                    className="modal-input"
                    value={rosVersion}
                    onIonChange={(e) => setRosVersion(e.detail.value!)}
                    required
                  />
                </IonItem>
              ) : (
                <IonItem>
                  <IonLabel position="floating">Version ROS</IonLabel>
                  <IonInput className="modal-input" value={selectedRobot?.rosVersion || ''} readonly />
                </IonItem>
              )}
              <IonItem>
                <IonLabel position="floating">Nom du Robot</IonLabel>
                <IonInput
                  className="modal-input"
                  value={name}
                  onIonChange={(e) => setName(e.detail.value!)}
                  required
                />
              </IonItem>
              {isAdding ? (
              <IonItem>
                <IonLabel position="floating">Statut</IonLabel>
                <IonInput
                  className="modal-input"
                  value={status}
                  onIonChange={(e) => setStatus(e.detail.value!)}
                />
              </IonItem>
               ) : (
                <IonItem>
                <IonLabel position="floating">Statut</IonLabel>
                <IonInput
                  className="modal-input"
                  value={status}
                  readonly
                />
              </IonItem>
              )}
              <IonButton
                className="save-button"
                expand="full"
                type="submit"
                disabled={!name.trim() || (isAdding && (!ip.trim() || !rosVersion.trim()||!status.trim() ))}
              >
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