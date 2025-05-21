const UserService = require('../services/user.service');

class UserController {
  static async signup(req, res) {
    try {
      const user = await UserService.createUser(req.body);
      res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getUserDetails(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id);
      res.status(200).json(user);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async updateUser(req, res) {
    try {
      const user = await UserService.updateUser(req.params.id, req.body);
      res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteUser(req, res) {
    try {
      await UserService.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getUserById(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id);
      res.status(200).json(user);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async createUser(req, res) {
    try {
      const user = await UserService.createUser(req.body);
      res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteUser(req, res) {
    try {
      await UserService.deleteUser(req.params.id, req.body.userType);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
}

module.exports = UserController;