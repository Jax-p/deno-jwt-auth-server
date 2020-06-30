/**
 * Walkaround
 * interfaces are not available in runtime
 * @substitution IConfigJWT, ClientConfig, IConfigServer
 */
export const requiredValues: {[index: string]: {[index: string]:any} } = {
    jwtConfig: {
        header: "string",
        schema: "string",
        secretKey: "string",
        expirationTime: "number",
        type: "string",
        alg: "string"
    },
    mysqlConfig: {
        hostname: "string",
        port: "number",
        username: "string",
        password: "string",
        db: "string",
    },
    serverConfig: {
        hostname: "string",
        port: "number"
    }
};

/**
 * Check if object has all necessary values with right type
 * @param requiredProperties
 * @param configObj
 * @param name
 */
export const validateConfig = (
    requiredProperties: {[index: string]:any},
    configObj: {[index: string]:any},
    name: string = "unknown"
) => {
    for (const key in requiredProperties) {
        if (!configObj.hasOwnProperty(key))
            throw `Key "${key}" not found in configuration ${name}.`;
        if (typeof configObj[key] !== requiredProperties[key])
            throw `Key "${key}" is not type of ${requiredProperties[key]} in configuration ${name}.`;
    }
}