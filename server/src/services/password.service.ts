import bcrypt from "bcryptjs";

class Password {

  public static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  public static async comparePassword(
    password: string,
    userPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, userPassword);
  }
}

export default Password;