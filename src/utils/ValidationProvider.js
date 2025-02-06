import { validationResult } from 'express-validator';
import { errorMessages } from '../constants/strings.js';

//check decorators
export class ValidationProvider {
    constructor(userService, taskService){
        this._userService = userService;
        this._taskService = taskService;
    }

    isEmailNotExist = async (value) => {
        const user = await this._userService.getUserByName(value)
        console.log(`validation value: ${user}`);
        if(!user.toString()){
            throw new Error(errorMessages.USER_NOT_FOUND);
        }
    }
    isEmailTaskNotExist = async (value) => {
        console.log(`validation value: ${value}`);
        const task = await this._taskService.getTaskByEmail(value);
        if(!task.toString()){
            throw new Error(errorMessages.TASK_NOT_EXIST);
        }
    }
    isEmailExist = async (value) => {
        const user = await this._userService.getUserByEmail(value);
        if(user.toString()){
            throw new Error(errorMessages.EMAIL_EXIST);
        }
    }
    isUsernameExist = async (value) => {
        const user = await this._userService.getUserByName(value);
        if(user.toString()){
            throw new Error(errorMessages.USERNAME_EXIST);
        }
    }
}

export const validationWrapper = (fn,req,res) => {
    const errors = validationResult(req);
    console.log(errors);
    if(errors.isEmpty()){
        return fn();
    }
    res.status(400).json({success: false,
         errors: errors.array() });
}
