import { UserDatabase } from "../databases/userDatabase";
import { User } from "../examples/model/user";

export class UserMapper {
  private readonly db: UserDatabase;
  constructor() {
    this.db = new UserDatabase();
  }

  public bulkPut(users: User[]): Promise<void> {
    return this.db.transaction("rw", this.db.users, async () => {
      await this.db.users.bulkPut(users);
    });
  }
}
