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

  public async getUser(): Promise<User[]> {
    let users: User[] = [];
    await this.db.transaction("r", this.db.users, async () => {
      users = await this.db.users
        .filter(user => {
          if (user.companyName) {
            return user.id > 3000;
          } else {
            return false;
          }
        })
        .limit(100)
        .toArray();
    });
    return new Promise<User[]>((resolve, reject) => resolve(users));
  }
}
