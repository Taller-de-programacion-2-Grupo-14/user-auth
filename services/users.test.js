/*global describe jest test expect beforeAll process*/
const UserService = require('../services/users');
const FAKE_EMAIL = 'fake@gmail.com';
const FAKE_PASSWORD = 'fakePWD';
const FAKE_NAME = 'Fulano';
const FAKE_ID = 69; // ;)
describe('services.js tests', () => {
    let mockService = {AddUser: jest.fn()};
    beforeAll(() => {
        mockService.AddUser = jest.fn();
        process.env.algorithm = 'HS256';
        process.env.secret = 'some ultra archduke Ferdinand secret ';
    });

    test('User is added correctly', async () => {
        let mockDB = {GetPrivateUserInfo: jest.fn(), AddUser: jest.fn(), AddUserProfile: jest.fn()};
        let paymentClientMock = {createWallet: jest.fn()};
        mockDB.GetPrivateUserInfo.mockReturnValueOnce(null).mockReturnValueOnce({id: FAKE_ID});
        let service = new UserService(mockDB, null, paymentClientMock);
        expect(await service.AddUser({id: FAKE_ID, email: FAKE_EMAIL})).toBe(true);
        expect(mockDB.GetPrivateUserInfo.mock.calls.length).toBe(2);
        expect(mockDB.GetPrivateUserInfo.mock.calls[0][0]).toBe(FAKE_EMAIL);
        expect(mockDB.GetPrivateUserInfo.mock.calls[1][0]).toBe(FAKE_EMAIL);
        expect(mockDB.AddUser.mock.calls.length).toBe(1);
        expect(mockDB.AddUserProfile.mock.calls.length).toBe(1);
    });

    test('User can not be added if already exists in the DB', async () => {
        let mockDB = {GetPrivateUserInfo: jest.fn(), AddUser: jest.fn(), AddUserProfile: jest.fn()};
        mockDB.GetPrivateUserInfo.mockReturnValueOnce({email: FAKE_EMAIL});
        let service = new UserService(mockDB, null);
        let result = {passed: false, status: 200};
        try {
            expect(await service.AddUser({id: FAKE_ID, email: FAKE_EMAIL})).toBe(true);
        } catch (e) {
            result.passed = true;
            result.status = 400;
        }
        expect(mockDB.GetPrivateUserInfo.mock.calls.length).toBe(1);
        expect(mockDB.GetPrivateUserInfo.mock.calls[0][0]).toBe(FAKE_EMAIL);
        expect(mockDB.AddUser.mock.calls.length).toBe(0);
        expect(mockDB.AddUserProfile.mock.calls.length).toBe(0);
        expect(result.passed).toBe(true);
        expect(result.status).toBe(400);
    });

    test('User info is get correctly', async () => {
        let mockDB = {GetUserInfo: jest.fn()};
        mockDB.GetUserInfo.mockReturnValueOnce({name: FAKE_NAME, email: FAKE_EMAIL, id: FAKE_ID});
        let service = new UserService(mockDB, null);
        let result = await service.GetUser(FAKE_EMAIL);
        expect(mockDB.GetUserInfo.mock.calls.length).toBe(1);
        expect(mockDB.GetUserInfo.mock.calls[0][0]).toBe(FAKE_EMAIL);
        expect(result.name).toBe(FAKE_NAME);
        expect(result.email).toBe(FAKE_EMAIL);
        expect(result.id).toBe(FAKE_ID);
    });

    test('User logs in correctly', async () => {
        let mockDB = {GetPrivateUserInfo: jest.fn(), GetUserInfo: jest.fn()};
        mockDB.GetPrivateUserInfo.mockReturnValueOnce({email: FAKE_EMAIL, password: FAKE_PASSWORD});
        mockDB.GetUserInfo.mockReturnValueOnce({email: FAKE_EMAIL});
        let service = new UserService(mockDB, null);
        await service.LoginUser({email: FAKE_EMAIL, password: FAKE_PASSWORD});
        expect(mockDB.GetPrivateUserInfo.mock.calls.length).toBe(1);
        expect(mockDB.GetPrivateUserInfo.mock.calls[0][0]).toBe(FAKE_EMAIL);
        expect(mockDB.GetUserInfo.mock.calls.length).toBe(1);
        expect(mockDB.GetUserInfo.mock.calls[0][0]).toBe(FAKE_EMAIL);
    });

    test('User can not log in due to an invalid email', async () => {
        let mockDB = {GetPrivateUserInfo: jest.fn(), GetUserInfo: jest.fn()};
        mockDB.GetPrivateUserInfo.mockReturnValueOnce({email: 'bad' + FAKE_EMAIL, password: FAKE_PASSWORD});
        let service = new UserService(mockDB, null);
        let result = {passed: false, status: 200};
        try {
            await service.LoginUser({email: FAKE_EMAIL, password: FAKE_PASSWORD});
        } catch (e) {
            result.passed = true;
            result.status = e.status;
        }
        expect(mockDB.GetPrivateUserInfo.mock.calls.length).toBe(1);
        expect(mockDB.GetPrivateUserInfo.mock.calls[0][0]).toBe(FAKE_EMAIL);
        expect(mockDB.GetUserInfo.mock.calls.length).toBe(0);
        expect(result.passed).toBe(true);
        expect(result.status).toBe(400);
    });

    test('User can not log in due to an invalid password', async () => {
        let mockDB = {GetPrivateUserInfo: jest.fn(), GetUserInfo: jest.fn()};
        mockDB.GetPrivateUserInfo.mockReturnValueOnce({email: FAKE_EMAIL, password: 'bad' + FAKE_PASSWORD});
        let service = new UserService(mockDB, null);
        let result = {passed: false, status: 200};
        try {
            await service.LoginUser({email: FAKE_EMAIL, password: FAKE_PASSWORD});
        } catch (e) {
            result.passed = true;
            result.status = e.status;
        }
        expect(mockDB.GetPrivateUserInfo.mock.calls.length).toBe(1);
        expect(mockDB.GetPrivateUserInfo.mock.calls[0][0]).toBe(FAKE_EMAIL);
        expect(mockDB.GetUserInfo.mock.calls.length).toBe(0);
        expect(result.passed).toBe(true);
        expect(result.status).toBe(400);
    });

    test('User can modify his info correctly', async () => {
        let mockDB = {GetUserInfo: jest.fn(), UpdateUserProfile: jest.fn()};
        mockDB.GetUserInfo.mockReturnValueOnce({name: FAKE_NAME, email: FAKE_EMAIL, id: FAKE_ID});
        let service = new UserService(mockDB, null);
        await service.ModifyUserInfo({
            email: FAKE_EMAIL,
            first_name: FAKE_NAME,
            last_name: FAKE_NAME,
            interest: '???????? ????????????',
            location: '-34.61749144776616, -58.368320301041116'
        });
        expect(mockDB.GetUserInfo.mock.calls.length).toBe(1);
        expect(mockDB.GetUserInfo.mock.calls[0][0]).toBe(FAKE_EMAIL);
        expect(mockDB.UpdateUserProfile.mock.calls.length).toBe(1);
    });

    test('User can not modify his info if he does not exists', async () => {
        let mockDB = {GetUserInfo: jest.fn(), UpdateUserProfile: jest.fn()};
        mockDB.GetUserInfo.mockReturnValueOnce(null);
        let service = new UserService(mockDB, null);
        let result = {passed: false, status: 200};
        try {
            await service.ModifyUserInfo({
                email: FAKE_EMAIL,
                first_name: FAKE_NAME,
                last_name: FAKE_NAME,
                interest: '???????? ????????????',
                location: '-34.61749144776616, -58.368320301041116'
            });
        } catch (e) {
            result.passed = true;
            result.status = e.status;
        }
        expect(mockDB.GetUserInfo.mock.calls.length).toBe(1);
        expect(mockDB.GetUserInfo.mock.calls[0][0]).toBe(FAKE_EMAIL);
        expect(mockDB.UpdateUserProfile.mock.calls.length).toBe(0);
        expect(result.passed).toBe(true);
        expect(result.status).toBe(418);
    });

    test('User registry is updated correctly', async () => {
        let mockDB = {UpdateUserRegistry: jest.fn()};
        let service = new UserService(mockDB, null);
        await service.ChangePassword({name: FAKE_NAME});
        expect(mockDB.UpdateUserRegistry.mock.calls.length).toBe(1);
    });

    test('Password is updated correctly', async () => {
        let mockDB = {GetPrivateUserInfo: jest.fn(), UpdateUserRegistry: jest.fn()};
        mockDB.GetPrivateUserInfo.mockReturnValueOnce({email: FAKE_EMAIL, password: FAKE_PASSWORD});
        let service = new UserService(mockDB, null);
        await service.UpdateUserPassword({email: FAKE_EMAIL, password: FAKE_PASSWORD});
        expect(mockDB.GetPrivateUserInfo.mock.calls.length).toBe(1);
        expect(mockDB.UpdateUserRegistry.mock.calls.length).toBe(1);
        expect(mockDB.GetPrivateUserInfo.mock.calls[0][0]).toBe(FAKE_EMAIL);
    });

    test('Password can not be updated correctly due to an invalid password', async () => {
        let mockDB = {GetPrivateUserInfo: jest.fn(), UpdateUserRegistry: jest.fn()};
        mockDB.GetPrivateUserInfo.mockReturnValueOnce({email: FAKE_EMAIL, password: 'bad' + FAKE_PASSWORD});
        let service = new UserService(mockDB, null);
        let result = {passed: false, status: 200};
        try {
            await service.UpdateUserPassword({email: FAKE_EMAIL, password: FAKE_PASSWORD});
        } catch (e) {
            result.passed = true;
            result.status = e.status;
        }
        expect(mockDB.GetPrivateUserInfo.mock.calls.length).toBe(1);
        expect(mockDB.UpdateUserRegistry.mock.calls.length).toBe(0);
        expect(mockDB.GetPrivateUserInfo.mock.calls[0][0]).toBe(FAKE_EMAIL);
        expect(result.passed).toBe(true);
        expect(result.status).toBe(400);
    });

    test('Password can not be updated correctly due to an invalid email', async () => {
        let mockDB = {GetPrivateUserInfo: jest.fn(), UpdateUserRegistry: jest.fn()};
        mockDB.GetPrivateUserInfo.mockReturnValueOnce({email: 'bad' + FAKE_EMAIL, password: FAKE_PASSWORD});
        let service = new UserService(mockDB, null);
        let result = {passed: false, status: 200};
        try {
            await service.UpdateUserPassword({email: FAKE_EMAIL, password: FAKE_PASSWORD});
        } catch (e) {
            result.passed = true;
            result.status = e.status;
        }
        expect(mockDB.GetPrivateUserInfo.mock.calls.length).toBe(1);
        expect(mockDB.UpdateUserRegistry.mock.calls.length).toBe(0);
        expect(mockDB.GetPrivateUserInfo.mock.calls[0][0]).toBe(FAKE_EMAIL);
        expect(result.passed).toBe(true);
        expect(result.status).toBe(400);
    });

    test('User is removed correctly', async () => {
        let mockDB = {GetPrivateUserInfo: jest.fn(), DeleteUser: jest.fn()};
        mockDB.GetPrivateUserInfo.mockReturnValueOnce({email: FAKE_EMAIL, password: FAKE_PASSWORD});
        let service = new UserService(mockDB, null);
        await service.RemoveUser({email: FAKE_EMAIL, password: FAKE_PASSWORD});
        expect(mockDB.GetPrivateUserInfo.mock.calls.length).toBe(1);
        expect(mockDB.DeleteUser.mock.calls.length).toBe(1);
    });

    test('User can not be removed correctly due to an invalid email', async () => {
        let mockDB = {GetPrivateUserInfo: jest.fn(), DeleteUser: jest.fn()};
        mockDB.GetPrivateUserInfo.mockReturnValueOnce({email: 'bad' + FAKE_EMAIL, password: FAKE_PASSWORD});
        let service = new UserService(mockDB, null);
        await service.RemoveUser({email: FAKE_EMAIL, password: FAKE_PASSWORD});
        expect(mockDB.GetPrivateUserInfo.mock.calls.length).toBe(1);
        expect(mockDB.GetPrivateUserInfo.mock.calls[0][0]).toBe(FAKE_EMAIL);
        expect(mockDB.DeleteUser.mock.calls.length).toBe(1);
    });

    test('sender of email to recover password', async () => {
        let sender = {sendMail: jest.fn()};
        let mockDB = {GetUserInfo: jest.fn()};
        mockDB.GetUserInfo.mockReturnValueOnce({email: 'bad' + FAKE_EMAIL, password: FAKE_PASSWORD});
        let service = new UserService(mockDB, sender);
        await service.SendTokenToRetry(FAKE_EMAIL);
        expect(mockDB.GetUserInfo.mock.calls.length).toBe(1);
        expect(mockDB.GetUserInfo.mock.calls[0][0]).toBe(FAKE_EMAIL);
        expect(sender.sendMail.mock.calls.length).toBe(1);
    });

    test('service block user delegates responsibility onto the db layer', async () => {
        let mockDB = {SetBlocked: jest.fn()};
        let service = new UserService(mockDB, null);
        await service.BlockUser(FAKE_EMAIL);
    });

    test('service unblock user delegates responsibility onto the db layer', async () => {
        let mockDB = {SetBlocked: jest.fn()};
        let service = new UserService(mockDB, null);
        await service.UnblockUser(FAKE_EMAIL);
    });

    test('service get batch user delegates responsibility onto the db layer', async () => {
        let mockDB = {GetBatchUsers: jest.fn()};
        let service = new UserService(mockDB, null);
        await service.GetBatchUsers(FAKE_EMAIL);
    });

    test('Get all users clear filters that are empty', async () => {
        let filters = {};
        let mockDB = {
            GetUsers: jest.fn((data) => {
                filters.data = data;
            })
        };
        let service = new UserService(mockDB, null);
        await service.GetAllUsers({blocked: false});
        let finalQuery = filters.data;
        expect(finalQuery.length).toBe(3);
    });

    test('service set admin user delegates responsibility onto the db layer', async () => {
        let mockDB = {SetAdmin: jest.fn()};
        let service = new UserService(mockDB, null);
        await service.SetAdmin(3);
        expect(mockDB.SetAdmin).toBeCalled();
    });

    test('if existing token then update it', async () => {
        let mockDB = {GetToken: jest.fn().mockReturnValueOnce(true), UpdateToken: jest.fn(), SetToken: jest.fn()};
        let service = new UserService(mockDB, null);
        await service.SetToken(3);
        expect(mockDB.SetToken).toBeCalledTimes(0);
        expect(mockDB.UpdateToken).toBeCalled();
    });

    test('if not existing token then create it', async () => {
        let mockDB = {GetToken: jest.fn().mockReturnValueOnce(false), UpdateToken: jest.fn(), SetToken: jest.fn()};
        let service = new UserService(mockDB, null);
        await service.SetToken(3);
        expect(mockDB.UpdateToken).toBeCalledTimes(0);
        expect(mockDB.SetToken).toBeCalled();
    });

    test('if subscription is the same to upgrade then throws error', async () => {
        let s = 'some subs';
        let mockDB = {GetUserInfo: jest.fn().mockReturnValueOnce({subscription: s})};
        let service = new UserService(mockDB, null);
        let e = {status: 418};
        let ok = true;
        try {
            await service.UpgradeUser(3, s);
        } catch (er) {
            e = er;
            ok = false;
        }
        expect(e.status).toBe(400);
        expect(ok).toBeFalsy();
    });

    test('if downgrade then only downgrades', async () => {
        const someResponse = 'some response';
        let mockDB = {
            updateSubscription: jest.fn(),
            SetWaiting: jest.fn(),
            GetUserInfo: jest.fn().mockReturnValueOnce({subscription: 'platinum'})
        };
        let coursesClient = {sendNotification: jest.fn(() => Promise.resolve())};
        let paymentsClient = {deposit: jest.fn().mockReturnValueOnce(someResponse)};
        let service = new UserService(mockDB, null, paymentsClient, coursesClient);
        let res = await service.UpgradeUser(3, 'free');
        expect(res === someResponse).toBeFalsy();
        expect(coursesClient.sendNotification).toBeCalled();
        expect(paymentsClient.deposit).toBeCalledTimes(0);
    });

    test('if upgrade then delegates the rest to deposit', async () => {
        const someResponse = 'some response';
        let mockDB = {
            updateSubscription: jest.fn(),
            SetWaiting: jest.fn(),
            GetUserInfo: jest.fn().mockReturnValueOnce({subscription: 'free'})
        };
        let coursesClient = {sendNotification: jest.fn(() => Promise.resolve())};
        let paymentsClient = {deposit: jest.fn().mockReturnValueOnce(someResponse)};
        let service = new UserService(mockDB, null, paymentsClient, coursesClient);
        let res = await service.UpgradeUser(3, 'platinum');
        expect(res === someResponse).toBeTruthy();
        expect(paymentsClient.deposit).toBeCalled();
        expect(coursesClient.sendNotification).toBeCalledTimes(0);
    });

    test('finish upgrade update subscription if status is correct', async () => {
        let mockDB = {
            updateSubscription: jest.fn(() => Promise.resolve()),
            removeSubscription: jest.fn(() => Promise.resolve()),
            getSubs: jest.fn().mockReturnValueOnce({})
        };
        let coursesClient = {sendNotification: jest.fn(() => Promise.resolve())};
        let service = new UserService(mockDB, null, null, coursesClient);
        await service.finishUpgrade(true, 'jsjfdahsj');
        expect(coursesClient.sendNotification).toBeCalledTimes(1);
        expect(mockDB.updateSubscription).toBeCalled();
    });

    test('finish upgrade do not update subscription if status is incorrect', async () => {
        let mockDB = {
            updateSubscription: jest.fn(() => Promise.resolve()),
            removeSubscription: jest.fn(() => Promise.resolve()),
            getSubs: jest.fn().mockReturnValueOnce({})
        };
        let coursesClient = {sendNotification: jest.fn(() => Promise.resolve())};
        let service = new UserService(mockDB, null, null, coursesClient);
        await service.finishUpgrade(false, 'jsjfdahsj');
        expect(coursesClient.sendNotification).toBeCalledTimes(1);
        expect(mockDB.updateSubscription).toBeCalledTimes(0);
    });
});