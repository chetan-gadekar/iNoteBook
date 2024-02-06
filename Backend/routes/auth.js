const express = require("express");
const User = require("../Models/User"); // importing the user model in auth
const router = express.Router();
const { body, validationResult } = require("express-validator"); //it used for authentication
const bcrypt = require("bcryptjs"); //it used for password hashing and salting
var jwt = require("jsonwebtoken"); //it is used for more security
var fetchuser = require("../middleware/fetchuser"); //it is used to convert token into original data

const JWT_SECRET = "chetanisagoodboy";

// Route 1 Create a user using post "/api/auth/createuser". No login required

router.post(
  "/createuser",
  [
    body("email", "Enter the valid name").isEmail(),
    body("name", "Enter the valid email").isLength({ min: 2 }),
    body("password", "Password atleast 5 character").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    try {
      // check for user email already present or not
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "sorry a user with this email already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      secPass = await bcrypt.hash(req.body.password, salt); //we make it await beacuse it return promise
      //Create new user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);

      res.json({ authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error");
    }
  }
);

//Route 2: Authenicate a user using :post "/api/auth/login". no login required
router.post("/login", async (req, res) => {
  // if there are error then return bad request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ error: "Please try to login with correct credentials" });
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res
        .status(400)
        .json({ error: "Please try to login with correct credentials" });
    }

    const data = {
      user: {
        id: user.id,
      },
    };
    const authToken = jwt.sign(data, JWT_SECRET);
    res.json({ authToken });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Route 3: Get login user details using :post "/api/auth/getuser". login required
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});
module.exports = router;
