import React, { useState, useRef, useEffect } from 'react';
import { IonButton, IonIcon, IonContent, IonPage, IonSpinner, IonText } from '@ionic/react';
import { Stage, Layer, Image } from 'react-konva';
import { closeCircle, returnUpForward, cloudUpload, trash } from 'ionicons/icons';
import axios from 'axios';
import Konva from 'konva';

const ImageEditor: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(null);
  const [editedImagePath, setEditedImagePath] = useState<string | null>(null);
  const [isEraserActive, setIsEraserActive] = useState(false);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [stageDimensions, setStageDimensions] = useState<{ width: number; height: number }>({
    width: 384,
    height: 384,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stageRef = useRef<any>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  const imageRef = useRef<Konva.Image | null>(null);
  const isDrawing = useRef(false);

  // 🖼️ Gestion du fichier sélectionné
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setError(null);
    }
  };

  // 🔼 Upload de l'image vers le serveur
  const uploadImage = async () => {
    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier PGM.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post('http://localhost:3001/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadedImagePath(response.data.filePath);

      // Charger l'image sur le canvas
      const img = new window.Image();
      img.src = `http://localhost:3001/${response.data.filePath}`;
      img.crossOrigin = 'Anonymous'; // Autoriser l'exportation du canvas
      img.onload = () => {
        // Set stage dimensions to match the image or target size (384x384)
        const targetWidth = 384;
        const targetHeight = 384;
        const aspectRatio = img.width / img.height;

        let newWidth = targetWidth;
        let newHeight = targetHeight;

        if (aspectRatio > 1) {
          // Image is wider than tall
          newHeight = targetWidth / aspectRatio;
        } else {
          // Image is taller than wide
          newWidth = targetHeight * aspectRatio;
        }

        setStageDimensions({ width: newWidth, height: newHeight });
        setImage(img);
      };
      img.onerror = () => {
        setError('Failed to load image.');
        setLoading(false);
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload :', error);
      setError('Erreur lors de l\'upload de l\'image. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // ✏️ Activer/désactiver la gomme
  const toggleEraser = () => {
    setIsEraserActive(!isEraserActive);
    if (imageRef.current) {
      imageRef.current.draggable(!isEraserActive);
    }
  };

  // 🖌️ Gestion de l'effacement
  const handleMouseDown = (e: any) => {
    if (isEraserActive && stageRef.current) {
      isDrawing.current = true;
      const stage = stageRef.current;
      const pos = stage.getPointerPosition();
      drawEraser(pos.x, pos.y);
    }
  };

  const handleMouseMove = (e: any) => {
    if (isEraserActive && isDrawing.current && stageRef.current) {
      const stage = stageRef.current;
      const pos = stage.getPointerPosition();
      drawEraser(pos.x, pos.y);
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const drawEraser = (x: number, y: number) => {
    if (layerRef.current) {
      const layer = layerRef.current;
      const context = layer.getContext();
      context.globalCompositeOperation = 'destination-out'; // Erase mode
      context.beginPath();
      context.arc(x, y, 10, 0, Math.PI * 2, false);
      context.fill();
      context.globalCompositeOperation = 'source-over'; // Reset to default
      layer.batchDraw();
    }
  };

  // ↩️ Annuler les modifications (recharger l'image)
  const handleUndo = () => {
    if (image && uploadedImagePath) {
      const img = new window.Image();
      img.src = `http://localhost:3001/${uploadedImagePath}`;
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        setImage(img);
        if (imageRef.current) {
          imageRef.current.image(img);
          layerRef.current?.batchDraw();
        }
      };
    }
  };

  // 🗑️ Effacer tout (recharger l'image)
  const handleClearAll = () => {
    handleUndo();
  };

  // 💾 Sauvegarder l'image modifiée
  const saveEditedImage = async () => {
    const stage = stageRef.current;
    if (stage) {
      setLoading(true);
      setError(null);
      try {
        const dataURL = stage.toDataURL({
          mimeType: 'image/png',
          quality: 1,
        });

        const response = await axios.post('http://localhost:3001/save', {
          image: dataURL,
        });
        setEditedImagePath(response.data.filePath);
      } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde :', error);
        setError('Erreur lors de la sauvegarde de l\'image. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <input type="file" accept=".pgm,image/*" onChange={handleFileChange} />
        <IonButton onClick={uploadImage} disabled={loading}>
          {loading ? <IonSpinner name="crescent" /> : 'Upload Image'}
        </IonButton>

        {error && (
          <IonText color="danger" className="error-message">
            {error}
          </IonText>
        )}

        {uploadedImagePath && image && (
          <div>
            <p>Image uploadée :</p>
            <Stage
              ref={stageRef}
              width={stageDimensions.width}
              height={stageDimensions.height}
              style={{ border: '1px solid #ccc' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <Layer ref={layerRef}>
                <Image
                  ref={imageRef}
                  image={image}
                  width={stageDimensions.width}
                  height={stageDimensions.height}
                  draggable={!isEraserActive}
                />
              </Layer>
            </Stage>
            <div style={{ marginTop: '10px' }}>
              <IonButton onClick={toggleEraser}>
                {isEraserActive ? 'Désactiver la gomme' : 'Activer la gomme'}
              </IonButton>
              <IonButton onClick={handleUndo} disabled={loading}>
                <IonIcon icon={returnUpForward} />
              </IonButton>
              <IonButton onClick={handleClearAll} disabled={loading}>
                <IonIcon icon={closeCircle} />
              </IonButton>
              <IonButton onClick={saveEditedImage} disabled={loading}>
                {loading ? <IonSpinner name="crescent" /> : <IonIcon icon={cloudUpload} />}
              </IonButton>
            </div>
          </div>
        )}

        {editedImagePath && (
          <div>
            <p>Image modifiée :</p>
            <img
              src={`http://localhost:3001/${editedImagePath}`}
              alt="Edited PGM"
              style={{ maxWidth: '100%' }}
            />
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ImageEditor;