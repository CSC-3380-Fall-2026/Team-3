import {Router} from "express";
const router = Router();

router.get("/test", (req, res) => {
  console.log("Test request received");

  res.status(200).json({
    message: "Backend is running"
  });
});

export default router;
