jest.mock("../src/models/userModel", () => ({
  findByEmail: jest.fn(),
  createUser: jest.fn()
}));

jest.mock("../src/models/adminModel", () => ({
  writeAuditLog: jest.fn()
}));

const userModel = require("../src/models/userModel");
const adminModel = require("../src/models/adminModel");
const authService = require("../src/services/authService");
const { hashPassword } = require("../src/utils/passwords");

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("registers a new user", async () => {
    userModel.findByEmail.mockResolvedValue(null);
    userModel.createUser.mockResolvedValue({
      id: 10,
      email: "new@demo.test",
      full_name: "New Person",
      role: "user"
    });

    const user = await authService.register({
      email: "new@demo.test",
      fullName: "New Person",
      password: "pass123"
    });

    expect(userModel.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "new@demo.test",
        passwordHash: hashPassword("pass123")
      })
    );
    expect(adminModel.writeAuditLog).toHaveBeenCalled();
    expect(user.email).toBe("new@demo.test");
  });

  test("authenticates a valid login", async () => {
    userModel.findByEmail.mockResolvedValue({
      id: 2,
      email: "alice@demo.test",
      password_hash: hashPassword("alice123")
    });

    const user = await authService.login({
      email: "alice@demo.test",
      password: "alice123"
    });

    expect(user.id).toBe(2);
  });
});

