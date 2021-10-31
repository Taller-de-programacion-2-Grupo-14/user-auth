/*global describe jest test expect beforeEach*/
const firebase = require('../controllers/firebase');
describe('firebase.js tests', () => {
    let mockDB = {GetPrivateUserInfo: jest.fn()};
    beforeEach(() => {
        mockDB = {GetPrivateUserInfo: jest.fn()};
    });
    test('Firebase will return false if user exists', async () => {
        mockDB.GetPrivateUserInfo.mockReturnValueOnce({email: 'someEmail', password: 'somePassword'});
        let res = {json: jest.fn(), status: jest.fn()};
        let controller = new firebase(mockDB);
        let result = await controller.ProcessFirebaseInfoNecessary({body: {email: 'someEmail', displayName: 'pepito popote'}}, res);
        expect(mockDB.GetPrivateUserInfo.mock.calls.length).toBe(1);
        expect(res.json.mock.calls.length).toBe(0);
        expect(result).toBe(false);
    });

    test('Firebase will return true if user doesn\'t exist', async () => {
        mockDB.GetPrivateUserInfo.mockReturnValueOnce(undefined);
        let res = {json: jest.fn(), status: jest.fn()};
        let controller = new firebase(mockDB);
        let result = await controller.ProcessFirebaseInfoNecessary({body: {email: 'someEmail', displayName: 'pepito popote'}}, res);
        expect(mockDB.GetPrivateUserInfo.mock.calls.length).toBe(1);
        expect(res.json.mock.calls.length).toBe(0);
        expect(result).toBe(true);
    });
});