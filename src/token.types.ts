export type TokenRaw = string;

export type TokenPayload = {
  aud: string; // requested audience
  azp: string; // usually id of service account used
  email: string; // usually service acc email;
  email_verified: true; // always true
  exp: number; // expires at
  iat: number; // issued at
  iss: 'https://accounts.google.com'; // issuer
  sub: string; // usually id of service account used
};

export type Token = {
  raw: TokenRaw;
  payload: TokenPayload;
};

export type TokenCache = {
  fetchTokenStatus: 'pending' | 'rejected' | 'fulfilled';
  promise: Promise<Token>;
};
