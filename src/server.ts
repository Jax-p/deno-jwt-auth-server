import { readJsonSync } from "https://deno.land/std/fs/mod.ts";
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { connectMySQL } from "./controllers/database/database.ts";
import authRoutes from "./routers/authRouter.ts";
import { responseNotImplemented } from "./utils/responses.ts";
import requestLogger from "./utils/requestLogger.ts";
import requestProfiler from "./utils/requestProfiler.ts";
import {mysqlConfig, serverConfig} from "./controllers/config/config.ts";

const app = new Application();

/** http server info */
app.use(requestProfiler);
app.use(requestLogger);

/** routing */
const userRoutes = authRoutes(new Router());
app.use(userRoutes.routes());
app.use(userRoutes.allowedMethods());

/** fallback, no route found */
app.use(responseNotImplemented);

await connectMySQL(mysqlConfig);
console.info(`JWT provider started ${serverConfig.hostname}:${serverConfig.port}`);
await app.listen(`${serverConfig.hostname}:${serverConfig.port}`);
