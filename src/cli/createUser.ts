import { Where } from "https://deno.land/x/dso@v1.0.0/mod.ts";
import Ask from 'https://deno.land/x/ask/mod.ts';
import {UserController} from "../controllers/user/UserController.ts";
import { userModel } from "../controllers/user/UserModel.ts";

/**
 * Check if user with `username` and `namespace` exists
 * @param username
 * @param namespace
 */
const canCreateUser=async(username:string, namespace:string)=> {
    const user = await userModel.findOne(Where.from({username:username, namespace:namespace}));
    if (user === undefined) return true;
    console.info(`User with username "${username}" in namespace "${namespace}" already exists.`);
    return false;
}

/**
 * Prompt wizard for user creation
 */
const createUser = (controller: UserController) => async() => {
    const ask = new Ask();
    const userData = await ask.prompt([
        {name: 'username', type: 'input', message: 'Username:'},
        {name: 'namespace', type: 'input', message: 'Namespace:'},
        {name: 'password', type: 'input', message: 'Password:'}
    ]);
    if (!(await canCreateUser(userData.username,userData.domain)))
        return;
    await controller.create({
        username: userData.username,
        password: userData.password,
        namespace: userData.namespace
    });
    console.info(`Created user "${userData.username}" in namespace ${userData.namespace}.`);
}

export default createUser;