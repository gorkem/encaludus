import { app } from 'electron';
import { ActiveContextTracker } from './active-context-tracker';

import {Bridge} from './bridge';
import {Cluster, ClusterConnectionStatus} from './cluster';
import { WindowManager } from './window-manager';


const windowManager  = new WindowManager();

app.setName("Encaludus");

const bridge = new Bridge();



async function setUpBridgeAndLoad() {
  await bridge.stop();
  const cluster = new Cluster();
  const clusterStatus = await cluster.getConnectionStatus();

  if(clusterStatus === ClusterConnectionStatus.AccessGranted){
    bridge.start().then( ()=>  windowManager.setMainURL('http://localhost:9000')).catch ((error) => console.log(error));
  }
  else{
    windowManager.setMainURL('./www/no-connection.html');
  }
}



app.on('ready', async() => {
  const conttextTracker = new ActiveContextTracker(60000);
  conttextTracker.activeChanged.on('context-changed', ()=> {
    setUpBridgeAndLoad();
  });
  windowManager.initMainWindow();
});

app.on('window-all-closed', () => {
  bridge.stop();
  app.quit();
})

app.on('activate', async() => {

})
