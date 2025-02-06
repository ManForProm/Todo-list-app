import { body, param } from "express-validator";
import { errorMessages } from "../constants/strings.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import { validationWrapper } from "../utils/ValidationProvider.js";

//check decorators
export default class UserController {
  constructor(userService, validationProvider) {
    this._userService = userService;
    this._validationProvider = validationProvider;
  }

  getUsers = asyncWrapper(async (req, res) => {
    const users = await this._userService.getAllUsers();
    res.json(users);
  });

  getUserByName = asyncWrapper(async (req, res) => {
    const username = req.params.username;
    const response = async () => {
      const user = await this._userService.getUserByName(username);
      res.json(user);
    };
    console.log("Received userEmail:", username);
    validationWrapper(response, req, res);
  });

  createUser = asyncWrapper(async (req, res) => {
    const { username, email, password } = req.body;
    console.log("Received request to create user with data:", {
      username,
      email,
      password,
    });
    const response = async () => {
      const newUser = await this._userService.createUser(
        username,
        email,
        password
      );
      res.status(201).json(newUser);
    };
    validationWrapper(response, req, res);
  });

  updateUser = asyncWrapper(async (req, res) => {
    const { username, email, password } = req.body;
    const userId = parseInt(req.params.id);
    const updatedUser = await this._userService.updateUser(
      username,
      email,
      password,
      userId
    );
    res.status(201).json(updatedUser);
  });

  deleteUser = asyncWrapper(async (req, res) => {
    const id = parseInt(req.params.id);
    await this._userService.deleteUser(id);
    console.log("Received Email:", id);
    res.json({ status: "success" });
  });

  getByUserNameValidationChain() {
    return [
      param("username")
        .notEmpty()
        .withMessage(errorMessages.USERNAME_REQUIRED)
        .custom(this._validationProvider.isEmailNotExist),
    ];
  }

  postUserValidationChain() {
    return [
      body("username")
        .exists({ checkFalsy: true })
        .withMessage(errorMessages.USERNAME_REQUIRED)
        .isString()
        .withMessage(errorMessages.USERNAME_SHOULD_BE_STRING)
        .custom(this._validationProvider.isUsernameExist)
        .withMessage(errorMessages.USERNAME_EXIST),
      body("password")
        .exists()
        .withMessage(errorMessages.PASSWORD_REQUIRED)
        .isString()
        .withMessage(errorMessages.PASSWORD_SHOULD_BE_STRING)
        .isLength({ min: 5 })
        .withMessage(errorMessages.PASSWORD_FIVE_CHARS),
      body("email")
        .optional()
        .isEmail()
        .withMessage(errorMessages.PROVIDE_VALID_EMAIL)
        .custom(this._validationProvider.isEmailExist)
        .withMessage(errorMessages.EMAIL_EXIST),
    ];
  }

  putUserValidationChain() {
    return [
      param("id").notEmpty().withMessage(errorMessages.USER_ID_REQUIRED),
      body("username").notEmpty().withMessage(errorMessages.USERNAME_REQUIRED),
      body("password")
        .notEmpty()
        .withMessage(errorMessages.PASSWORD_REQUIRED)
        .isLength({ min: 5 })
        .withMessage(errorMessages.PASSWORD_FIVE_CHARS),
      body("email")
        .isEmail()
        .withMessage(errorMessages.PROVIDE_VALID_EMAIL)
        .custom(this._validationProvider.isEmailExist)
        .withMessage(errorMessages.EMAIL_EXIST),
    ];
  }

  deleteUserValidationChain() {
    return [param("id").notEmpty().withMessage(errorMessages.USER_ID_REQUIRED)];
  }
}
