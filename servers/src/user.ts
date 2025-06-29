import bcrypt from "bcryptjs";
import { User } from "./models/interfaces/user.model";

const users: User[] = [
  { id: 1, username: "admin", password: bcrypt.hashSync("admin123", 10) },
  { id: 2, username: "user", password: bcrypt.hashSync("user123", 10) },
];

// Tìm user theo username
export const findUserByUsername = (username: string): User | undefined => {
  return users.find((user) => user.username === username);
};
