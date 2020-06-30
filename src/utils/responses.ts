import { Status, Context } from "https://deno.land/x/oak/mod.ts";

const responseNotImplemented = (ctx: Context<any>) => {
    ctx.response.status = Status.NotImplemented;
    ctx.response.body = { message: "Method not implemented" };
    return;
}

const responseBadRequest = (ctx: Context<any>, msg?: string) => {
    ctx.response.status = Status.BadRequest;
    ctx.response.body = { message: msg || "Bad request" };
    return;
}

export { responseNotImplemented, responseBadRequest }