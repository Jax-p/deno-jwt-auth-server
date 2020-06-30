import Ask from 'https://deno.land/x/ask/mod.ts';
import { UserController } from "../controllers/user/UserController.ts";
import { validateUserHash } from "./askValidation.ts";

/**
 * Prompt wizard for user password change.
 * Asks for user hash and new password. Hashes password before insert
 */
const updateUserPassword = (controller: UserController) => async() => {
    const ask = new Ask();
    const data = await ask.prompt([
        {name: 'hash', type: 'input', message: 'User hash:', validate: validateUserHash(controller)},
        {name: 'password', type: 'input', message: 'New password:'},
    ]);
    const user = await controller.getByHash(data.hash);
    if (user === undefined || !user.id) throw `User with name ${data.name} doesn't exist.`;
    await controller.update(user.id,{password:controller.hashPassword(data.password)});
    console.info("User password has been updated.");
}

export default updateUserPassword;