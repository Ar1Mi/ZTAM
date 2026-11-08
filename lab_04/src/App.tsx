import {
  IonApp,
  IonButton,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
  setupIonicReact,
} from '@ionic/react';
import { calculatorOutline, refreshOutline } from 'ionicons/icons';
import { useRef, useState } from 'react';

import Kalkulator from './components/Kalkulator';

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

import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import './App.css';

setupIonicReact();

// Klasyfikacja BMI według WHO (dodatek — nie było w treści zadania)
function kategoriaBMI(bmi: number): { opis: string; kolor: string } {
  if (bmi < 18.5) return { opis: 'Niedowaga', kolor: 'warning' };
  if (bmi < 25) return { opis: 'Waga prawidłowa', kolor: 'success' };
  if (bmi < 30) return { opis: 'Nadwaga', kolor: 'warning' };
  return { opis: 'Otyłość', kolor: 'danger' };
}

const App: React.FC = () => {
  const [obliczoneBMI, setObliczoneBMI] = useState<number>();
  const [blad, setBlad] = useState('');

  const wzrostRef = useRef<HTMLIonInputElement>(null);
  const wagaRef = useRef<HTMLIonInputElement>(null);

  const oblicz = () => {
    const wzrost = wzrostRef.current!.value;
    const waga = wagaRef.current!.value;
    if (!wzrost || !waga || +wzrost <= 0 || +waga <= 0) {
      setObliczoneBMI(undefined);
      setBlad('Wpisz dodatni wzrost i wagę.');
      return;
    }
    const wzrostM = +wzrost / 100;
    const bmi = +waga / (wzrostM * wzrostM);
    console.log(bmi);
    setBlad('');
    setObliczoneBMI(bmi);
  };

  const resetuj = () => {
    wzrostRef.current!.value = '';
    wagaRef.current!.value = '';
    setBlad('');
    setObliczoneBMI(undefined);
  };

  const kategoria = obliczoneBMI ? kategoriaBMI(obliczoneBMI) : null;

  return (
    <IonApp>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Kalkulator BMI</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonItem>
                <IonInput
                  ref={wzrostRef}
                  label="Wzrost (cm)"
                  labelPlacement="floating"
                  type="number"
                  inputmode="decimal"
                  min={0}
                />
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonItem>
                <IonInput
                  ref={wagaRef}
                  label="Waga (kg)"
                  labelPlacement="floating"
                  type="number"
                  inputmode="decimal"
                  min={0}
                />
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol className="ion-text-left">
              <IonButton onClick={oblicz}>
                <IonIcon slot="start" icon={calculatorOutline} />
                Oblicz
              </IonButton>
            </IonCol>
            <IonCol className="ion-text-right">
              <IonButton onClick={resetuj} color="medium" fill="outline">
                <IonIcon slot="start" icon={refreshOutline} />
                Resetuj
              </IonButton>
            </IonCol>
          </IonRow>
          {blad && (
            <IonRow>
              <IonCol>
                <IonText color="danger" role="alert">
                  <p>{blad}</p>
                </IonText>
              </IonCol>
            </IonRow>
          )}
          {obliczoneBMI && kategoria && (
            <IonRow>
              <IonCol>
                <IonCard>
                  <IonCardContent className="ion-text-center wynik-bmi">
                    <h2 data-testid="bmi">BMI: {obliczoneBMI.toFixed(2)}</h2>
                    <IonText color={kategoria.kolor}>
                      <p>{kategoria.opis}</p>
                    </IonText>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          )}
        </IonGrid>

        <Kalkulator />
      </IonContent>
    </IonApp>
  );
};

export default App;
