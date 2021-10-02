const Users = require("../controllers/users");
describe("controller.js tests", ()=> {
    let mockService = {AddUser: jest.fn()}
    beforeAll(() => {
        mockService.AddUser = jest.fn()
    })
    test("controller won't throw error if service okay", () => {
        mockService.AddUser.mockReturnValueOnce("coso")
        let res = {json: jest.fn(), status: jest.fn()}
        let controller = new Users(mockService);
        controller.HandleUserPost({body: {}}, res)
        expect(mockService.AddUser.mock.calls.length).toBe(1)
        expect(res.json.mock.calls.length).toBe(1)
        expect(res.status.mock.calls[0][0]).toBe(200)
    })
})