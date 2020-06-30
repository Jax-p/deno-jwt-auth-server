import { Context } from "https://deno.land/x/oak/mod.ts";

const requestProfiler = async (ctx: Context, next: () => Promise<void>) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.info(`${ms}ms`);
}

export default requestProfiler