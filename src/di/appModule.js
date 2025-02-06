import { Container } from "inversify";
import TaskController from "../controllers/TaskController.js";
import UserController from "../controllers/UserController.js";
import { decorateTaskController } from "../decorators/TaskControllerDecorators.js";
import { decorateTaskService } from "../decorators/TaskServiceDecorators.js";
import { decorateUserController } from "../decorators/UserControllerDecorators.js";
import { decorateUserService } from "../decorators/UserServiceDecorators.js";
import { decorateValidationProvider } from "../decorators/ValidationProviderDecorators.js";
import TaskRepository from "../repositories/TaskRepository.js";
import UserRepository from "../repositories/UserRepository.js";
import TaskService from "../services/TaskService.js";
import UserService from "../services/UserService.js";
import { ValidationProvider } from "../utils/ValidationProvider.js";
import { APP_TYPES } from "./appTypes.js";

export const container = new Container();
container.bind(APP_TYPES.TaskRepository).to(TaskRepository);
container.bind(APP_TYPES.TaskController).to(TaskController);
container.bind(APP_TYPES.TaskService).to(TaskService);
container.bind(APP_TYPES.UserRepository).to(UserRepository);
container.bind(APP_TYPES.UserController).to(UserController);
container.bind(APP_TYPES.UserService).to(UserService);
container.bind(APP_TYPES.ValidationProvider).to(ValidationProvider).inSingletonScope();

decorateTaskController();
decorateTaskService();
decorateUserController();
decorateUserService();
decorateValidationProvider();





