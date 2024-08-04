import axios from 'axios';

export interface IBackendServerDetails {
  ping: () => Promise<void>;
  getServerStatus: () => EServerStatus;
  getServerUrl: () => string;
}

export enum EServerStatus {
  HEALTHY = 'HEALTHY',
  UNHEALTHY = 'UNHEALTHY'
}

export class BackendServerDetails implements IBackendServerDetails {
  private serverUrl: string;
  private status: EServerStatus;

  constructor(serverUrl: string, status?: EServerStatus) {
    this.serverUrl = serverUrl;
    this.status = status || EServerStatus.UNHEALTHY;
  }

  public ping = async () => {
    const url = `${this.serverUrl}/ping`;
    try {
      console.log(`Pinging server at ${this.serverUrl}`);
      const response = await axios.get(url);
      this.status =
        response.status === 200
          ? EServerStatus.HEALTHY
          : EServerStatus.UNHEALTHY;
    } catch (error) {
      this.status = EServerStatus.UNHEALTHY;
    }
  };

  public getServerStatus() {
    return this.status;
  }

  public getServerUrl() {
    return this.serverUrl;
  }
}
