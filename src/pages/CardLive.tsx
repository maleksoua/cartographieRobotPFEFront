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
} from '@ionic/react';
import { useEffect, useState, useRef } from 'react';
import './CardLive.css';
import { play, save } from 'ionicons/icons';

const CardLive: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [name, setName] = useState('');
  const imageRef = useRef<HTMLImageElement>(null);

  // Rafraîchir l'image toutes les 500 ms sans re-rendering
  useEffect(() => {
    const interval = setInterval(() => {
      if (imageRef.current) {
        imageRef.current.src = `http://localhost:3001/map_live.png?timestamp=${Date.now()}`;
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);
  //slam
    // Fonction pour démarrer SLAM
    const startSlam = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/start-slam', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic: 'robot/slam/status',
            message: 'SLAM Started',
          }),
        });
  
        if (response.ok) {
          setToastMessage('SLAM démarré avec succès !');
          setShowToast(true);
        } else {
          setToastMessage('Erreur lors du démarrage de SLAM.');
          setShowToast(true);
        }
      } catch (error) {
        console.error('Erreur:', error);
        setToastMessage('Erreur de connexion au serveur.');
        setShowToast(true);
      }
    };

  const saveMap = async () => {
    if (!name) {
      setToastMessage('Veuillez entrer un nom pour la carte.');
      setShowToast(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/map_live.png');
      const blob = await response.blob();

      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result;

        try {
          const saveResponse = await fetch('http://localhost:3001/api/map/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image: base64data,
              name: name,
            }),
          });

          if (saveResponse.ok) {
            setToastMessage('Carte sauvegardée avec succès !');
            setShowToast(true);
          } else {
            setToastMessage('Erreur lors de la sauvegarde de la carte.');
            setShowToast(true);
          }
        } catch (error) {
          console.error('Erreur lors de la sauvegarde :', error);
          setToastMessage('Erreur de connexion au serveur.');
          setShowToast(true);
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'image :', error);
      setToastMessage('Erreur lors de la récupération de l\'image.');
      setShowToast(true);
    }
  };

  return (
    <IonPage id="main-content">
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>Carte en direct</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonButton onClick={saveMap}>
          <IonIcon icon={save} />
        </IonButton>
        <IonButton onClick={startSlam}>
          <IonIcon icon={play} />
        </IonButton>
        <div className="login-form">
          <IonInput
            type="text"
            placeholder="Name"
            value={name}
            onIonChange={(e) => setName(e.detail.value!)}
            className="ion-margin-bottom"
          />
        </div>
        <img
          ref={imageRef}
          src={`http://localhost:3001/map_live.png?timestamp=${Date.now()}`}
          alt="Carte en direct"
        />
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
        />
      </IonContent>
    </IonPage>
  );
};

export default CardLive;