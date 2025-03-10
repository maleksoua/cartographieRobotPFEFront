import React, { useState, useRef, useEffect } from 'react';
import { IonButton, IonIcon, IonContent, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonItem, IonLabel, IonInput } from '@ionic/react';
import { Stage, Layer, Image, Circle } from 'react-konva';
import { closeCircle, returnUpForward, cloudUpload } from 'ionicons/icons';

const ImageEditorModal: React.FC<{
  imageUrl: string;
  initialFilename: string;
  onSave: (data: { imageData: string; filename: string }) => void;
  onClose: () => void;
}> = ({ imageUrl, initialFilename, onSave, onClose }) => {
  const [isEraserActive, setIsEraserActive] = useState(false);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [eraserCircles, setEraserCircles] = useState<Array<{ x: number; y: number; radius: number }>>([]);
  const [filename, setFilename] = useState(initialFilename);
  const stageRef = useRef<any>(null);

  // Charger l'image dans le composant
  useEffect(() => {
    const img = new window.Image();
    img.src = imageUrl;
    img.crossOrigin = 'Anonymous'; // Autoriser l'exportation du canvas
    img.onload = () => {
      setImage(img);
    };
  }, [imageUrl]);

  // Activer/désactiver la gomme
  const toggleEraser = () => {
    setIsEraserActive(!isEraserActive);
  };

  // Gestion du clic pour la gomme
  const handleClick = (e: any) => {
    if (isEraserActive && stageRef.current) {
      const stage = stageRef.current;
      const pointer = stage.getPointerPosition();

      // Ajouter un nouveau cercle à la liste des cercles de gomme
      setEraserCircles((prevCircles) => [
        ...prevCircles,
        {
          x: pointer.x,
          y: pointer.y,
          radius: 10,
        },
      ]);
    }
  };

  // Annuler le dernier cercle dessiné
  const handleUndo = () => {
    if (eraserCircles.length > 0) {
      setEraserCircles((prevCircles) => prevCircles.slice(0, -1));
    }
  };

  const handleClearAll = () => {
    setEraserCircles([]);
  };

  // Sauvegarder l'image modifiée
  const handleSave = () => {
    const stage = stageRef.current;
    if (stage) {
      const dataURL = stage.toDataURL({
        mimeType: 'image/png',
        quality: 1,
      });
  
      // Envoyer l'image modifiée et le nouveau filename au parent
      onSave({
        imageData: dataURL, // Assurez-vous que c'est bien une chaîne base64
        filename: filename,
      });
    }
  };

  return (
    <IonModal isOpen={!!imageUrl} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Edit Map</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {/* Champ pour modifier le nom du fichier */}
        <IonItem>
          <IonLabel position="floating">Filename</IonLabel>
          <IonInput
            value={filename}
            onIonChange={(e) => setFilename(e.detail.value!)}
          />
        </IonItem>

        {/* Canvas pour l'image */}
        <Stage
          ref={stageRef}
          width={500}
          height={500}
          onClick={handleClick}
        >
          <Layer>
            {image && (
              <Image
                image={image}
                width={500}
                height={500}
                draggable={!isEraserActive}
              />
            )}
            {eraserCircles.map((circle, index) => (
              <Circle
                key={index}
                x={circle.x}
                y={circle.y}
                radius={circle.radius}
                fill="white"
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </Layer>
        </Stage>

        {/* Boutons pour gérer la gomme, annuler, effacer tout et sauvegarder */}
        <IonButton onClick={toggleEraser}>
          {isEraserActive ? 'Désactiver la gomme' : 'Activer la gomme'}
        </IonButton>
        <IonButton onClick={handleUndo} disabled={eraserCircles.length === 0}>
          <IonIcon icon={returnUpForward} />
        </IonButton>
        <IonButton onClick={handleClearAll} disabled={eraserCircles.length === 0}>
          <IonIcon icon={closeCircle} />
        </IonButton>
        <IonButton onClick={handleSave}>
          <IonIcon icon={cloudUpload} />
        </IonButton>
      </IonContent>
    </IonModal>
  );
};

export default ImageEditorModal;