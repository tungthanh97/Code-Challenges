import { Server } from 'http';
import express from 'express';

export interface IBackendServer {
  getServer: () => Server;
  getServerUrl: () => string;
  close: () => Server;
}

export class BackendServer implements IBackendServer {
  private server: Server;
  private port: number;

  constructor(port: number) {
    this.port = port;
    const hostname = 'localhost';
    const router = express.Router({});

    const app = express();

    router.get('/ping', async (_req, res, _next) => {
      try {
        console.log('Received ping request', this.port);
        res.send('OK');
      } catch (error) {
        res.status(503).send();
      }
    });

    router.get('/', async (req, res) => {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate async operation with 5-second delay
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(`Hello, Iam BE server on port ${this.port}!\n`);
    });

    app.use('/', router);

    const server = app.listen(this.port, () => {
      console.log(`Server is running at http://${hostname}:${this.port}/`);
    });

    this.server = server;
  }

  public getServer = () => {
    return this.server;
  };

  public getServerUrl = () => {
    return `http://localhost:${this.port}`;
  };

  public close = () => {
    return this.server.close();
  };
}
