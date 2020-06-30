import { BaseModel, Defaults, dso, Field, FieldType, Model } from "https://deno.land/x/dso@v1.0.0/mod.ts";

@Model("users")
class UserModel extends BaseModel {

    get modelFields() {
        return (Reflect.getMetadata("model:fields", this) || []);
    }

    @Field({type: FieldType.INT, primary: true, length: 11, autoIncrement: true})
    id!: number;

    @Field({ type: FieldType.STRING, length: 26, notNull: true })
    hash!: string;

    @Field({ type: FieldType.STRING, length: 80, notNull: true })
    username!: string;
    
    @Field({ type: FieldType.STRING, length: 80, notNull: true })
    password!: string;

    @Field({ type: FieldType.STRING, length: 80 })
    namespace?: string;

    @Field({ type: FieldType.DATE, default: Defaults.CURRENT_TIMESTAMP })
    created!: string;

    @Field({ type: FieldType.DATE, default: Defaults.CURRENT_TIMESTAMP, autoUpdate: true })
    updated!: string;
}

const userModel = dso.define(UserModel);
export { UserModel, userModel };