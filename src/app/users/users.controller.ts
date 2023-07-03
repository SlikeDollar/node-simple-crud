import http from 'http';
import { RequestMethod } from '../core/enums/request-method.enum';
import { UsersService } from './users.service';
import { HttpStatus } from '../core/enums/http-status.enum';
import { User } from './interfaces/user.interface';
import crypto from 'crypto';

export class UsersController {
  public readonly usersDefaultPath = '/api/users';

  private usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();
  }

  public async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    if (req.method === RequestMethod.GET) {
      //TODO: Find a better way to check this
      if (req.url?.split('/').length === 4) {
        const uuid = this.parseUUID(req);
        uuid ? this.getUser(res, uuid) : this.sendResponse(res, HttpStatus.BAD_REQUEST);
        return;
      }

      this.getAllUsers(res);
    }

    if (req.method === RequestMethod.POST) {
      this.postUser(res, await this.parseBody(req));
    }

    if (req.method === RequestMethod.PUT) {
      const uuid = this.parseUUID(req);
      uuid ?
        this.putUser(res, uuid, await this.parseBody(req))
        : this.sendResponse(res, HttpStatus.BAD_REQUEST);
    }

    if (req.method === RequestMethod.DELETE) {
      const uuid = this.parseUUID(req);
      uuid ? this.deleteUser(res, uuid) : this.sendResponse(res, HttpStatus.BAD_REQUEST);
    }
  }

  private getAllUsers(res: http.ServerResponse): void {
    this.sendResponse(res, HttpStatus.OK, this.usersService.getUsersJSON());
  }

  private getUser(res: http.ServerResponse, uuid: string): void {
    if (!this.validateUUID(uuid)) {
      this.sendResponse(res, HttpStatus.BAD_REQUEST);
      return;
    }

    const user = this.usersService.findUser(uuid);
    user
      ? this.sendResponse(res, HttpStatus.OK, user)
      : this.sendResponse(res, HttpStatus.NOT_FOUND, 'Not Found');
  }

  private postUser(res: http.ServerResponse, user: User): void {
    if (!this.validateUser(user)) {
      this.sendResponse(
        res,
        HttpStatus.BAD_REQUEST,
        'user does not contain required fields'
      );
      return;
    }

    user.id = this.generateUUID();
    this.usersService.pushUser(user);
    this.sendResponse(res, HttpStatus.CREATED, user);
  }

  private putUser(res: http.ServerResponse, uuid: string, user: User): void {
    if (!this.validateUUID(uuid)) {
      this.sendResponse(res, HttpStatus.BAD_REQUEST, 'Not a valid UUID');
      return;
    }

    if (!this.validateUser(user)) {
      this.sendResponse(
        res,
        HttpStatus.BAD_REQUEST,
        "User doesn't have required fields"
      );
      return;
    }

    const userIndex = this.usersService.findUserIndex(uuid);
    if (userIndex === -1) {
      this.sendResponse(res, HttpStatus.NOT_FOUND, 'user is not found');
      return;
    }

    user.id = this.usersService.getUser(userIndex).id;
    this.usersService.setUser(userIndex, user);
    this.sendResponse(res, HttpStatus.OK, user);
  }

  private deleteUser(res: http.ServerResponse, uuid: string): void {
    if (!this.validateUUID(uuid)) {
      this.sendResponse(res, HttpStatus.BAD_REQUEST, "not a valid UUID");
      return;
    }

    if (!this.usersService.findUser(uuid)) {
      this.sendResponse(res, HttpStatus.NOT_FOUND, 'user not found');
      return;
    }

    this.usersService.deleteUser(uuid);
    this.sendResponse(res, HttpStatus.NO_CONTENT);
  }

  private sendResponse(
    res: http.ServerResponse,
    statusCode: HttpStatus,
    data?: unknown
  ): void {
    res.writeHead(statusCode);
    res.end(JSON.stringify(data));
  }

  private validateUUID(uuid: string): boolean {
    return /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gm.test(
      uuid
    );
  }

  private validateUser(user: User): boolean {
    return 'age' in user && 'hobbies' in user && 'username' in user;
  }

  private generateUUID(): string {
    return crypto.randomUUID();
  }

  private parseBody<T>(req: http.IncomingMessage): Promise<T> {
    return new Promise((resolve) => {
      const chunks: Uint8Array[] = [];

      req.on("data", (chunk) => {
        chunks.push(chunk);
      });

      req.on("end", () => {
        resolve(JSON.parse(Buffer.concat(chunks).toString()));
      });
    });
  }

  private parseUUID(req: http.IncomingMessage): string | undefined {
    return req.url?.split('/').at(-1);
  }
}
