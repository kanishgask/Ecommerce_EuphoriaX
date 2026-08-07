const { 
  SignUpCommand, 
  InitiateAuthCommand, 
  ForgotPasswordCommand, 
  ConfirmForgotPasswordCommand,
  AdminConfirmSignUpCommand
} = require('@aws-sdk/client-cognito-identity-provider');
const { cognitoClient } = require('../config/aws');
const config = require('../config/config');

class CognitoService {
  async signUp(email, password, firstName, lastName) {
    const params = {
      ClientId: config.aws.cognito.clientId,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'given_name', Value: firstName },
        { Name: 'family_name', Value: lastName }
      ]
    };
    const response = await cognitoClient.send(new SignUpCommand(params));
    return response.UserSub; // The unique ID for the user
  }

  // Auto-confirm for development purposes. In prod, you'd verify email.
  async adminConfirmSignUp(email) {
    const params = {
      UserPoolId: config.aws.cognito.userPoolId,
      Username: email
    };
    await cognitoClient.send(new AdminConfirmSignUpCommand(params));
  }

  async login(email, password) {
    const params = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: config.aws.cognito.clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password
      }
    };
    const response = await cognitoClient.send(new InitiateAuthCommand(params));
    return {
      accessToken: response.AuthenticationResult.AccessToken,
      idToken: response.AuthenticationResult.IdToken,
      refreshToken: response.AuthenticationResult.RefreshToken
    };
  }

  async forgotPassword(email) {
    const params = {
      ClientId: config.aws.cognito.clientId,
      Username: email
    };
    await cognitoClient.send(new ForgotPasswordCommand(params));
  }

  async resetPassword(email, code, newPassword) {
    const params = {
      ClientId: config.aws.cognito.clientId,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword
    };
    await cognitoClient.send(new ConfirmForgotPasswordCommand(params));
  }
}

module.exports = new CognitoService();
