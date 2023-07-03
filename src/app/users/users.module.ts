import { UsersController } from "./users.controller";

export class UsersModule {
  public usersController: UsersController

  constructor() {
    this.usersController = new UsersController();
  }
}
