import bcrypt from "bcryptjs";

class Password {
  /**
   * Hash a plain text password.
   * @param password - original password string
   */
  public static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Compare a plain text password against a hashed value.
   * @param password - plain text candidate
   * @param userPassword - hashed password stored in database
   */
  public static async comparePassword(
    password: string,
    userPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, userPassword);
  }
}

export default Password;