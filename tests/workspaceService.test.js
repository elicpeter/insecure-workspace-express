jest.mock("../src/models/workspaceModel", () => ({
  createWorkspace: jest.fn(),
  addMembership: jest.fn(),
  findById: jest.fn(),
  listMembers: jest.fn(),
  listInvitations: jest.fn(),
  listForUser: jest.fn()
}));

jest.mock("../src/models/invitationModel", () => ({
  createInvitation: jest.fn(),
  findByToken: jest.fn(),
  markAccepted: jest.fn()
}));

jest.mock("../src/models/projectModel", () => ({
  listByWorkspace: jest.fn()
}));

jest.mock("../src/models/exportJobModel", () => ({
  listByWorkspace: jest.fn()
}));

const workspaceModel = require("../src/models/workspaceModel");
const invitationModel = require("../src/models/invitationModel");
const workspaceService = require("../src/services/workspaceService");

describe("workspaceService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("creates a workspace and owner membership", async () => {
    workspaceModel.createWorkspace.mockResolvedValue({ id: 9, name: "Acorn" });
    workspaceModel.addMembership.mockResolvedValue({ id: 1 });

    const workspace = await workspaceService.createWorkspace({
      name: "Acorn",
      slug: "acorn",
      ownerId: 2,
      billingEmail: "billing@demo.test"
    });

    expect(workspaceModel.createWorkspace).toHaveBeenCalled();
    expect(workspaceModel.addMembership).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: 9,
        userId: 2,
        role: "owner"
      })
    );
    expect(workspace.id).toBe(9);
  });

  test("accepts an invite for the current user", async () => {
    invitationModel.findByToken.mockResolvedValue({
      id: 4,
      workspace_id: 1,
      invited_by: 2,
      requested_role: "member"
    });
    workspaceModel.addMembership.mockResolvedValue({ id: 5 });
    invitationModel.markAccepted.mockResolvedValue({ id: 4, accepted: true });

    await workspaceService.acceptInvitation({
      token: "join-acorn-12345",
      currentUser: { id: 3, email: "bob@demo.test" }
    });

    expect(workspaceModel.addMembership).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: 1,
        userId: 3,
        role: "member"
      })
    );
  });
});

