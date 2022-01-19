# google-sa-id-token

[![Deploy](https://github.com/mdovhopo/google-sa-id-token/workflows/build/badge.svg)](https://github.com/mdovhopo/google-sa-id-token/actions)
[![Coverage Status](https://coveralls.io/repos/github/mdovhopo/google-sa-id-token/badge.svg?branch=master)](https://coveralls.io/github/mdovhopo/google-sa-id-token?branch=master)

Fetch ID Token for Service Account when running in GCloud. Lib also caches
tokens & auto-refreshes, to improve performance. 

By default, tokens will expire `2s` earlier that actuall expiry date,
to prevent usage of almost expired token. This behaviour can be changed via options.

## Installation:

```sh
npm i google-sa-id-token
```

## Usage

### Get an id Token for default identity (Application Default Credentials)
```typescript
import { GoogleSaIdToken } from 'google-sa-id-token';

const client = new GoogleSaIdToken();
const token = await client.fetchIdToken(aud);

console.log(token); 
// example output 
// eyJhbGciOiJSUzI1NiIsImtpZCI6IjAxNWFkMDYwZDJiNDQ1MzU5YzliMTA1ZjgwM2RjNzU4YzI5ZjE5ODJkNjFhMWU0ZjFmZGM4ZjBiN2UyNjVjYzQxZTIwMDVlMjM1YzIxMTQ1IiwidHlwIjoiSldUIn0.eyJhdWQiOiJkZWZhdWx0IiwiYXpwIjoiPGV4YW1wbGUtc2VydmljZS1hY2NvdW50LWlkPiIsImVtYWlsIjoiZXhhbXBsZUBwcm9qZWN0LWlkLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImV4cCI6MTY0MjYzMTI0Mzg2MCwiaWF0IjoxNjQyNjI3NjQzODYwLCJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJzdWIiOiI8ZXhhbXBsZS1zZXJ2aWNlLWFjY291bnQtaWQ-In0.+UpJvARVRn6ESlEr+Gyk4VA+QJV6QzqQP1E7gY2u5D3oKgjBzhlWcxmihDCCO3BFnACes4sMG+VXXqmuQW/pjw==
```

### Add decoded token to response
```typescript
import { GoogleSaIdToken } from 'google-sa-id-token';

const client = new GoogleSaIdToken();
const token = await client.fetchIdToken(aud, { withDecoded: true });

console.log(token); 
// example output
// {
//  raw: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjAxNWFkMDYwZDJiNDQ1MzU5YzliMTA1ZjgwM2RjNzU4YzI5ZjE5ODJkNjFhMWU0ZjFmZGM4ZjBiN2UyNjVjYzQxZTIwMDVlMjM1YzIxMTQ1IiwidHlwIjoiSldUIn0.eyJhdWQiOiJkZWZhdWx0IiwiYXpwIjoiPGV4YW1wbGUtc2VydmljZS1hY2NvdW50LWlkPiIsImVtYWlsIjoiZXhhbXBsZUBwcm9qZWN0LWlkLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImV4cCI6MTY0MjYzMTI0Mzg2MCwiaWF0IjoxNjQyNjI3NjQzODYwLCJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJzdWIiOiI8ZXhhbXBsZS1zZXJ2aWNlLWFjY291bnQtaWQ-In0.+UpJvARVRn6ESlEr+Gyk4VA+QJV6QzqQP1E7gY2u5D3oKgjBzhlWcxmihDCCO3BFnACes4sMG+VXXqmuQW/pjw==",
//  payload: {
//     aud: 'default',
//     azp: '<example-service-account-id>',
//     email: 'example@project-id.iam.gserviceaccount.com',
//     email_verified: true,
//     exp: 1642631243860,
//     iat: 1642627643860,
//     iss: 'https://accounts.google.com',
//     sub: '<example-service-account-id>'
//   }
// }
```

### Fetch token, ignoring cache.

```typescript
import { GoogleSaIdToken } from 'google-sa-id-token';

const client = new GoogleSaIdToken();
const token = await client.fetchIdTokenNoCache(aud);
console.log(token);
// example output
// {
//   raw: ".......", 
//   payload: {
//     ...
//   }
// }

```

### Use different service account

```typescript
import { GoogleSaIdToken } from 'google-sa-id-token';

const client = new GoogleSaIdToken({ serviceAccountEmail: 'example@project-id.iam.iam.gserviceaccount.com' });
const token = await client.fetchIdTokenNoCache(aud);

```

### Set custom expiry margin for tokens

```typescript
import { GoogleSaIdToken } from 'google-sa-id-token';

const client = new GoogleSaIdToken({ tokenExpiryMargin: 10000 /* 10 seconds */ });
const token = await client.fetchIdTokenNoCache(aud);

```

### Utils usage, provided by lib

```typescript
import { GoogleSaIdToken, decodeSaToken } from 'google-sa-id-token';

const client = new GoogleSaIdToken({ tokenExpiryMargin: 10000 /* 10 seconds */ });
const token = await client.fetchIdTokenNoCache(aud);

// utils
const decoded = decodeSaToken(token);
const sampleToken = generateExampleSaToken({ aud: 'override' });
```


Bootstrapped with: [create-ts-lib-gh](https://github.com/glebbash/create-ts-lib-gh)

This project is [MIT Licensed](LICENSE).
