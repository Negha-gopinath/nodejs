// server.js

const express = require('express');
const bodyParser = require('body-parser');
const { connect } = require('./database/server');
const db = require("./models");
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const app = express();
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
connect();

db.sequelize.sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });


// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome !" });
});
app.post('/signup', [
  body('username').not().isEmpty(),
  body('email').not().isEmpty().isEmail(),
  body('password').isLength({ min: 5 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const userExists = await db.User.findOne({
    where: {email}
});
if (userExists) {
    return res.status(400).send('Email is already associated with an account');
}
  try {
    const user = await db.User.create({ username, email,password: hashedPassword });
    res.status(201).send('User created successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// User Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await db.User.findOne({ where: { email } });
  if (!user) {
    return res.status(404).send('User not found');
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).send('Password incorrect');
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  // Save the token in the database
  user.token = token;
  await user.save();

  res.json({ message: "Login successful", token });
});

require("./routes/index")(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
