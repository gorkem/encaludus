import { app } from 'electron';
import { ClusterConnectionStatus } from './cluster';
import { ClusterManager } from './cluster-manager';
import { WindowManager } from './window-manager';


const windowManager = new WindowManager();
let clusterManager:ClusterManager;

app.setName("Encaludus");


app.on('ready', async () => {
  clusterManager = ClusterManager.getInstance();
  clusterManager.on('connection-changed', (status: ClusterConnectionStatus) => {
    if (status === ClusterConnectionStatus.AccessGranted) {
      windowManager.setMainURL('http://localhost:9000');
    }
    else {
      windowManager.setMainURL('./www/no-connection.html');
    }
  });
  windowManager.initMainWindow();
});

app.on('window-all-closed', () => {
  if(clusterManager){
    clusterManager.dispose();
  }
  app.quit();
})

app.on('activate', async () => {

})
