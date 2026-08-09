const cognitoService = require('./cognito.service');
const userRepository = require('../repositories/user.repository');

class AuthService {
  async register(userData) {
    const { email, password, firstName, lastName } = userData;
    
    // 1. Sign up user in Cognito
    const userId = await cognitoService.signUp(email, password, firstName, lastName);
    
    // 2. Auto confirm is disabled so Cognito sends the verification email
    // await cognitoService.adminConfirmSignUp(email);

    // 3. Save user profile in DynamoDB
    const userProfile = await userRepository.createUser({
      id: userId,
      email,
      firstName,
      lastName
    });

    return userProfile;
  }

  async verifyEmail(email, code) {
    return await cognitoService.confirmSignUp(email, code);
  }

  async login(credentials) {
    const { email, password } = credentials;
    return await cognitoService.login(email, password);
  }

  async forgotPassword(email) {
    return await cognitoService.forgotPassword(email);
  }

  async resetPassword(data) {
    const { email, code, newPassword } = data;
    return await cognitoService.resetPassword(email, code, newPassword);
  }

  async getProfile(userId) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      const error = new Error('User profile not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  async getAllUsers() {
    return await userRepository.getAllUsers();
  }
}

module.exports = new AuthService();
