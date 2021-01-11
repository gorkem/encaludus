
import * as k8s from '@kubernetes/client-node';
import {Bridge} from './bridge';

export enum ClusterConnectionStatus {
  AccessGranted = 2,
  AccessDenied = 1,
  Offline = 0
}


export class Cluster {

  private bridge : Bridge | null =null;

  constructor() {
    const kc = this.getKubeConfig();
  }


  public async connectBridge(): Promise<ClusterConnectionStatus> {
    const connectionStatus = await this.getConnectionStatus();
    if(connectionStatus == ClusterConnectionStatus.AccessGranted){
      this.bridge = new Bridge();
      await this.bridge.start();
    }

    return connectionStatus;
  }

  public async dispose(){
    if(this.bridge){
      return this.bridge.stop();
    }
  }

  public async getConnectionStatus(): Promise<ClusterConnectionStatus> {
    const kc = this.getKubeConfig();
    const versionAPI = kc.makeApiClient(k8s.VersionApi);
    let status = ClusterConnectionStatus.AccessGranted;
    try {
      const version = await versionAPI.getCode();
    }
    catch (error) {
      if (error.statusCode) {
        if (error.statusCode >= 400 && error.statusCode < 500) {
          status= ClusterConnectionStatus.AccessDenied;
        } else {
          status= ClusterConnectionStatus.Offline;
        }
      }
      else{
        Promise.reject(error);
      }
    }
    return status;
  }

  private getKubeConfig(): k8s.KubeConfig {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();
    return kc;
  }

}
