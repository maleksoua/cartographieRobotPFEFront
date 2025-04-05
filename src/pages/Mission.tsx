import React, { useEffect, useState, useRef } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonAlert,
  IonMenuButton,
  IonLoading,
} from '@ionic/react';
import axios from 'axios';
import { getMapId, getMapList } from '../services/mapService';

interface Map {
  _id: string;
  filename: string;
}
interface Robot {
  _id: string;
  name: string;
  ip: string;
  status: string;
}
interface Position {
  x: number;
  y: number;
}
interface MissionStatus {
  robotIP: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  message: string;
  missionId?: string;
}

const APIRobot_URL = 'http://localhost:3001/api/robot';
const ws = new WebSocket('ws://localhost:3001');

const Mission: React.FC = () => {
  const [maps, setMaps] = useState<Map[]>([]);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [selectedMapId, setSelectedMapId] = useState<string>('');
  const [selectedRobotId, setSelectedRobotId] = useState<string>('');
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [targetPosition, setTargetPosition] = useState<Position | null>(null);
  const [missionStatus, setMissionStatus] = useState<MissionStatus | null>(null);
  const [mapImageUrl, setMapImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [trajectory, setTrajectory] = useState<Position[]>([]);
  const [robotPosition, setRobotPosition] = useState<Position>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    ws.onopen = () => console.log('Connected to WebSocket server');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'mission_status') {
        const statusData = data.data;
        setMissionStatus(statusData);
        if (statusData.status === 'completed' || statusData.status === 'failed') {
          setAlertMessage(`${statusData.status.toUpperCase()}: ${statusData.message}`);
          setShowAlert(true);
          setActiveMissionId(null);
          setTrajectory([]); // Clear trajectory on mission end
        }
      } else if (data.type === 'map_update') {
        setMapImageUrl(`${data.data.url}?t=${data.data.timestamp}`);
      } else if (data.type === 'trajectory_update') {
        console.log('Received trajectory update:', data.data);
        setTrajectory(data.data.trajectory);
        setRobotPosition(data.data.robotPosition);
      }
    };
    ws.onerror = (error) => console.error('WebSocket error:', error);
    ws.onclose = () => console.log('Disconnected from WebSocket');
    return () => {
      // ws.close();
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [mapsData, robotsData] = await Promise.all([
          getMapList(),
          axios.get(`${APIRobot_URL}/fetch`, { withCredentials: true }),
        ]);
        setMaps(mapsData);
        setRobots(robotsData.data.filter((r: Robot) => r.status === 'connected'));
      } catch (error) {
        console.error('Error fetching data:', error);
        setAlertMessage('Failed to load data. Please check server connection.');
        setShowAlert(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const loadMapImage = async () => {
      if (!selectedMapId) {
        setMapImageUrl(null);
        return;
      }
      setIsLoading(true);
      try {
        const { url } = await getMapId(selectedMapId);
        setMapImageUrl(url);
      } catch (error) {
        console.error('Error loading map image:', error);
        setAlertMessage('Failed to load map image.');
        setShowAlert(true);
      } finally {
        setIsLoading(false);
      }
    };
    loadMapImage();
  }, [selectedMapId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    // Set canvas size (default to 384x384 if no map is loaded yet)
    canvas.width = 384;
    canvas.height = 384;

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw map if available
    if (mapImageUrl) {
      const img = new Image();
      img.src = mapImageUrl;
      img.onload = () => {
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawTrajectoryAndPosition(context);
      };
      img.onerror = () => {
        setAlertMessage('Failed to load map image.');
        setShowAlert(true);
        drawTrajectoryAndPosition(context); // Draw even if map fails
      };
    } else {
      // Draw a blank background if no map
      context.fillStyle = '#e0e0e0';
      context.fillRect(0, 0, canvas.width, canvas.height);
      drawTrajectoryAndPosition(context);
    }

    function drawTrajectoryAndPosition(ctx: CanvasRenderingContext2D) {
      // Coordinate transformation (assuming map resolution and origin match backend)
      const scale = 384 / 19.2; // Map width (384px) / map size (19.2m) = 20 px/m
      const originX = 9.6; // Map origin_x from ROS (-9.6 shifted to positive)
      const originY = 9.6; // Map origin_y from ROS (-9.6 shifted to positive)

      // Draw trajectory
      if (trajectory.length > 0) {
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 2;
        ctx.beginPath();
        trajectory.forEach((point, index) => {
          const canvasY = (point.x + originX) * scale;
          const canvasX = (originY - point.y) * scale; // Invert Y-axis for canvas
          if (index === 0) {
            ctx.moveTo(canvasX, canvasY);
          } else {
            ctx.lineTo(canvasX, canvasY);
          }
        });
        ctx.stroke();
      }

      // Draw robot position
      if (robotPosition) {
        const canvasY = (robotPosition.x + originX) * scale;
        const canvasX = (originY - robotPosition.y) * scale;
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, 5, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Draw target position (in pixel coordinates from click)
      if (targetPosition) {
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(targetPosition.x - 10, targetPosition.y);
        ctx.lineTo(targetPosition.x + 10, targetPosition.y);
        ctx.moveTo(targetPosition.x, targetPosition.y - 10);
        ctx.lineTo(targetPosition.x, targetPosition.y + 10);
        ctx.stroke();
      }
    }
  }, [mapImageUrl, targetPosition, trajectory, robotPosition]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setTargetPosition({ x, y });
  };

  const sendMap = async () => {
    if (!selectedMapId || !selectedRobotId) {
      setAlertMessage('Please select both a map and a robot.');
      setShowAlert(true);
      return;
    }
    const robot = robots.find((r) => r._id === selectedRobotId);
    if (!robot) {
      setAlertMessage('Selected robot not found.');
      setShowAlert(true);
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:3001/api/map/envoyer/${selectedMapId}`,
        { robotIP: robot.ip },
        { withCredentials: true }
      );
      setAlertMessage(`Map sent to ${robot.name}: ${response.data.message}`);
      setShowAlert(true);
    } catch (error) {
      console.error('Error sending map:', error);
      setAlertMessage('Failed to send map.');
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const startMission = async () => {
    if (!selectedRobotId || !targetPosition) {
      setAlertMessage('Please select a robot and set a target position.');
      setShowAlert(true);
      return;
    }
    const robot = robots.find((r) => r._id === selectedRobotId);
    if (!robot) {
      setAlertMessage('Selected robot not found.');
      setShowAlert(true);
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${APIRobot_URL}/move-to-position`,
        { robotIP: robot.ip, position: targetPosition },
        { withCredentials: true }
      );
      setAlertMessage(`Mission started for ${robot.name}`);
      setShowAlert(true);
      setActiveMissionId(response.data.missionId || 'unknown');
    } catch (error) {
      console.error('Error starting mission:', error);
      setAlertMessage('Failed to start mission.');
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>Mission Control</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading isOpen={isLoading} message="Processing..." />
        <div className="ion-padding">
          <IonSelect
            value={selectedMapId}
            placeholder="Select Map"
            onIonChange={(e) => setSelectedMapId(e.detail.value)}
            interface="popover"
          >
            {maps.map((map) => (
              <IonSelectOption key={map._id} value={map._id}>
                {map.filename}
              </IonSelectOption>
            ))}
          </IonSelect>
          <IonSelect
            value={selectedRobotId}
            placeholder="Select Robot"
            onIonChange={(e) => setSelectedRobotId(e.detail.value)}
            interface="popover"
          >
            {robots.map((robot) => (
              <IonSelectOption key={robot._id} value={robot._id}>
                {robot.name} ({robot.ip})
              </IonSelectOption>
            ))}
          </IonSelect>
          <div style={{ margin: '20px 0' }}>
            <canvas
              ref={canvasRef}
              style={{ border: '1px solid #ddd', maxWidth: '100%' }}
              onClick={handleCanvasClick}
            />
            <p style={{ textAlign: 'center', color: '#666' }}>
              Click on the map to set target position
            </p>
          </div>
          <IonButton expand="block" onClick={sendMap} disabled={!selectedMapId || !selectedRobotId}>
            Send Map to Robot
          </IonButton>
          <IonButton
            expand="block"
            onClick={startMission}
            disabled={!selectedRobotId || !targetPosition || !!activeMissionId}
            color={activeMissionId ? 'warning' : 'primary'}
          >
            {activeMissionId ? 'Mission in Progress...' : 'Start Mission'}
          </IonButton>
        </div>
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={missionStatus?.status.toUpperCase() || 'Notification'}
          subHeader={missionStatus?.robotIP ? `Robot: ${missionStatus.robotIP}` : undefined}
          message={alertMessage}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Mission;