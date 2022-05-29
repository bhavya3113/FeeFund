const express = require("express");
const router = express.Router();
const {validationResult} = require("express-validator");

const donationController = require("../controllers/donation")

router.post("/makedonation",donationController.makedonation);
router.post("/verify",donationController.verify); 

module.exports=router; 



