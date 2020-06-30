import { dso } from "https://deno.land/x/dso@v1.0.0/mod.ts";
import { ClientConfig } from "https://deno.land/x/mysql@2.1.0/mod.ts";

/**
 * Connects MySQL database.
 * @caution Drops and recreates whole database If @param sync is true!
 * @param config
 * @param sync
 */
export const connectMySQL = async(config: ClientConfig, sync = false): Promise<void> => {
    await dso.connect(config);
    await dso.sync(sync);
}

export const disconnectMySQL = async(): Promise<void> => {
    await dso.close();
}