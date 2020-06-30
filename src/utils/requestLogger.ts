import { Context } from "https://deno.land/x/oak/mod.ts";

const requestLogger = async (ctx: Context, next: () => Promise<void>) => {
    await next();
    console.log(ctx.request);
    console.info(`--> ${ctx.request.method} ${ctx.request.ips} ${ctx.request.url}`);
}

export default requestLogger