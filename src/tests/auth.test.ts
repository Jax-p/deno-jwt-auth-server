import { assertEquals, assertNotEquals } from "https://deno.land/std/testing/asserts.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { ModelFields } from "https://deno.land/x/dso@v1.0.0/mod.ts";
import {connectMySQL, disconnectMySQL} from "../controllers/database/database.ts";
import { UserController } from "../controllers/user/UserController.ts";
import { IUser } from "../controllers/user/IUser.ts";
import { UserModel } from "../controllers/user/UserModel.ts";
import { mysqlConfig } from "../controllers/config/config.ts";
import { Client } from "https://deno.land/x/mysql@2.1.0/mod.ts";
import { dso } from "https://deno.land/x/dso@v1.0.0/mod.ts";

/** fake user for test */
const tmpUser: IUser = {
    username: "tester",
    namespace: "test",
    password: "test"
}

const dbName = "deno_auth_test";
const prepareDatabase = async() => {
    const client = new Client();
    await client.connect(mysqlConfig);
    await client.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    await client.close();
    console.info("Test database prepared");
}

const destroyDatabase = async() => {
    const client = new Client();
    await client.connect(mysqlConfig);
    await client.execute(`DROP DATABASE ${dbName}`);
    await client.close();
    console.info("Test database dropped");
}

/** drops whole database! */
await prepareDatabase();
await connectMySQL({...mysqlConfig, db: dbName}, true);
const controller = new UserController();
let user: ModelFields<UserModel>|undefined;

Deno.test("create user", async () => {
    const userId: number|undefined = await controller.create(tmpUser);
    if (userId === undefined) throw "Return ID after insertion is undefined";
    user = await controller.get(userId);
    if (user === undefined) throw "Inserted user can't be selected from database";
    if (user.hash === undefined) throw "Return ID after insertion is undefined";
    assertEquals(user.username,tmpUser.username,"Compare inserted and selected username");
    assertEquals(user.namespace,tmpUser.namespace,"Compare inserted and selected namespace");
    if (user.password === undefined) throw "User fetched from DB without password"
    if (!(await bcrypt.compareSync(tmpUser.password, user.password))) throw "Inserted and selected password doesn't match"
});

Deno.test("authenticate user", async () => {
    assertNotEquals(await controller.authenticate(tmpUser.username, tmpUser.password, tmpUser.namespace),false);
});

Deno.test("delete user", async () => {
    if (user === undefined) throw "User is undefined."
    if (user.id === undefined) throw "User doesn't have id."
    const id = user.id;
    await controller.delete(user.id);
    user = await controller.get(id);
    assertEquals(user,undefined,"If user has been deleted from database");
    //await disconnectMySQL();
    await destroyDatabase();
});

