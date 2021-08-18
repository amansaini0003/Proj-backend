var express = require("express");
const { check, validationResult } = require("express-validator");
var router = express.Router();
const { signout, signup, signin } = require("../controllers/auth");

router.post(
  "/signup",
  [
    check("name")
      .isLength({ min: 3 })
      .withMessage("name must be atleast 3 chars long"),
    check("email").isEmail().withMessage("email is required"),
    check("password")
      .isLength({ min: 8 })
      .withMessage("password must be atleast 8 chars long"),
  ],
  signup
);

router.post(
  "/signin",
  [
    check("email").isEmail().withMessage("email is required"),
    check("password")
      .isLength({ min: 8 })
      .withMessage("password field is required")
      .isLength({ min: 3 }),
  ],
  signin
);

router.get("/signout", signout);

module.exports = router;
