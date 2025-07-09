import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware";

const authRouter: Router = Router();

authRouter.post("/register", AuthController.register);
authRouter.post("/login", AuthController.login);
authRouter.get("/me", authMiddleware.authenticate, AuthController.currentUser);
authRouter.post("/refresh", AuthController.refresh);
authRouter.post("/logout", AuthController.logout);

export default authRouter;
