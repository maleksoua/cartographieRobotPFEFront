import { IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel } from '@ionic/react';

const Sidebar: React.FC = () => {
    return (
        <IonMenu contentId="main-content" side="start">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Menu</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            <IonItem routerLink="/home">
              <IonLabel>Home</IonLabel>
            </IonItem>
            <IonItem routerLink="/cardlive">
              <IonLabel>CardLive</IonLabel>
            </IonItem>
           
            <IonItem routerLink="/RobotNotAdded">
              <IonLabel>RobotNotAdded</IonLabel>
            </IonItem>
            <IonItem routerLink="/ListRobot">
              <IonLabel>ListRobot</IonLabel>
            </IonItem>
            <IonItem routerLink="/ListMap">
              <IonLabel>ListMap</IonLabel>
            </IonItem>
            <IonItem routerLink="/Imageeditor">
              <IonLabel>ImageEditor</IonLabel>
            </IonItem>
            <IonItem routerLink="/SendMap">
              <IonLabel>SendMap</IonLabel>
            </IonItem>
          </IonList>
        </IonContent>
      </IonMenu>
 
  );
};

export default Sidebar;
