import { parse } from "https://deno.land/std/flags/mod.ts";
import createUser from "./cli/createUser.ts";
import updateUserPassword from "./cli/updateUserPassword.ts";
import { connectMySQL } from "./controllers/database/database.ts";
import { UserController } from "./controllers/user/UserController.ts";
import deleteUser from "./cli/deleteUser.ts";
import { mysqlConfig } from "./controllers/config/config.ts";

const args = parse(Deno.args);
const methods: { [key: string]: Function } = {
    "createUser": createUser,
    "updateUserPassword": updateUserPassword,
    "deleteUser": deleteUser
}

/**
 * Processes command line arguments
 */
const processArgs = async (): Promise<void> =>{
    if (!args.m)  throw `Method arg -m is required`
    const methodName: keyof typeof methods = args.m;
    const methodFromArgs: Function = methods[methodName];
    if (!methodFromArgs) throw `Unknown method "${methodName}"`
    await connectMySQL(mysqlConfig);
    const controller = new UserController();
    await methodFromArgs(controller)();
}

try {
    processArgs()
        .then(()=>console.info("Finished successfully."))
        .catch((err)=>console.info("Finished with error: ",err));
} catch (err) {
    console.error(`Something is wrong: ${err}`);
}