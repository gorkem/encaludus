import { EventEmitter } from 'events';
import { ActiveContextTracker } from './active-context-tracker';
import { Cluster} from './cluster';
const CONTEXT_POLL_INTERVAL = 60000; //ms

export class ClusterManager extends EventEmitter{
    private static instance: ClusterManager;
    private readonly k8sContextTracker = new ActiveContextTracker(CONTEXT_POLL_INTERVAL);
    private selectedCluster: Cluster | null;

    constructor(){
      super()
      this.selectedCluster = null;
      this.k8sContextTracker.activeChanged.on('context-changed', ()=> {
        this.updateSelectedCluster();
      });
    }

    private async updateSelectedCluster() {
      if(this.selectedCluster){
        await this.selectedCluster.dispose();
      }
      this.selectedCluster = new Cluster();
      const clusterStatus = await this.selectedCluster.connectBridge();
      this.emit('connection-changed', clusterStatus);
    }


    public dispose(){
      if(this.selectedCluster){
        this.selectedCluster.dispose();
      }
    }
    static getInstance(): ClusterManager{
      if(!ClusterManager.instance){
        ClusterManager.instance = new ClusterManager();
      }
      return ClusterManager.instance;
    }

}
