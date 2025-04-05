import React, { useState, useRef, useEffect } from 'react';
import { IonButton, IonIcon, IonContent, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonItem, IonLabel, IonInput } from '@ionic/react';
import { Stage, Layer, Image, Circle, Line } from 'react-konva';
import { closeCircle, returnUpForward, cloudUpload, saveOutline } from 'ionicons/icons';

const ImageEditorModal: React.FC<{
  imageUrl: string;
  initialFilename: string;
  onSave: (data: { imageData: string; filename: string }) => void;
  onClose: () => void;
}> = ({ imageUrl, initialFilename, onSave, onClose }) => {
  const [isEraserActive, setIsEraserActive] = useState(false);
  const [isPencilActive, setIsPencilActive] = useState(false);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [circles, setCircles] = useState<Array<{ x: number; y: number; radius: number; color: string }>>([]);
  const [lines, setLines] = useState<Array<{ points: number[]; color: string }>>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [filename, setFilename] = useState(initialFilename);
  const stageRef = useRef<any>(null);

  // Charger l'image dans le composant
  useEffect(() => {
    const img = new window.Image();
    img.src = imageUrl;
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      setImage(img);
    };
  }, [imageUrl]);

  // Activer/désactiver la gomme
  const toggleEraser = () => {
    setIsEraserActive(!isEraserActive);
    if (isPencilActive) setIsPencilActive(false);
  };

  // Activer/désactiver le crayon noir
  const togglePencil = () => {
    setIsPencilActive(!isPencilActive);
    if (isEraserActive) setIsEraserActive(false);
  };

  // Début du dessin
  const handleMouseDown = (e: any) => {
    if (stageRef.current) {
      const stage = stageRef.current;
      const pointer = stage.getPointerPosition();

      if (isEraserActive) {
        setCircles((prevCircles) => [
          ...prevCircles,
          { x: pointer.x, y: pointer.y, radius: 10, color: 'white' },
        ]);
      } else if (isPencilActive) {
        setIsDrawing(true);
        setLines((prevLines) => [
          ...prevLines,
          { points: [pointer.x, pointer.y], color: 'black' },
        ]);
      }
    }
  };

  // Dessin en cours
  const handleMouseMove = (e: any) => {
    if (!isDrawing || !isPencilActive || !stageRef.current) return;

    const stage = stageRef.current;
    const pointer = stage.getPointerPosition();

    setLines((prevLines) => {
      const lastLine = prevLines[prevLines.length - 1];
      const updatedLines = prevLines.slice(0, -1);
      return [
        ...updatedLines,
        { ...lastLine, points: [...lastLine.points, pointer.x, pointer.y] },
      ];
    });
  };

  // Fin du dessin
  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  // Annuler la dernière action
  const handleUndo = () => {
    if (isPencilActive && lines.length > 0) {
      setLines((prevLines) => prevLines.slice(0, -1));
    } else if (isEraserActive && circles.length > 0) {
      setCircles((prevCircles) => prevCircles.slice(0, -1));
    }
  };

  // Effacer tout
  const handleClearAll = () => {
    setCircles([]);
    setLines([]);
  };

  // Sauvegarder l'image modifiée (envoyer au parent)
  const handleSave = () => {
    const stage = stageRef.current;
    if (stage) {
      const dataURL = stage.toDataURL({
        mimeType: 'image/png',
        quality: 1,
      });

      onSave({
        imageData: dataURL,
        filename: filename,
      });
    }
  };

  // Télécharger l'image modifiée sur le bureau (dossier Téléchargements)
  const handleDownload = () => {
    const stage = stageRef.current;
    if (stage) {
      const dataURL = stage.toDataURL({
        mimeType: 'image/png',
        quality: 1,
      });

      // Créer un lien temporaire pour le téléchargement
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `${filename || 'edited_map'}.png`; // Nom du fichier avec extension
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
          width={384}
          height={384}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <Layer>
            {image && (
              <Image
                image={image}
                width={384}
                height={384}
                draggable={!isEraserActive && !isPencilActive}
              />
            )}
            {/* Affichage des cercles (gomme) */}
            {circles.map((circle, index) => (
              <Circle
                key={index}
                x={circle.x}
                y={circle.y}
                radius={circle.radius}
                fill={circle.color}
                stroke={circle.color}
                strokeWidth={2}
              />
            ))}
            {/* Affichage des lignes (crayon) */}
            {lines.map((line, index) => (
              <Line
                key={index}
                points={line.points}
                stroke={line.color}
                strokeWidth={2}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
              />
            ))}
          </Layer>
        </Stage>

        {/* Boutons pour gérer la gomme, le crayon, annuler, effacer tout, sauvegarder et télécharger */}
        <IonButton onClick={toggleEraser}>
          {isEraserActive ? 'Désactiver la gomme' : 'Activer la gomme'}
        </IonButton>
        <IonButton onClick={togglePencil}>
          {isPencilActive ? 'Désactiver le crayon' : 'Activer le crayon noir'}
        </IonButton>
        <IonButton onClick={handleUndo} disabled={circles.length === 0 && lines.length === 0}>
          <IonIcon icon={returnUpForward} />
        </IonButton>
        <IonButton onClick={handleClearAll} disabled={circles.length === 0 && lines.length === 0}>
          <IonIcon icon={closeCircle} />
        </IonButton>
        <IonButton onClick={handleSave}>
          <IonIcon icon={cloudUpload} />
        </IonButton>
        <IonButton onClick={handleDownload}>
          <IonIcon icon={saveOutline} />
        </IonButton>
      </IonContent>
    </IonModal>
  );
};

export default ImageEditorModal;