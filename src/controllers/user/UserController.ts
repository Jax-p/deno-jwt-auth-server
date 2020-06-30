import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { Where } from "https://deno.land/x/dso@v1.0.0/mod.ts";
import nanoid from "https://deno.land/x/nanoid/mod.ts";
import { ModelFields } from "https://deno.land/x/dso@v1.0.0/mod.ts";
import { UserModel, userModel } from "./UserModel.ts";
import { makeJwt,  setExpiration,  Jose,  Payload } from "https://deno.land/x/djwt/create.ts";
import { IUser } from "./IUser.ts";
import {jwtConfig} from "../config/config.ts";

export class UserController {

  /**
   * Password is being hashed during this function
   * @param values
   */
  create = async(values: IUser): Promise<number|undefined> => {
    const password: string = this.hashPassword(values.password);
    const user: IUser = {
      ...values,
      hash: nanoid(),
      password,
    };
    const id = await userModel.insert(user);
    return id;
  }

  /**
   * Update user by `id`. Requires whole IUser values.
   * @param id
   * @param values
   */
  async update(id: number, values: object): Promise<ModelFields<UserModel>|undefined> {
    const user = this.get(id);
    if (user === undefined) throw 'User not found';
    await userModel.update(values,Where.from({ id:id }))
    return user;
  }

  /**
   * Update user by `id`. Requires whole IUser values.
   * @param id
   * @param values
   */
  delete = async(id: number): Promise<boolean> =>
    !! await userModel.delete(Where.from({ id:id }))

  /**
   * Fetch one row by `id` column
   * @param id
   */
  get = (id: number): Promise<ModelFields<UserModel>|undefined> =>
     userModel.findOne(Where.from({ id:id }));

  /**
   * Fetch one row by `hash` column
   * @param hash
   */
  getByHash = (hash: string): Promise<ModelFields<UserModel>|undefined> =>
     userModel.findOne(Where.from({ hash:hash }));

  /**
   * Main function of auth server
   * @param username
   * @param password
   * @param namespace
   */
  async authenticate(username: string, password: string, namespace?: string): Promise<string|false> {
    const user = await userModel.findOne(Where.from({ username: username, namespace: namespace }));
    if (user === undefined) return false;
    if (user.hash === undefined) return false;
    if (user.password === undefined) return false;
    if (!(bcrypt.compareSync(password, user.password))) return false;
    return this.generateJwt(user.hash);
  }

  /**
   * Synchronised hash input string with bcrypt
   * @param password
   */
  hashPassword = (password: string): string =>
     bcrypt.hashSync(password, bcrypt.genSaltSync(8));

  /**
   * Generates JSON web token with `id` and `exp` (expiration) in Payload
   * @param hash
   */
  generateJwt(hash: string): string {
    const payload: Payload = {hash, exp: setExpiration(new Date().getTime() + jwtConfig.expirationTime)};
    const header: Jose = {
      alg: jwtConfig.alg as Jose["alg"],
      typ: jwtConfig.type,
    };
    return makeJwt({ header, payload, key: jwtConfig.secretKey });
  }
}
