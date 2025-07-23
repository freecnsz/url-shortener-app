export interface OAuthLoginDto {
  accessToken: string;
}

export interface OAuthLoginResponseDto {
  user: {
    email: string;
    username?: string;
  };
  accessToken: string;
  refreshToken?: string;
}
