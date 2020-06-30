import Ask from 'https://deno.land/x/ask/mod.ts';
import { UserController } from "../controllers/user/UserController.ts";
import { validateUserHash } from "./askValidation.ts";

/**
 * Asks for user hash and new password. Hashes password before insert
 */
const deleteUser = (controller: UserController) => async() => {
    const ask = new Ask();
    const data = await ask.prompt([
        {name: 'hash', type: 'input', message: 'User hash:', validate: validateUserHash(controller)},
    ]);
    const user = await controller.getByHash(data.hash);
    if (user === undefined || !user.id) throw `User with name ${data.name} doesn't exist.`;
    await controller.delete(user.id);
    console.info("User has been deleted.");
}

export default deleteUser;