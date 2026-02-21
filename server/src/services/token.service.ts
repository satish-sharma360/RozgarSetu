import jwt, { type JwtPayload } from "jsonwebtoken";

class Token {

  public static generateToken(payload: JwtPayload | object): string {
    const secret = process.env.ACCESS_TOKEN as string;
    const expires = process.env.ACCESS_TOKEN_EXPIRES as string;

    if (!secret) {
      throw new Error("ACCESS_TOKEN environment variable is not set");
    }
    if (!expires) {
      throw new Error("ACCESS_TOKEN_EXPIRES environment variable is not set");
    }
    return (jwt.sign as any)(payload, secret, { expiresIn: expires });
  }

  public static verifyToken(token: string): JwtPayload & { id: string; role: string } {
    const secret = process.env.ACCESS_TOKEN;
    if (!secret) {
      throw new Error("ACCESS_TOKEN environment variable is not set");
    }
    return jwt.verify(token, secret) as JwtPayload & { id: string; role: string };
  }
}

export default Token;