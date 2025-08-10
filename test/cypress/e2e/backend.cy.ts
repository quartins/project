describe("Backend API Tests", () => {
  const baseUrl = "http://localhost:3000";
  let createdSubjectId: number | undefined;
  let createdTaskId: number | undefined;
  let token: string = "";

  //1  POST /auth/signup
  it("should signup successfully", () => {
    cy.request({
      method: "POST",
      url: `${baseUrl}/auth/signup`,
      body: {
        name: "Test User",
        email: `test_${Date.now()}@example.com`,
        password: "123456",
      },
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body).to.have.property("message", "Signup successful");
      expect(res.body.user).to.include.keys("id", "name", "email");
    });
  });

  //2  POST /auth/login
  it("should login successfully", () => {
    cy.request({
      method: "POST",
      url: `${baseUrl}/auth/login`,
      body: {
        email: "furnis@example.com",
        password: "2004",
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("token");
      expect(res.body.user).to.include.keys("id", "name", "email");
      token = res.body.token; // เก็บ token
    });
  });

  //3 GET /auth/users
  it("should get all users", () => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/auth/users`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
    });
  });

  //4 GET /subjects
  it("should get all subjects", () => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/subjects`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
    });
  });

  //5 GET /tasks
  it("should get all tasks", () => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/tasks`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
    });
  });

});

describe("Subject API Tests", () => {
  const baseUrl = Cypress.env("BACKEND_URL") || "http://localhost:3000";
  let token = "";
  let createdSubjectId: number;

  before(() => {
    // login เพื่อเก็บ token ไว้ใช้
    cy.request({
      method: "POST",
      url: `${baseUrl}/auth/login`,
      body: { email: "mark199@gmail.com", password: "1234" },
    }).then((res) => {
      token = res.body.token;
    });
  });

  it("creates a new subject", () => {
    cy.request({
      method: "POST",
      url: `${baseUrl}/subjects`,
      headers: { Authorization: `Bearer ${token}` },
      body: { name: "Physical" },
    }).then((res) => {
      expect([200, 201]).to.include(res.status);
      createdSubjectId = res.body.id;
    });
  });

  it("updates the subject", () => {
    cy.request({
      method: "PUT",
      url: `${baseUrl}/subjects/${createdSubjectId}`,
      headers: { Authorization: `Bearer ${token}` },
      body: { name: "Math" },
    }).then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  it("gets all subjects and checks the updated one", () => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/subjects`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      const found = res.body.find((s: any) => s.id === createdSubjectId);
      expect(found).to.exist;
      expect(found.name).to.eq("Math");
    });
  });

  it("deletes the subject", () => {
    cy.request({
      method: "DELETE",
      url: `${baseUrl}/subjects/${createdSubjectId}`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
    });
  });
});


describe("Task API Tests", () => {
  const baseUrl = Cypress.env("BACKEND_URL") || "http://localhost:3000";
  let token = "";
  let createdTaskId: number;
  let createdSubjectId: number;

  before(() => {
    // login เพื่อเก็บ token ไว้ใช้
    cy.request({
      method: "POST",
      url: `${baseUrl}/auth/login`,
      body: { email: "mark199@gmail.com", password: "1234" },
    }).then((res) => {
      token = res.body.token;
    });
  });

  before(() => {
    // สร้าง subject ก่อน เพื่อผูกกับ task
    cy.request({
      method: "POST",
      url: `${baseUrl}/subjects`,
      headers: { Authorization: `Bearer ${token}` },
      body: { name: "Subject for Task" },
    }).then((res) => {
      expect([200, 201]).to.include(res.status);
      createdSubjectId = res.body.id;
    });
  });

  it("creates a new task", () => {
    cy.request({
      method: "POST",
      url: `${baseUrl}/tasks`,
      headers: { Authorization: `Bearer ${token}` },
      body: {
        title: "Test Task",
        subjectId: createdSubjectId,
        description: "Task description",
        dueDate: "2025-12-31",
        status: "pending",
      },
    }).then((res) => {
      expect([200, 201]).to.include(res.status);
      createdTaskId = res.body.id;
    });
  });

  it("updates the task", () => {
    cy.request({
      method: "PUT",
      url: `${baseUrl}/tasks/${createdTaskId}`,
      headers: { Authorization: `Bearer ${token}` },
      body: { title: "Updated Task Title" },
    }).then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  it("gets all tasks and checks the updated one", () => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/tasks`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      const found = res.body.find((t: any) => t.id === createdTaskId);
      expect(found).to.exist;
      expect(found.title).to.eq("Updated Task Title");
    });
  });

  it("deletes the task", () => {
    cy.request({
      method: "DELETE",
      url: `${baseUrl}/tasks/${createdTaskId}`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  after(() => {
    // ลบ subject ที่สร้างไว้ตอนต้น (cleanup)
    cy.request({
      method: "DELETE",
      url: `${baseUrl}/subjects/${createdSubjectId}`,
      headers: { Authorization: `Bearer ${token}` },
    });
  });
});
