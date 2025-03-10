import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonMenuButton,IonGrid, IonRow, IonCol, IonRange } from '@ionic/react';
import axios from 'axios';

const ControlPage: React.FC = () => {
  const [speed, setSpeed] = useState(0.5);

  const sendCommand = async (command: string) => {
    try {
      const payload = { command, speed };
      await axios.post('http://localhost:3001/api/robot/move', payload);
      console.log('Command sent:', payload);
    } catch (error) {
      console.error('Error sending command:', error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
            <IonMenuButton slot="start" />
          <IonTitle>Robot Control</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonButton expand="block" color="primary" onClick={() => sendCommand('up')}>
              ⬆️ Up
            </IonButton>
          </IonRow>
          <IonRow className="ion-justify-content-between">
            <IonCol>
              <IonButton expand="block" color="secondary" onClick={() => sendCommand('left')}>
                ⬅️ Left
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton expand="block" color="danger" onClick={() => sendCommand('stop')}>
                ⏹ Stop
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton expand="block" color="secondary" onClick={() => sendCommand('right')}>
                ➡️ Right
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow className="ion-justify-content-center">
            <IonButton expand="block" color="primary" onClick={() => sendCommand('down')}>
              ⬇️ Down
            </IonButton>
          </IonRow>
        </IonGrid>
        <IonRange min={0} max={1} step={0.1} value={speed} onIonChange={(e) => setSpeed(e.detail.value as number)}>
          <p>Speed: {speed}</p>
        </IonRange>
      </IonContent>
    </IonPage>
  );
};

export default ControlPage;
