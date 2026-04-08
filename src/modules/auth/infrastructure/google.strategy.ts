import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';

export interface GoogleUser {
  email: string;
  name: string;
  provider: string;
  providerAccountId: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_SECRET_CLIENT || '',
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<GoogleUser> {
    const email = profile.emails?.[0]?.value || '';
    const displayName = profile.displayName || '';

    return {
      email,
      name: displayName,
      provider: 'google',
      providerAccountId: profile.id,
    };
  }
}
