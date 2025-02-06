import { body, param } from "express-validator";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import { validationWrapper } from "../utils/ValidationProvider.js";

//check decorators
export default class TaskController {
  constructor(taskService, validationProvider) {
    this._taskService = taskService;
    this._validationProvider = validationProvider;
  }
  getTasks = asyncWrapper(async (req, res) => {
    const tasks = await this._taskService.getAllTasks();
    res.json(tasks);
  });

  getTasksByEmail = asyncWrapper(async (req, res) => {
    const userEmail = req.params.userEmail;
    console.log("Received userEmail:", userEmail);
    
    const response = async () => {
      const tasks = await this._taskService.getTaskByEmail(userEmail);
      res.json(tasks);
    };
    
    validationWrapper(response, req, res);
});

  createTask = asyncWrapper(async (req, res) => {
    const { title, discription, complete, userEmail } = req.body;
    console.log("Received request to create task with data:", {
      title,
      discription,
      complete,
      userEmail,
    });
    const newTask = await this._taskService.createTask(
      title,
      discription,
      complete,
      userEmail
    );
    res.status(201).json(newTask);
  });

  updateTask = asyncWrapper(async (req, res) => {
    const { title, discription, complete, userEmail } = req.body;
    const task_id = parseInt(req.params.id);
    const updatedTask = await this._taskService.updateTask(
      task_id,
      title,
      discription,
      complete,
      userEmail
    );
    res.status(201).json(updatedTask);
  });

  deleteTask = asyncWrapper(async (req, res) => {
    const id = parseInt(req.params.id);
    await this._taskService.deleteTask(id);
    console.log("Received Id:", id);
    res.json({ status: "success" });
  });
  getByEmailTaskValidationChain() {
    return [
      param("userEmail")
        .isEmail()
        .custom(this._validationProvider.isEmailTaskNotExist),
    ];
  }

  postTaskValidationChain() {
    return [
      body("title")
        .exists({ checkFalsy: true })
        .withMessage("Title is required")
        .isString()
        .withMessage("Title should be string"),
      body("discription")
        .isString()
        .withMessage("Discription should be string"),
      body("complete")
        .exists({ checkFalsy: true })
        .isBoolean()
        .withMessage("Complete state should be boolean"),
      body("userEmail")
        .exists({ checkFalsy: true })
        .isEmail()
        .withMessage("Provide valid email")
        .custom(this._validationProvider.isEmailExist),
    ];
  }
  putTaskValidationChain() {
    return [
      param("id").notEmpty().withMessage("Task id is required"),
      body("title").isString().withMessage("Title should be string"),
      body("discription")
        .isString()
        .withMessage("Discription should be string"),
      body("complete")
        .isBoolean()
        .withMessage("Complete state should be boolean"),
      body("userEmail")
        .exists({ checkFalsy: false })
        .withMessage("User Email isn't requred"),
    ];
  }

  deleteTaskValidationChain() {
    return [param("id").notEmpty().withMessage("Task id is required")];
  }
}


