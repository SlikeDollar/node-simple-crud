import http from 'http';
import { UsersModule } from './users/users.module';

export class App {
  private server = this.createServer();
  private usersModule = new UsersModule();
  private usersController = this.usersModule.usersController;
  private defaultPort = 4000;

  constructor() {
    this.listen(Number(process.env.PORT ?? this.defaultPort));
  }

  private createServer() {
    return http.createServer(
      async (req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
        if (req.url?.toString().startsWith(this.usersController.usersDefaultPath)) {
          await this.usersController.handleRequest(req, res);
          return;
        }
        res.writeHead(400);
        res.end();
      },
    );
  }

  private listen(port: number) {
    this.server.listen(port);
    console.log('server is listening');
  }
}
