import { ClientConfig } from "https://deno.land/x/mysql@2.1.0/mod.ts";
import { requiredValues, validateConfig } from "./validation.ts";
import { IConfig, IConfigJWT, IConfigServer } from "./IConfig.ts";

/** Load config.json file and parse it */
const decoder = new TextDecoder("utf-8");
const content = decoder.decode(Deno.readFileSync("./config.json"));
const config : IConfig = JSON.parse(content);

/**
 * validate values through requiredValues variable
 * because interfaces are not available in runtime
 */
for (const [key, configSection] of Object.entries(config))
    validateConfig(requiredValues[key],configSection,key);

/** assing and export */
export const serverConfig: IConfigServer = config.serverConfig as IConfigServer;
export const mysqlConfig: ClientConfig = config.mysqlConfig as ClientConfig;
export const jwtConfig: IConfigJWT = config.jwtConfig as IConfigJWT;