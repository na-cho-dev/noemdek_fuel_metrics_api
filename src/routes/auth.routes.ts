import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware";

const authRouter: Router = Router();

// Register route
authRouter.post("/register", AuthController.register);

// Login route
authRouter.post("/login", AuthController.login);

// Current user route
authRouter.get("/me", authMiddleware.authenticate, AuthController.currentUser);

// Refresh token route
authRouter.post("/refresh", AuthController.refresh);

// Logout route
authRouter.post("/logout", AuthController.logout);

export default authRouter;
