
//check decorators
export default class UserService {
    constructor(userRepository){
        this._userRepository = userRepository
    }
  async createUser(username, email, password) {
    return await this._userRepository.createUser(username, email, password);
  }
  async getAllUsers() {
    return await this._userRepository.getAllUsers();
  }
  async getUserByEmail(email){
    return await this._userRepository.getUserByEmail(email)
  }
  async getUserByName(username) {
    return await this._userRepository.getUserByName(username);
  }

  async updateUser(username, email, password, userId) {
    return await this._userRepository.updateUser(username, email, password, userId);
  }

  async deleteUser(id) {
    return await this._userRepository.deleteUser(id);
  }
}