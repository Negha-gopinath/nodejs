const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { body } = require('express-validator');

module.exports = app => {
    const users = require("../controllers/index");

    var router = require("express").Router();

    router.post('/signup', [
      body('email').isString().trim().notEmpty(),
      body('password').isLength({ min: 5 })
    ], users.signup);

    router.post('/login', [
      body('email').isString().trim().notEmpty(),
      body('password').exists()
    ], users.login);

    // Create a new User
    router.post("/", [
      body('email').isString().trim().notEmpty(),
      body('username').isString().trim().notEmpty(),
      body('password').isString().notEmpty()
    ],authMiddleware,users.create);

    // Retrieve all Users
    router.get("/", authMiddleware,users.findAll);

    // Retrieve a single User with id
    router.get("/:id", authMiddleware,users.findOne);

    // Update a User with id
    router.put("/:id",[
      body('email').isString().trim().notEmpty(),
      body('username').isString().trim().notEmpty(),
      body('password').isString().notEmpty()
    ], authMiddleware,users.update);

    // Delete a User with id
    router.delete("/:id", authMiddleware,users.delete);

    // Delete all Users
    router.delete("/", authMiddleware,users.deleteAll);

    app.use("/api/users", router);
  };

