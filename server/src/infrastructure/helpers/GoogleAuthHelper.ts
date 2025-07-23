import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(); // opsiyonel olarak clientId alabilir

export interface GoogleTokenPayload {
  email: string;
  email_verified: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  sub: string; // unique Google user ID
}

export class GoogleAuthHelper {
  static async verifyIdToken(idToken: string): Promise<GoogleTokenPayload> {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID, // .env içinde tanımlı olmalı
    }).catch((error) => {
      throw new Error(`Google token verification failed: ${error.message}`);
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email_verified) {
      throw new Error("Google token verification failed or email not verified.");
    }

    return {
      email: payload.email!,
      email_verified: payload.email_verified,
      name: payload.name,
      given_name: payload.given_name,
      family_name: payload.family_name,
      picture: payload.picture,
      sub: payload.sub,
    };
  }
}
