const Users = require('../controllers/users');
const FAKE_EMAIL = 'fake@gmail.com';
const FAKE_PASSWORD = 'fakePWD';
const FAKE_NAME = 'Fulano';
const ROLE = 'STUDENT';
const SUCCESS = 1;
/*global describe jest test expect beforeAll*/
describe('controller.js tests', () => {
    let mockService = {AddUser: jest.fn()};
    beforeAll(() => {
        mockService.AddUser = jest.fn();
    });
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
        expect(result.passed).toBe(true);
    });

    test('Password can modify if user is allowed to change it', async () => {
        let jsonResponse = {};
        let res = {
            json: jest.fn((data) => {
                jsonResponse.data = data;
            }), status: jest.fn(() => res)
        };
        let mockService = {ChangePassword: jest.fn(() => Promise.resolve())};
        let controller = new Users(mockService);
        await controller.HandleRecreatePassword({
            decoded: {email: FAKE_EMAIL, canChange: true},
            body: {newPassword: FAKE_PASSWORD}
        }, res);
    });

    test('Cannot retrieve group of users if ids are not received', async () => {
        let res = {json: jest.fn(), status: jest.fn()};
        let controller = new Users(null);
        let result = {passed: false, status: 200};
        try {
            await controller.HandleRetrieveGroupUsers({query: {}}, res);
        } catch (e) {
            result.passed = true;
            result.status = e.status;
        }
        expect(result.status).toBe(400);
        expect(result.passed).toBe(true);
    });

    test('Cannot retrieve group of users if ids are invalid', async () => {
        let res = {json: jest.fn(), status: jest.fn()};
        let controller = new Users(null);
        let result = {passed: false, status: 200};
        try {
            await controller.HandleRetrieveGroupUsers({query: {ids: 'invalid id'}}, res);
        } catch (e) {
            result.passed = true;
            result.status = e.status;
        }
        expect(result.status).toBe(400);
        expect(result.passed).toBe(true);
    });

    test('Retrieve group of users if data is okay', async () => {
        let jsonResponse = {};
        let res = {
            json: jest.fn((data) => {
                jsonResponse.data = data;
            }), status: jest.fn()
        };
        const innerResponse = {id: 1};
        let mockService = {GetBatchUsers: jest.fn(() => Promise.resolve(innerResponse))};
        let controller = new Users(mockService);
        await controller.HandleRetrieveGroupUsers({query: {ids: '2,3'}}, res);
        expect(jsonResponse.data.users).toBe(innerResponse);
    });

    test('If user is admin then get all users with query is sent', async () => {
        let jsonResponse = {};
        let res = {
            json: jest.fn((data) => {
                jsonResponse.data = data;
            }), status: jest.fn()
        };
        const innerResponse = {id: 1};
        let mockService = {GetAllUsers: jest.fn(() => Promise.resolve(innerResponse))};
        let controller = new Users(mockService);
        await controller.HandleGetAllUsers({
            decoded: {is_admin: true}, query: {}
        }, res);
        expect(jsonResponse.data.users).toBe(innerResponse);
    });

    test('If user that is not admin tries to login on the method only for admin then error is thrown', async () => {
        let res = {json: jest.fn(), status: jest.fn()};
        let mockService = {GetUser: jest.fn(() => Promise.resolve({is_admin: false}))};
        let controller = new Users(mockService);
        let result = {passed: false, status: 200};
        try {
            await controller.HandleLoginAdmin({body: {email: FAKE_EMAIL}}, res);
        } catch (e) {
            result.passed = true;
            result.message = e.message;
            result.status = e.status;
        }
        expect(result.message).toBe('invalid email or user is not admin');
        expect(result.status).toBe(401);
        expect(result.passed).toBe(true);
    });

    test('If user is admin login is used as normally', async () => {
        let jsonResponse = {};
        let res = {
            json: jest.fn((data) => {
                jsonResponse.data = data;
            }), status: jest.fn()
        };
        let mockService = {GetUser: jest.fn(() => Promise.resolve({is_admin: true})), LoginUser: jest.fn()};
        mockService.LoginUser.mockReturnValueOnce(SUCCESS);
        let controller = new Users(mockService);
        await controller.HandleLoginAdmin({body: {email: FAKE_EMAIL}, password: FAKE_PASSWORD}, res);
        expect(jsonResponse.data.token).toBe(SUCCESS);
        expect(res.status).toBe(200);
    });

    test('Cannot block user if sender is not admin', async () => {
        let res = {json: jest.fn(), status: jest.fn()};
        let controller = new Users(null);
        let result = {passed: false, status: 200};
        try {
            await controller.HandleBlockUser({
                decoded: {is_admin: false}
            }, res);
        } catch (e) {
            result.passed = true;
            result.status = e.status;
        }
        expect(result.status).toBe(403);
        expect(result.passed).toBe(true);
    });

    test('Can not block user if user does not exist ', async () => {
        let jsonResponse = {};
        let res = {
            json: jest.fn((data) => {
                jsonResponse.data = data;
            }), status: jest.fn()
        };
        let mockService = {GetUser: jest.fn(() => Promise.resolve(undefined))};
        let controller = new Users(mockService);
        let result = {passed: false, status: 200};
        try {
            await controller.HandleBlockUser({
                decoded: {is_admin: true},
                param: jest.fn(() => 2)
            }, res);
        } catch (e) {
            result.message = e.message;
            result.passed = true;
            result.status = e.status;
        }
        expect(result.message).toBe('user not found');
        expect(result.status).toBe(400);
        expect(result.passed).toBe(true);
    });

    test('Can block user conditions fulfilled', async () => {
        let jsonResponse = {};
        let res = {
            json: jest.fn((data) => {
                jsonResponse.data = data;
            }), status: jest.fn()
        };
        let mockService = {GetUser: jest.fn(() => Promise.resolve({email: FAKE_EMAIL})), BlockUser: jest.fn(() => Promise.resolve('2'))};
        let controller = new Users(mockService);
        await controller.HandleBlockUser({
            decoded: {is_admin: true},
            param: jest.fn(() => 2)
        }, res);
        expect(jsonResponse.data.status).toBe(200);
    });

    test('Can not unblock user if user does not exist ', async () => {
        let jsonResponse = {};
        let res = {
            json: jest.fn((data) => {
                jsonResponse.data = data;
            }), status: jest.fn()
        };
        let mockService = {GetUser: jest.fn(() => Promise.resolve(undefined))};
        let controller = new Users(mockService);
        let result = {passed: false, status: 200};
        try {
            await controller.HandleUnblockUser({
                decoded: {is_admin: true},
                param: jest.fn(() => 2)
            }, res);
        } catch (e) {
            result.message = e.message;
            result.passed = true;
            result.status = e.status;
        }
        expect(result.message).toBe('user not found');
        expect(result.status).toBe(400);
        expect(result.passed).toBe(true);
    });

    test('Can unblock user conditions fulfilled', async () => {
        let jsonResponse = {};
        let res = {
            json: jest.fn((data) => {
                jsonResponse.data = data;
            }), status: jest.fn()
        };
        let mockService = {GetUser: jest.fn(() => Promise.resolve({email: FAKE_EMAIL})), UnblockUser: jest.fn(() => Promise.resolve('2'))};
        let controller = new Users(mockService);
        await controller.HandleUnblockUser({
            decoded: {is_admin: true},
            param: jest.fn(() => 2)
        }, res);
        expect(jsonResponse.data.status).toBe(200);
    });

    test('Can not set admin user if user does not exist ', async () => {
        let jsonResponse = {};
        let res = {
            json: jest.fn((data) => {
                jsonResponse.data = data;
            }), status: jest.fn()
        };
        let mockService = {GetUser: jest.fn(() => Promise.resolve(undefined))};
        let controller = new Users(mockService);
        let result = {passed: false, status: 200};
        try {
            await controller.HandleAddAdmin({
                body: {email: FAKE_EMAIL},
                decoded: {is_admin: true},
                param: jest.fn(() => 2)
            }, res);
        } catch (e) {
            result.message = e.message;
            result.passed = true;
            result.status = e.status;
        }
        expect(result.message).toBe('user not found');
        expect(result.status).toBe(400);
        expect(result.passed).toBe(true);
    });

    test('Can add admin user conditions fulfilled', async () => {
        let jsonResponse = {};
        let res = {
            json: jest.fn((data) => {
                jsonResponse.data = data;
            }), status: jest.fn()
        };
        let mockService = {GetUser: jest.fn(() => Promise.resolve({email: FAKE_EMAIL, user_id: 20})), SetAdmin: jest.fn(() => Promise.resolve('2'))};
        let controller = new Users(mockService);
        await controller.HandleAddAdmin({
            body: {email: FAKE_EMAIL},
            decoded: {is_admin: true},
            param: jest.fn(() => 2)
        }, res);
        expect(jsonResponse.data.status).toBe(200);
    });

    test('HandleSetToken only delegate to service', async () => {
        let jsonResponse = {};
        let res = {
            json: jest.fn((data) => {
                jsonResponse.data = data;
            }), status: jest.fn()
        };
        let mockService = {SetToken: jest.fn()};
        let controller = new Users(mockService, {log: jest.fn()});
        await controller.HandleSetToken({body: {}, decoded: {}}, res);
        expect(jsonResponse.data.status).toBe(200);
    });

    test('HandleGetToken if invalid id error is thrown', async () => {
        let controller = new Users();
        let ok = true;
        let e = {status: 418};
        try {
            await controller.HandleGetToken({param: jest.fn().mockReturnValueOnce('cositote')})
        } catch (er) {
            e = er;
            ok = false;
        }
        expect(e.status).toBe(400);
        expect(ok).toBeFalsy();
    });

    test('HandleGetToken delegates responsibility if ok', async () => {
        let jsonResponse = {};
        let response = {'somethingUnique': 'reallyunique'}
        let res = {
            json: jest.fn((data) => {
                jsonResponse.data = data;
            }), status: jest.fn()
        };
        let mockService = {GetToken: jest.fn().mockReturnValueOnce(response)};
        let controller = new Users(mockService, {log: jest.fn()});
        await controller.HandleGetToken({param: jest.fn().mockReturnValueOnce(1)}, res);
        expect(jsonResponse.data).toBe(response);
    });

    test('HandleUpgradeSubscription throws error if sub not possible', async () => {
        let controller = new Users();
        let ok = true;
        let e = {status: 418};
        try {
            await controller.HandleUpgradeSubscription({body: {subscription: 'sarasa'}, decoded: {}})
        } catch (er) {
            e = er;
            ok = false;
        }
        expect(e.status).toBe(400);
        expect(ok).toBeFalsy();
    });


    test('HandleUpgradeSubscription delegates responsibility if ok', async () => {
        let jsonResponse = {};
        let res = {
            json: jest.fn((data) => {
                jsonResponse.data = data;
            }), status: jest.fn()
        };
        let mockService = {UpgradeUser: jest.fn().mockReturnValueOnce({})};
        let controller = new Users(mockService, {log: jest.fn()});
        await controller.HandleUpgradeSubscription({decoded: {id: 1}, body: {subscription: 'BasIco'}}, res);
        expect(jsonResponse.data.status).toBe(200);
        expect(jsonResponse.data.txn).toBeUndefined();
    });

    test('HandleSendPayment throws error if not admin', async () => {
        let controller = new Users();
        let ok = true;
        let e = {status: 418};
        try {
            await controller.HandleSendPayment({decoded: {is_admin: false}});
        } catch (er) {
            e = er;
            ok = false;
        }
        expect(e.status).toBe(403);
        expect(ok).toBeFalsy();
    });

    test('HandleSendPayment delegates responsibility if ok', async () => {
        let jsonResponse = {};
        let res = {
            json: jest.fn((data) => {
                jsonResponse.data = data;
            }), status: jest.fn()
        };
        let mockService = {SendPayment: jest.fn().mockReturnValueOnce({})};
        let controller = new Users(mockService, {log: jest.fn()});
        await controller.HandleSendPayment({decoded: {is_admin: true}, body: {}}, res);
        expect(jsonResponse.data.status).toBe(200);
        expect(jsonResponse.data.txn).toBeUndefined();
    });
});
