const Users = require('../controllers/users');
const jwt = require("jsonwebtoken");
const FAKE_EMAIL = 'fake@gmail.com';
const FAKE_PASSWORD = 'fakePWD';
const FAKE_NAME = 'Fulano';
const ROLE = 'STUDENT';
const SUCCESS = 1;
/*global describe jest test expect beforeAll*/
describe('controller.js tests', ()=> {

    test('Controller won\'t throw error if service okay', async () => {
        let mockService = {AddUser: jest.fn()};
        mockService.AddUser.mockReturnValueOnce(SUCCESS);
        let res = {json: jest.fn(), status: jest.fn()};
        let controller = new Users(mockService);
        await controller.HandleUserPost({body: {email: FAKE_EMAIL}}, res);
        expect(mockService.AddUser.mock.calls.length).toBe(1);
        expect(res.json.mock.calls.length).toBe(1);
        expect(res.status.mock.calls[0][0]).toBe(200);
        expect(res.json.mock.calls[0][0].status).toBe(200);
    });

    test('User logs in successfully', async () => {
        let mockService = {LoginUser: jest.fn()};
        mockService.LoginUser.mockReturnValueOnce(SUCCESS);
        let res = {json: jest.fn(), status: null};
        let controller = new Users(mockService);
        await controller.HandleUserLogin({body: {email: FAKE_EMAIL, password: FAKE_PASSWORD}}, res);
        expect(mockService.LoginUser.mock.calls.length).toBe(1);
        expect(mockService.LoginUser.mock.calls[0][0].email).toBe(FAKE_EMAIL);
        expect(mockService.LoginUser.mock.calls[0][0].password).toBe(FAKE_PASSWORD);
        expect(res.json.mock.calls.length).toBe(1); //length para saber cuantas veces se llamo
        expect(res.status).toBe(200);
        expect(res.json.mock.calls[0][0].status).toBe(200);
    });

    test('Get user info correctly', async () => {
        let mockService = {GetUser: jest.fn()};
        mockService.GetUser.mockReturnValueOnce({email: FAKE_EMAIL, name: FAKE_NAME});
        let res = {json: jest.fn()};
        let controller = new Users(mockService);
        await controller.HandleUserGet({query: {email: FAKE_EMAIL, password: FAKE_PASSWORD}}, res);
        expect(mockService.GetUser.mock.calls.length).toBe(1);
        expect(mockService.GetUser.mock.calls[0][0]).toBe(FAKE_EMAIL);
        expect(res.json.mock.calls[0][0].email).toBe(FAKE_EMAIL);
        expect(res.json.mock.calls[0][0].name).toBe(FAKE_NAME);
    });

    test('Can not get user info if not exists', async () => {
        let mockService = {GetUser: jest.fn()};
        mockService.GetUser.mockReturnValueOnce({email: null, name: null});
        let res = {json: jest.fn()};
        let controller = new Users(mockService);
        let result = {passed: false, status: 200};
        try {
            await controller.HandleUserGet({query: {email: FAKE_EMAIL, password: FAKE_PASSWORD}}, res);
        } catch (e) {
            result.passed = true;
            result.status = e.status;
        }
        expect(mockService.GetUser.mock.calls.length).toBe(1);
        expect(mockService.GetUser.mock.calls[0][0]).toBe(FAKE_EMAIL);
        expect(result.passed).toBe(true);
        expect(result.status).toBe(400);
    });

    test('User can modify info correctly', async () => {
        let mockService = {ModifyUserInfo: jest.fn()};
        mockService.ModifyUserInfo.mockReturnValueOnce(SUCCESS);
        let res = {json: jest.fn(), status: jest.fn()};
        let controller = new Users(mockService);
        await controller.HandleUserPut({body: {email: FAKE_EMAIL, password: FAKE_PASSWORD}}, res);
        expect(mockService.ModifyUserInfo.mock.calls.length).toBe(1);
        expect(res.status.mock.calls[0][0]).toBe(200);
        expect(res.json.mock.calls[0][0].status).toBe(200);
    });

    test('User can change password correctly', async () => {
       let mockService = {UpdateUserPassword: jest.fn()};
       mockService.UpdateUserPassword.mockReturnValueOnce(SUCCESS);
       let res = {json: jest.fn(), status: jest.fn()};
       let controller = new Users(mockService);
       await controller.HandleUserChangePassword({
           decoded: {email: FAKE_EMAIL, role: ROLE},
           body: {password: FAKE_PASSWORD, newPassword: FAKE_PASSWORD + '2'}
       }, res);
       expect(mockService.UpdateUserPassword.mock.calls.length).toBe(1);
       expect(mockService.UpdateUserPassword.mock.calls[0][0].email).toBe(FAKE_EMAIL);
       expect(mockService.UpdateUserPassword.mock.calls[0][0].role).toBe(ROLE);
       expect(mockService.UpdateUserPassword.mock.calls[0][0].password).toBe(FAKE_PASSWORD);
       expect(mockService.UpdateUserPassword.mock.calls[0][0].newPassword).toBe(FAKE_PASSWORD + '2');
       expect(res.status.mock.calls[0][0]).toBe(200);
       expect(res.json.mock.calls[0][0].status).toBe(200);
    });

    test('User can be delete', async () => {
        let mockService = {RemoveUser: jest.fn()};
        mockService.RemoveUser.mockReturnValueOnce(SUCCESS);
        let res = {json: jest.fn(), status: jest.fn()};
        let controller = new Users(mockService);
        await controller.HandleUserDelete({decoded: {email: FAKE_EMAIL, role: ROLE}}, res);
        expect(mockService.RemoveUser.mock.calls.length).toBe(1);
        expect(mockService.RemoveUser.mock.calls[0][0].email).toBe(FAKE_EMAIL);
        expect(mockService.RemoveUser.mock.calls[0][0].role).toBe(ROLE);
        expect(res.status.mock.calls[0][0]).toBe(200);
        expect(res.json.mock.calls[0][0].status).toBe(200);
    });

    test('Token to change password is send correctly', async () => {
        let mockService = {SendTokenToRetry: jest.fn()};
        mockService.SendTokenToRetry.mockReturnValueOnce(FAKE_EMAIL);
        let res = {json: jest.fn(), status: jest.fn()};
        let controller = new Users(mockService);
        await controller.HandleResendPasswordChange({query: {email: FAKE_EMAIL}}, res);
        expect(mockService.SendTokenToRetry.mock.calls.length).toBe(1);
        expect(mockService.SendTokenToRetry.mock.calls[0][0]).toBe(FAKE_EMAIL);
        expect(res.status.mock.calls[0][0]).toBe(200);
        expect(res.json.mock.calls[0][0].status).toBe(200);
    });

    //ToDo: test when the user CAN modify the password
    test('Password can not be modify if user is not allowed to change it', async () => {
        let res = {json: jest.fn(), status: jest.fn()};
        let controller = new Users(null);
        let result = {passed: false, status: 200};
        try {
            await controller.HandleRecreatePassword({
                decoded: {email: FAKE_EMAIL, canChange: false},
                body: {newPassword: FAKE_PASSWORD}
            }, res);
        } catch (e) {
            result.passed = true;
            result.status = 400;
        }
        expect(result.status).toBe(400);
        expect(result.passed).toBe(true)
    });
});