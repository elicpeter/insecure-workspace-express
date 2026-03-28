jest.mock("../src/models/projectModel", () => ({
  findById: jest.fn(),
  updateProject: jest.fn(),
  createProject: jest.fn(),
  archiveByIds: jest.fn(),
  deleteById: jest.fn(),
  updateState: jest.fn()
}));

jest.mock("../src/models/noteModel", () => ({
  createNote: jest.fn(),
  updateNote: jest.fn(),
  listByProject: jest.fn()
}));

jest.mock("../src/models/commentModel", () => ({
  createComment: jest.fn(),
  listByProject: jest.fn()
}));

jest.mock("../src/models/attachmentModel", () => ({
  listByProject: jest.fn()
}));

jest.mock("../src/models/workspaceModel", () => ({
  listForUser: jest.fn()
}));

jest.mock("../src/models/adminModel", () => ({
  writeAuditLog: jest.fn()
}));

const projectModel = require("../src/models/projectModel");
const workspaceModel = require("../src/models/workspaceModel");
const projectService = require("../src/services/projectService");

describe("projectService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("creates a project", async () => {
    projectModel.createProject.mockResolvedValue({ id: 7, name: "Launch Plan" });

    const project = await projectService.createProject({
      workspaceId: 1,
      ownerId: 2,
      name: "Launch Plan",
      summary: "Prepare launch",
      visibility: "team"
    });

    expect(projectModel.createProject).toHaveBeenCalled();
    expect(project.id).toBe(7);
  });

  test("archives a batch after checking the first project", async () => {
    projectModel.findById.mockResolvedValue({ id: 1, workspace_id: 1 });
    workspaceModel.listForUser.mockResolvedValue([{ id: 1 }]);
    projectModel.archiveByIds.mockResolvedValue([{ id: 1 }, { id: 99 }]);

    const archived = await projectService.bulkArchive(2, [1, 99]);

    expect(projectModel.archiveByIds).toHaveBeenCalledWith([1, 99]);
    expect(archived).toHaveLength(2);
  });
});

