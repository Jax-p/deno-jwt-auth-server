export interface IConfig {
    serverConfig: object;
    mysqlConfig: object;
    jwtConfig: object;
}

export interface IConfigJWT {
    header: string,
    schema: string,
    secretKey: string,
    expirationTime: number,
    type: string,
    alg: string
}

export interface IConfigServer {
    hostname: string,
    port: number
}