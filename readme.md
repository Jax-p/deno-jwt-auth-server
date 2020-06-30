# JWT Auth server
[![Build Status](https://travis-ci.com/Jax-p/deno-jwt-auth-server.svg?branch=master)](https://travis-ci.com/Jax-p/deno-jwt-auth-server)   

Starter JWT Auth server written in TypeScript with Deno. Doesn't provide API solution. Used only as a user authenticator and JWT generator.

## Usage
Use `POST` with route `/auth`.  

### Example:
Query: 
```
localhost:3001/auth
```
Body:
```
{
   "username": "some name",
   "namespace": "some namespace",
   "password": "some password"
}
```
Response in JSON

| property      | content    | description  
| :---          |:---  |:---
| `message`   | `string` | Invalid credentials
| `jwt`  | `token` | Your valid token

## Built version
### Server
To run built version of auth server copy and run command above. The need of flags is written in SRC section.
```
deno run ---allow-read=config.json --allow-net=127.0.0.1 build/server.bundle.js 
```
### CLI
```
deno run ---allow-read=config.json --allow-net=127.0.0.1 build/cli.bundle.js -m createUser
```

-----

## SRC
Used for development
### Server
```
deno run ---allow-read=config.json --allow-net=127.0.0.1 -c src/tsconfig.json src/server.ts
```
#### Flags
| flag          | description      
| :---          |:---
| `allow-net`   | MySQL connection, http server
| `allow-read`  | config load

#### Bundle
```
deno bundle src/server.ts build/server.bundle.js -c src/tsconfig.json --unstable
```

### CLI
Possibility to _create user_, _delete user_ and _change user password_ in CLI from file `cli.ts`. Argument `-m` (method) is required.

| method        |
| :---          |
| `createUser`  | 
| `deleteUser`  | 
| `updateUserPassword`  | 

```
deno run --allow-net=127.0.0.1 --allow-read=config.json -c src/tsconfig.json src/cli.ts -m createUser
```
#### Flags
| flag          | description      
| :---          |:---
| `allow-net`   | used for MySQL connection

#### TypeScript configuration
| parameter     | description      
| :---          |:---
| `experimentalDecorators`   | needed by [/x/dso](https://deno.land/x/dso/) ORM

#### Build bundle
```
deno bundle src/cli.ts build/cli.bundle.js -c src/tsconfig.json --unstable
```

-----

## Test
**Carefuly!** This recreates and clears whole database!
```
deno test src/tests/auth.test.ts --allow-net=127.0.0.1 --allow-read=config.json -c src/tsconfig.json
```