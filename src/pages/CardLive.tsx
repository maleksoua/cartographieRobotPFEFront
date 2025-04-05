import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonMenuButton,
  IonButton,
  IonIcon,
  IonToast,
  IonInput,
  IonRange
} from '@ionic/react';
import { Joystick } from 'react-joystick-component';
import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import './CardLive.css';
import { play, save } from 'ionicons/icons';

const CardLive: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [name, setName] = useState('');
  const imageRef = useRef<HTMLImageElement>(null);
  const [speed, setSpeed] = useState(0.5);

  const sendCommand = async (command: string) => {
    try {
      const payload = { command, speed };
      await axios.post('http://localhost:3001/api/robot/move', payload);
      setToastMessage(`Robot: ${command}`);
      setShowToast(true);
    } catch (error) {
      setToastMessage('Erreur de contrôle');
      setShowToast(true);
    }
  };

  const handleMove = (event: any) => {
    const { x, y } = event;
    const threshold = 0.5;
    if (y > threshold) sendCommand('up');
    else if (y < -threshold) sendCommand('down');
    else if (x > threshold) sendCommand('right');
    else if (x < -threshold) sendCommand('left');
    else sendCommand('stop');
  };

  const handleStop = () => sendCommand('stop');

  useEffect(() => {
    const interval = setInterval(() => {
      if (imageRef.current) {
        imageRef.current.src = `http://localhost:3001/map_live.png?timestamp=${Date.now()}`;
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const startSlam = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/start-slam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: 'robot/slam/status', message: 'SLAM Started' }),
      });
      setToastMessage(response.ok ? 'SLAM Activé' : 'Erreur SLAM');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Erreur serveur');
      setShowToast(true);
    }
  };

  const saveMap = async () => {
    if (!name) {
      setToastMessage('Nom requis');
      setShowToast(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/map_live.png');
      const blob = await response.blob();
      const base64data = await blobToBase64(blob);
      
      const saveResponse = await fetch('http://localhost:3001/api/map/save-live-map-no-robot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64data, name }),
      });

      setToastMessage(saveResponse.ok ? 'Carte sauvegardée' : 'Erreur sauvegarde');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Erreur serveur');
      setShowToast(true);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };

  return (
    <IonPage id="main-content">
      <IonHeader>
        <IonToolbar className="header-toolbar">
          <IonMenuButton slot="start" />
          <IonTitle>Robot Live Map</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="robot-control-container">
        <div className="map-container">
          <img ref={imageRef} className="live-map" alt="Robot Live Map" />
        </div>

        <div className="control-section">
          <div className="joystick-panel">
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Contrôle</h3>
            <div className="joystick-container">
              <Joystick
                baseColor="#333333"
                stickColor="#007acc"
                move={handleMove}
                stop={handleStop}
                size={120}
              />
            </div>
          </div>

          <div className="control-buttons">
            <IonButton className="robot-button" onClick={startSlam}>
              <IonIcon slot="start" icon={play} />
              SLAM
            </IonButton>
            <IonButton className="robot-button" onClick={saveMap}>
              <IonIcon slot="start" icon={save} />
              Sauvegarder
            </IonButton>
            <IonInput
              className="map-input"
              type="text"
              placeholder="Nom carte"
              value={name}
              onIonChange={(e) => setName(e.detail.value!)}
            />
          </div>
        </div>

        <div className="speed-panel">
          <p>Vitesse: {speed.toFixed(1)}</p>
          <IonRange
            min={0}
            max={1}
            step={0.1}
            value={speed}
            onIonChange={(e) => setSpeed(e.detail.value as number)}
          />
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={1500}
          position="bottom"
          cssClass="status-toast"
        />
      </IonContent>
    </IonPage>
  );
};

export default CardLive;