// services/robotService.js
import axios from 'axios';



export const getRobotIPs = async () => {
  try {
    const response = await axios.get('http://localhost:3001/api/robot/robot_ips');
    return response.data;
  } catch (error) {
    console.error('Error fetching robot IPs', error);
    throw error;
  }
};
// Ajouter un robot connecté
export const addConnectedRobot = async (id, robotData) => {
  try {
    const response = await axios.put(`http://localhost:3001/api/robot/addConnectedRobot/${id}`, robotData, {
      timeout: 5000, // Délai d'attente de 5 secondes
    });
    return response.data;
  } catch (error) {
    console.error('Error adding connected robot', error);
    throw error;
  }
};
// Ajouter un robot 
export const AddRobot = async (robotData) => {
  try {
    const response = await axios.post(`http://localhost:3001/api/robot/create`, robotData, {
      timeout: 5000, // Délai d'attente de 5 secondes
    });
    return response.data;
  } catch (error) {
    console.error('Error adding connected robot', error);
    throw error;
  }
};
// Edit un robot 
export const EditRobot = async (id, robotData) => {
  try {
    const response = await axios.put(`http://localhost:3001/api/robot/update/${id}`, robotData, {
      timeout: 5000, // Délai d'attente de 5 secondes
    });
    return response.data;
  } catch (error) {
    console.error('Error editing  robot', error);
    throw error;
  }
};
// delete un robot 
export const DeleteRobot = async (id) => {
  try {
    const response = await axios.delete(`http://localhost:3001/api/robot/delete/${id}`, {
      timeout: 5000, // Délai d'attente de 5 secondes
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting robot', error);
    throw error;
  }
};
export const getRobotList = async () => {
  try {
    const response = await axios.get('http://localhost:3001/api/robot/fetch');
    return response.data;
  } catch (error) {
    console.error('Error fetching robot IPs', error);
    throw error;
  }
};