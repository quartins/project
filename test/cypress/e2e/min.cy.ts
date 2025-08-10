describe('template spec', () => {
  it('passes', () => {
    cy.visit('https://example.cypress.io')
  })
})


describe("another test", ()=>{
  it("check google", ()=>{
    cy.visit("https://google.com")
  })
})

describe("Backend",()=>{
  it("check response", ()=>{
    const url ="http://localhost:3000/auth"
    cy.request({
      method: "POST" ,
      url: `${url}/login`,
      body: {
        email: "furnis@example.com",
        password: "2004"
      },
    })
  })
})