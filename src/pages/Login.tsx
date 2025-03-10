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
  IonIcon,
  IonText,
  IonCard,
  IonCardContent,
} from '@ionic/react';
import { logoGoogle, logoFacebook, logoTwitter } from 'ionicons/icons';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import './Login.css';

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
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="8" sizeLg="6">
              <IonCard>
                <IonCardContent>
                  <div className="welcome-text">
                    <h1>Welcome</h1>
                    <p>Please login to continue</p>
                  </div>

                  <div className="login-form">
                    <IonInput
                      type="email"
                      placeholder="Email"
                      value={email}
                      onIonChange={(e) => setEmail(e.detail.value!)}
                      className="ion-margin-bottom"
                    />
                    <IonInput
                      type="password"
                      placeholder="Password"
                      value={password}
                      onIonChange={(e) => setPassword(e.detail.value!)}
                      className="ion-margin-bottom"
                    />
                    <IonButton expand="block" className="login-button" onClick={handleLogin}>
                      Login
                    </IonButton>
                  </div>

                  <div className="login-via">
                    <IonText>Login Via</IonText>
                    <div className="social-buttons">
                      <IonButton fill="clear" className="social-button">
                        <IonIcon icon={logoGoogle} />
                      </IonButton>
                      <IonButton fill="clear" className="social-button">
                        <IonIcon icon={logoFacebook} />
                      </IonButton>
                      <IonButton fill="clear" className="social-button">
                        <IonIcon icon={logoTwitter} />
                      </IonButton>
                    </div>
                  </div>

                  <div className="sign-up">
                    <IonText>
                      Don't have an account? <a href="/signup">Sign Up</a>
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