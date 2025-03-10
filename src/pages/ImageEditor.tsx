import React, { useState, useRef } from 'react';
import { IonButton, IonIcon,IonContent, IonPage } from '@ionic/react';
import { Stage, Layer, Image, Circle } from 'react-konva';
import {closeCircle, returnUpForward, cloudUpload ,trash} from 'ionicons/icons';
import axios from 'axios';

const ImageEditor: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(null);
    const [editedImagePath, setEditedImagePath] = useState<string | null>(null);
    const [isEraserActive, setIsEraserActive] = useState(false);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [eraserCircles, setEraserCircles] = useState<Array<{ x: number; y: number; radius: number }>>([]);
    const stageRef = useRef<any>(null);

    // 🖼️ Gestion du fichier sélectionné
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };

    // 🔼 Upload de l'image vers le serveur
    const uploadImage = async () => {
        if (!selectedFile) {
            alert('Veuillez sélectionner un fichier PGM.');
            return;
        }

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
                setImage(img);
            };
        } catch (error) {
            console.error('❌ Erreur lors de l\'upload :', error);
        }
    };

    // ✏️ Activer/désactiver la gomme
    const toggleEraser = () => {
        setIsEraserActive(!isEraserActive);
    };
    const handleClearAll = () => {
        setEraserCircles([]);
    };

    // 🖌️ Gestion du clic pour la gomme
    const handleClick = (e: any) => {
        if (isEraserActive && stageRef.current) {
            const stage = stageRef.current;
            const pointer = stage.getPointerPosition();

            // Ajouter un nouveau cercle à la liste des cercles de gomme
            setEraserCircles((prevCircles) => [
                ...prevCircles,
                {
                    x: pointer.x, // Position X du cercle
                    y: pointer.y, // Position Y du cercle
                    radius: 10, // Rayon du cercle (taille de la gomme)
                },
            ]);
        }
    };

    // ↩️ Annuler le dernier cercle dessiné
    const handleUndo = () => {
        if (eraserCircles.length > 0) {
            setEraserCircles((prevCircles) => prevCircles.slice(0, -1));
        }
    };

    // 💾 Sauvegarder l'image modifiée
    const saveEditedImage = async () => {
        const stage = stageRef.current;
        if (stage) {
            const dataURL = stage.toDataURL({
                mimeType: 'image/png',
                quality: 1,
            });

            try {
                const response = await axios.post('http://localhost:3001/save', {
                    image: dataURL,
                });
                setEditedImagePath(response.data.filePath);
            } catch (error) {
                console.error('❌ Erreur lors de la sauvegarde :', error);
                alert('Erreur lors de la sauvegarde de l\'image. Veuillez réessayer.');
            }
        }
    };

    return (
        <IonPage>
            <IonContent className="ion-padding">
                <input type="file" accept=".pgm" onChange={handleFileChange} />
                <IonButton onClick={uploadImage}>Upload Image</IonButton>

                {uploadedImagePath && (
                    <div>
                        <p>Image uploadée :</p>
                        <Stage
                            ref={stageRef}
                            width={200}
                            height={200}
                            style={{  }}
                            onClick={handleClick} // Gestion du clic
                        >
                            <Layer>
                                {image && (
                                    <Image
                                        image={image}
                                        width={200}
                                        height={200}
                                        draggable={!isEraserActive}
                                    />
                                )}
                                {eraserCircles.map((circle, index) => (
                                    <Circle
                                        key={index}
                                        x={circle.x}
                                        y={circle.y}
                                        radius={circle.radius}
                                        fill="white" // Remplissage blanc
                                        stroke="white" // Contour blanc
                                        strokeWidth={2} // Épaisseur du contour
                                    />
                                ))}
                            </Layer>
                        </Stage>
                        <IonButton onClick={toggleEraser}>
                            {isEraserActive ? 'Désactiver la gomme' : 'Activer la gomme'}
                            
                            
                        </IonButton>
                        <IonButton onClick={handleUndo} disabled={eraserCircles.length === 0}>
    <IonIcon icon={returnUpForward} />
</IonButton>
                        <IonButton onClick={handleClearAll} disabled={eraserCircles.length === 0}>
                        <IonIcon icon={closeCircle} />
                          </IonButton>
                        <IonButton onClick={saveEditedImage}> <IonIcon icon={cloudUpload} /></IonButton>
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