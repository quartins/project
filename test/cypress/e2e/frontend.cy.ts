describe("Frontend Auth Tests", () => {
  const baseUrl = Cypress.env("FRONTEND_URL") || "http://localhost:5173";

  it("visits signup page", () => {
    cy.visit(`${baseUrl}/signup`);
    cy.contains("Signup"); 

  });

  it("visits login page", () => {
    cy.visit(`${baseUrl}/login`);
    cy.contains("Login");
  });
 
});

describe("Frontend Auth Tests", () => {
  const baseUrl = Cypress.env("FRONTEND_URL") || "http://localhost:5173";

  it("visits signup page and fills form", () => {
    cy.visit(`${baseUrl}/signup`);
    cy.contains("Signup");

    cy.get('input[placeholder="Name"]').type("Test User");
    cy.get('input[placeholder="Email"]').type(`test${Date.now()}@example.com`);
    cy.get('input[placeholder="Password"]').type("123456");

    cy.get('button').contains("Signup").click();

    cy.url().should("include", "/task"); // สมมติ redirect ไป todo page
  });

  it("visits login page and fills form", () => {
    cy.visit(`${baseUrl}/login`);
    cy.contains("Login");

    cy.get('input[placeholder="Email"]').type("furnis@example.com");
    cy.get('input[placeholder="Password"]').type("2004");

    cy.get('button').contains("Login").click();

    cy.url().should("include", "/task");
  });
});

describe("Frontend Add Subject Tests", () => {
  const baseUrl = Cypress.env("FRONTEND_URL") || "http://localhost:5173";
  let savedToken: string;

  before(() => {
    cy.visit(`${baseUrl}/login`);
    cy.get('input[placeholder="Email"]').type("furnis@example.com");
    cy.get('input[placeholder="Password"]').type("2004");
    cy.get('button').contains("Login").click();

    cy.url().should("include", "/task");

    cy.window().then((win) => {
      const token = win.localStorage.getItem("token");
      expect(token).to.exist;
      savedToken = token!;
    });
  });

  beforeEach(() => {
    cy.visit(`${baseUrl}/task`, {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", savedToken);
      }
    });
  });

  it("adds a new subject successfully", () => {
    const newSubject = "Mathematics";

    cy.get('input[placeholder="Subject name"]').should("be.visible").type(newSubject);
    cy.get('button').contains("Add").click();

    cy.get('input[placeholder="Subject name"]').should("have.value", "");
    cy.get(".error-message").should("not.exist");
    cy.contains(newSubject);
  });

  it("shows error when adding empty subject", () => {
    cy.get('input[placeholder="Subject name"]').clear();
    cy.get('button').contains("Add").click();
    cy.get(".error-message").should("contain.text", "Please enter a subject name");
  });
});
