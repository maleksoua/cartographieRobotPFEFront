import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonInput,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonCard,
  IonCardContent,
} from '@ionic/react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import './Login.css';

// Import the logo and background image
import logo from '../../logo.png'// Replace with the actual path to your logo image
import backgroundImage from '../../backrend.jpg'; // Replace with the actual path to your background image

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/user/login', { email, password });
      localStorage.setItem('token', response.data.token);
      console.log('Logged in successfully');
      history.push('/home');
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
       
      </IonHeader>
      <IonContent className="ion-padding login-page" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover' }}>
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="8" sizeLg="6">
              <div className="logo-container">
                <img src={logo} alt="Logo" className="logo" />
               
              </div>
              <IonCard className="login-card">
                <IonCardContent>
                  <div className="login-form">
                    <IonInput
                      type="email"
                      placeholder="Email"
                      value={email}
                      onIonChange={(e) => setEmail(e.detail.value!)}
                      className="custom-input ion-margin-bottom"
                    />
                    <IonInput
                      type="password"
                      placeholder="Password"
                      value={password}
                      onIonChange={(e) => setPassword(e.detail.value!)}
                      className="custom-input ion-margin-bottom"
                    />
                    <IonButton expand="block" className="login-button" onClick={handleLogin}>
                      Log In
                    </IonButton>
                  </div>

                  <div className="sign-up">
                    <IonText>
                      Don't have an account yet? <a href="/signup">Create an account</a>
                    </IonText>
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Login;