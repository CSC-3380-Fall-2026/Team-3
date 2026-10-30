import {Router} from "express";
import db from '../database';
const router = Router();

router.get("/test", (req, res) => {
  console.log("Test request received");

  res.status(200).json({
    message: "Backend is running",
  });
});

router.get('/teams', (req,res) =>{
  const teams = db.prepare('SELECT * FROM teams').all();
  res.json(teams);
    }

)

export default router;
