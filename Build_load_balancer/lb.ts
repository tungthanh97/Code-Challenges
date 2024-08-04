import { Server } from 'http';
import {
  BackendServerDetails,
  EServerStatus,
  IBackendServerDetails
} from './server_details';
import express from 'express';
import httpProxy from 'http-proxy';

interface ILoadBalancer {}

export class LoadBalancer implements ILoadBalancer {
  private lbServer: Server;
  private servers: IBackendServerDetails[] = [];
  private healthyServers: IBackendServerDetails[] = [];
  private currentServerIndex = 0;
  private port = 80;

  constructor(port: number, targetServerUrls: string[]) {
    this.port = port;
    this.servers = targetServerUrls.map((url) => new BackendServerDetails(url));
    this.startLoadBalancerServer();
  }

  private startLoadBalancerServer = () => {
    const proxy = httpProxy.createProxyServer({});
    const app = express();

    app.use((req, res) => {
      const targetServer = this.chooseServer();
      console.log(`Proxying request to: ${targetServer.getServerUrl()}`);
      proxy.web(req, res, { target: targetServer.getServerUrl() });
    });

    this.lbServer = app.listen(this.port, () => {
      this.startHealthCheck();
    });
  };

  public stopLoadBalancerServer = () => {
    this.lbServer.close();
  };

  private chooseServer = () => {
    if (this.healthyServers.length === 0) {
      throw new Error('No healthy servers available');
    }

    this.currentServerIndex =
      (this.currentServerIndex + 1) % this.healthyServers.length;
    return this.healthyServers[this.currentServerIndex];
  };

  public performHealthCheck = () => {
    const healthCheckTasks = this.servers.map((server) => {
      return server.ping();
    });

    return Promise.all(healthCheckTasks).then(() => {
      this.healthyServers = this.servers.filter(
        (server) => server.getServerStatus() === EServerStatus.HEALTHY
      );
    });
  };

  public startHealthCheck = () => {
    setInterval(async () => {
      this.performHealthCheck();
    }, 5000);
  };
}
