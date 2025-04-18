import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import Login from './pages/Login';
import CardLive from './pages/CardLive';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './pages/Sidebar';
import RobotNotAdded from './pages/RobotNotAdded'
import ListRobotFinal from './pages/RobotListFinal'
import ImageEditor from './pages/ImageEditor'
import ListMap from './pages/ManageMap'
/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import Mission from './pages/Mission';


setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <Sidebar />
      <IonRouterOutlet id="main-content">
      <Route exact path="/login" component={Login} />
        <ProtectedRoute exact path="/home" component={Home} />
        <ProtectedRoute exact path="/cardlive" component={CardLive} />
        <ProtectedRoute exact path="/robotnotadded" component={RobotNotAdded} />
        <ProtectedRoute exact path="/sendmap" component={Mission} />
        <ProtectedRoute exact path="/listrobot" component={ListRobotFinal} />
        <ProtectedRoute exact path="/Imageeditor" component={ImageEditor} />
        <ProtectedRoute exact path="/listmap" component={ListMap} />
        <Route exact path="/"><Redirect to="/login" /></Route>
        
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App; 
