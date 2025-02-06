import { validationResult } from "express-validator";
import "reflect-metadata";
import TaskController from "../../controllers/TaskController.js";

describe("TaskController test service", () => {
  let taskServiceMock, validationProviderMock, reqMock, resMock, taskController;

  beforeEach(() => {
    taskServiceMock = {
      getAllTasks: jest.fn(),
      getTaskByEmail: jest.fn(),
      createTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
    };
    validationProviderMock = {
      isEmailTaskNotExist: jest.fn(),
      isEmailExist: jest.fn(),
    };

    reqMock = {
      params: {},
      body: {},
    };

    resMock = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    taskController = new TaskController(
      taskServiceMock,
      validationProviderMock
    );
  });

  test("getTasks should return all tasks", async () => {
    const mockTasks = [{ id: 1, title: "Task 1" }];
    taskServiceMock.getAllTasks.mockResolvedValue(mockTasks);

    await taskController.getTasks(reqMock, resMock);

    expect(taskServiceMock.getAllTasks).toHaveBeenCalled();
    expect(resMock.json).toHaveBeenCalledWith(mockTasks);
  });

  test("getTasksByEmail should return tasks by email", async () => {
    const mockTasks = [
      { id: 1, title: "Task 1", userEmail: "test@example.com" },
    ];
    const userEmail = "test@example.com";
    reqMock.params.userEmail = userEmail;
    taskServiceMock.getTaskByEmail.mockResolvedValue(mockTasks);

    await taskController.getTasksByEmail(reqMock, resMock);

    expect(taskServiceMock.getTaskByEmail).toHaveBeenCalledWith(userEmail);
    expect(resMock.json).toHaveBeenCalledWith(mockTasks);
  });

  test("createTask should create a new task", async () => {
    const newTask = { id: 1, title: "New Task" };
    reqMock.body = {
      title: "New Task",
      discription: "Test",
      complete: false,
      userEmail: "test@example.com",
    };
    taskServiceMock.createTask.mockResolvedValue(newTask);

    await taskController.createTask(reqMock, resMock);

    expect(taskServiceMock.createTask).toHaveBeenCalledWith(
      reqMock.body.title,
      reqMock.body.discription,
      reqMock.body.complete,
      reqMock.body.userEmail
    );
    expect(resMock.status).toHaveBeenCalledWith(201);
    expect(resMock.json).toHaveBeenCalledWith(newTask);
  });

  test("updateTask should update an existing task", async () => {
    const updatedTask = { id: 1, title: "Updated Task" };
    reqMock.params.id = "1";
    reqMock.body = {
      title: "Updated Task",
      discription: "Test",
      complete: true,
      userEmail: "test@example.com",
    };
    taskServiceMock.updateTask.mockResolvedValue(updatedTask);

    await taskController.updateTask(reqMock, resMock);

    expect(taskServiceMock.updateTask).toHaveBeenCalledWith(
      1,
      reqMock.body.title,
      reqMock.body.discription,
      reqMock.body.complete,
      reqMock.body.userEmail
    );
    expect(resMock.status).toHaveBeenCalledWith(201);
    expect(resMock.json).toHaveBeenCalledWith(updatedTask);
  });

  test("deleteTask should delete a task", async () => {
    reqMock.params.id = "1";

    await taskController.deleteTask(reqMock, resMock);

    expect(taskServiceMock.deleteTask).toHaveBeenCalledWith(1);
    expect(resMock.json).toHaveBeenCalledWith({ status: "success" });
  });
});



describe('TaskController test validation', () => {
  let taskController, validationProviderMock;

  beforeEach(() => {
    validationProviderMock = {
      isEmailExist: jest.fn(),
    };
    taskController = new TaskController(null, validationProviderMock);
  });

  const runValidation = async (req, validationChain) => {
    for (let validation of validationChain) {
      await validation.run(req);
    }
    return validationResult(req);
  };

  test('postTaskValidationChain should validate correctly', async () => {
    const req = {
      body: {
        title: 'Test Task',
        discription: 'Test Description',
        complete: true,
        userEmail: 'test@example.com',
      },
    };

    validationProviderMock.isEmailExist.mockResolvedValue(true);

    const validationChain = taskController.postTaskValidationChain();
    const result = await runValidation(req, validationChain);

    expect(result.isEmpty()).toBe(true);
  });

  test('postTaskValidationChain should return error for missing title', async () => {
    const req = {
      body: {
        discription: 'Test Description',
        complete: true,
        userEmail: 'test@example.com',
      },
    };

    const validationChain = taskController.postTaskValidationChain();
    const result = await runValidation(req, validationChain);

    expect(result.isEmpty()).toBe(false);
    expect(result.array()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: 'Title is required' }),
      ])
    );
  });

  test('putTaskValidationChain should validate correctly', async () => {
    const req = {
      params: { id: '1' },
      body: {
        title: 'Updated Task',
        discription: 'Updated Description',
        complete: false,
        userEmail: 'test@example.com',
      },
    };

    const validationChain = taskController.putTaskValidationChain();
    const result = await runValidation(req, validationChain);

    expect(result.isEmpty()).toBe(true);
  });

  test('putTaskValidationChain should return error for missing id', async () => {
    const req = {
      params: {},
      body: {
        title: 'Updated Task',
        discription: 'Updated Description',
        complete: false,
        userEmail: 'test@example.com',
      },
    };

    const validationChain = taskController.putTaskValidationChain();
    const result = await runValidation(req, validationChain);

    expect(result.isEmpty()).toBe(false);
    expect(result.array()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: 'Task id is required' }),
      ])
    );
  });

  test('deleteTaskValidationChain should validate correctly', async () => {
    const req = {
      params: { id: '1' },
    };

    const validationChain = taskController.deleteTaskValidationChain();
    const result = await runValidation(req, validationChain);

    expect(result.isEmpty()).toBe(true);
  });

  test('deleteTaskValidationChain should return error for missing id', async () => {
    const req = {
      params: {},
    };

    const validationChain = taskController.deleteTaskValidationChain();
    const result = await runValidation(req, validationChain);

    expect(result.isEmpty()).toBe(false);
    expect(result.array()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: 'Task id is required' }),
      ])
    );
  });
});