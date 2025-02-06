import { validationResult } from "express-validator";
import { errorMessages } from "../../constants/strings.js";
import UserController from "../../controllers/UserController.js";

// jest.mock('../../services/UserService.js');
// jest.mock('../../utils/ValidationProvider.js');

describe("test UserController services", () => {
  let userServiceMock, validationProviderMock, userController, mockReq, mockRes;

  beforeEach(() => {
    userServiceMock = {
      createUser: jest.fn(),
      getAllUsers: jest.fn(),
      getUserByEmail: jest.fn(),
      getUserByName: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    };
    validationProviderMock = {
      isEmailTaskNotExist: jest.fn(),
      isEmailExist: jest.fn(),
    };
    userController = new UserController(
      userServiceMock,
      validationProviderMock
    );

    mockReq = {
      params: {},
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test("should get all users", async () => {
    const users = [
      {
        id: 2,
        username: "manforprom",
        email: "manforprom@gmail.com",
        password: "1223213",
      },
    ];
    userController._userService.getAllUsers.mockResolvedValue(users);

    await userController.getUsers(mockReq, mockRes);

    expect(userController._userService.getAllUsers).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith(users);
  });

  test("should create user", async () => {
    const newUser = {
      id: 1,
      username: "username2",
      email: "3@gmail.com",
      password: "11111",
    };

    const mockReq = {
      body: {
        username: "username2",
        email: "3@gmail.com",
        password: "11111",
      },
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    userController._userService.createUser = jest
      .fn()
      .mockResolvedValue(newUser);

    await userController.createUser(mockReq, mockRes);

    expect(userController._userService.createUser).toHaveBeenCalledWith(
      mockReq.body.username,
      mockReq.body.email,
      mockReq.body.password
    );
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(newUser);
  });

  test("updateUser should update user", async () => {
    const updatedUser = {
      id: 1,
      username: "username2",
      email: "3@gmail.com",
      password: "11111",
    };
    mockReq.params.id = "1";
    mockReq.body = {
      username: "username2",
      email: "3@gmail.com",
      password: "11111",
    };
    userServiceMock.updateUser.mockResolvedValue(updatedUser);

    await userController.updateUser(mockReq, mockRes);

    expect(userServiceMock.updateUser).toHaveBeenCalledWith(
      mockReq.body.username,
      mockReq.body.email,
      mockReq.body.password,
      1
    );
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(updatedUser);
  });

  test("deleteUser should delete a user", async () => {
    mockReq.params.id = "1";

    await userController.deleteUser(mockReq, mockRes);

    expect(userServiceMock.deleteUser).toHaveBeenCalledWith(1);
    expect(mockRes.json).toHaveBeenCalledWith({ status: "success" });
  });
});

describe("UserController test validation", () => {
  let userController, validationProviderMock;

  beforeEach(() => {
    validationProviderMock = {
      isEmailExist: jest.fn(),
      isUsernameExist: jest.fn(),
    };
    userController = new UserController(null, validationProviderMock);
  });

  const runValidation = async (req, validationChain) => {
    for (let validation of validationChain) {
      await validation.run(req);
    }
    return validationResult(req);
  };

  test("postUserValidationChain should validate correctly", async () => {
    const req = {
      body: {
        id: 1,
        username: "username2",
        email: "3@gmail.com",
        password: "11111",
      },
    };

    validationProviderMock.isUsernameExist.mockResolvedValue(true);
    validationProviderMock.isEmailExist.mockResolvedValue(true);

    const validationChain = userController.postUserValidationChain();
    const result = await runValidation(req, validationChain);

    expect(result.isEmpty()).toBe(true);
  });

  test("postUserValidationChain should return error", async () => {
    const req = {
      body: {
      },
    };

    const validationChain = userController.postUserValidationChain();
    const result = await runValidation(req, validationChain);

    expect(result.isEmpty()).toBe(false);
    expect(result.array()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: errorMessages.USERNAME_REQUIRED }),
        expect.objectContaining({ msg: errorMessages.USERNAME_SHOULD_BE_STRING }),
        expect.objectContaining({ msg: errorMessages.PASSWORD_REQUIRED }),
        expect.objectContaining({ msg: errorMessages.PASSWORD_SHOULD_BE_STRING }),
        expect.objectContaining({ msg: errorMessages.PASSWORD_FIVE_CHARS }),
      ])
    );
  });

  test("postUserValidationChain should return error when user or email exist", async () => {
    const req = {
      body: {
        username: "username2",
        email: "3@gmail.com",
        password: "11111",
      },
    };

    const validationChain = userController.postUserValidationChain();
    const result = await runValidation(req, validationChain);
    
    validationProviderMock.isUsernameExist.mockRejectedValue(new Error(errorMessages.USERNAME_EXIST));
    validationProviderMock.isEmailExist.mockRejectedValue(new Error(errorMessages.EMAIL_EXIST));

    expect(result.isEmpty()).toBe(false);
    expect(result.array()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: errorMessages.USERNAME_EXIST }),
        expect.objectContaining({ msg: errorMessages.EMAIL_EXIST }),
      ])
    );
  });

  test("postUserValidationChain should return error for invalid email", async () => {
    const req = {
      body: {
        username: "username2",
        email: "3gmail.com",
        password: "11111",
      },
    };

    const validationChain = userController.postUserValidationChain();
    const result = await runValidation(req, validationChain);

    expect(result.isEmpty()).toBe(false);
    expect(result.array()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: errorMessages.PROVIDE_VALID_EMAIL }),
      ])
    );
  });

  test("putUserValidationChain should validate correctly", async () => {
    const req = {
      params: { id: "1" },
      body: {
        username: "username2",
        email: "3@gmail.com",
        password: "11111",
      },
    };
  
    validationProviderMock.isUsernameExist.mockResolvedValue(false);
    validationProviderMock.isEmailExist.mockResolvedValue(false);
  
    const validationChain = userController.putUserValidationChain();
    const result = await runValidation(req, validationChain);
  
    expect(result.isEmpty()).toBe(true);
  });

  test("putUserValidationChain should return error", async () => {
    const req = {
      params: {},
      body: {
      },
    };

    const validationChain = userController.putUserValidationChain();
    const result = await runValidation(req, validationChain);
    
    validationProviderMock.isUsernameExist.mockRejectedValue(new Error(errorMessages.USERNAME_EXIST));
    validationProviderMock.isEmailExist.mockRejectedValue(new Error(errorMessages.EMAIL_EXIST));

    expect(result.isEmpty()).toBe(false);
    expect(result.array()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: errorMessages.USER_ID_REQUIRED }),
        expect.objectContaining({ msg: errorMessages.EMAIL_EXIST }),
      ])
    );
  });

  test("deleteUserValidationChain should validate correctly", async () => {
    const req = {
      params: { id: "1" },
    };

    const validationChain = userController.deleteUserValidationChain();
    const result = await runValidation(req, validationChain);

    expect(result.isEmpty()).toBe(true);
  });

  test("deleteUserValidationChain should return error for missing id", async () => {
    const req = {
      params: {},
    };

    const validationChain = userController.deleteUserValidationChain();
    const result = await runValidation(req, validationChain);

    expect(result.isEmpty()).toBe(false);
    expect(result.array()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: errorMessages.USER_ID_REQUIRED}),
      ])
    );
  });
});
