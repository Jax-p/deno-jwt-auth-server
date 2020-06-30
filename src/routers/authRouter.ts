import { Router, Status } from "https://deno.land/x/oak/mod.ts";
import { UserController } from "../controllers/user/UserController.ts";
import { responseBadRequest } from "../utils/responses.ts";

const controller = new UserController();

/**
 * All allowed routes for authentication
 * @param router
 */
const authRoutes = (router: Router) =>
  router
      .post("/auth", async (ctx) => {
          if (!ctx.request.hasBody) return responseBadRequest(ctx);
          const { value } = await ctx.request.body();
          const jwt = await controller.authenticate(value.username, value.password, value.namespace);
          if (!jwt) return responseBadRequest(ctx, "Invalid credentials");
          ctx.response.status = Status.OK;
          ctx.response.body = { jwt };
      })

export default authRoutes
