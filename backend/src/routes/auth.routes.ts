import {Router} from 'express'
import {login,logout,endUserSignup,systemUserSignup} from '../controllers/auth.controller'
const router = Router();

router.post("/login",login);
router.post("/logout", logout);
router.post("/signup/end-user", endUserSignup);
router.post("/signup/system-user", systemUserSignup);

// router.put("/change-password", authController.changePassword);

export default router;