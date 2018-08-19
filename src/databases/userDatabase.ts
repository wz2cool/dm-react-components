import { Dexie } from "Dexie";
import { User } from "../examples/model/user";
export class UserDatabase extends Dexie {
  public users!: Dexie.Table<User, number>;

  constructor() {
    super("UserDatabase");
    this.version(1).stores({
      users: `
      &id,
      avatar,
      county,
      email,
      title,
      firstName,
      lastName,
      street,
      zipCode,
      date,
      bs,
      catchPhrase,
      companyName,
      words,
      sentence`,
    });
  }
}
