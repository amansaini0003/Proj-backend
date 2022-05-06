var express = require("express");
const { check, validationResult } = require("express-validator");
var router = express.Router();
const { signout, signup, signin, isSignedIn } = require("../controllers/auth");

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
      .isLength({ min: 3 })
      .withMessage("password field is required"),
  ],
  signin
);

router.get("/signout", signout);

// router.get("/testroute", isSignedIn, (req, res) => {
//   res.json(req.auth);
// });

module.exports = router;
