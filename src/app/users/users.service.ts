import { User } from './interfaces/user.interface';

export class UsersService {
  private users: User[] = [
    {
      username: '10',
      age: 10,
      hobbies: [],
      id: '3250b66c-cf41-4df4-944c-d622abfb0bf6',
    },
  ];

  public getUser(index: number): User {
    return this.users[index];
  }

  public setUser(index: number, user: User): void {
    this.users[index] = user;
  }

  public getUsersJSON(): string {
    return JSON.stringify(this.users);
  }

  public findUser(uuid: string): User | undefined {
    return this.users.find((user: User) => user.id === uuid);
  }

  public findUserIndex(uuid: string): number {
    return this.users.findIndex((user: User) => user.id === uuid);
  }

  public pushUser(user: User): void {
    this.users.push(user);
  }

  public deleteUser(uuid: string): void {
    this.users = this.users.filter(user => user.id !== uuid);
  }
}
