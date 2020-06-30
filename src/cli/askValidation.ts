import { UserController } from "../controllers/user/UserController.ts";

/**
 * Check if user with hash exists
 * @param controller
 */
const validateUserHash = (controller: UserController) => async (value: string): Promise<boolean> => {
    const user = !!await controller.getByHash(value);
    if (!user) console.info(`User with hash ${value} doesn't exist`)
    return !!await controller.getByHash(value)
}

export { validateUserHash }