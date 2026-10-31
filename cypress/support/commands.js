// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('getByQa', (value) => cy.get(`[data-qa="${value}"]`));

Cypress.Commands.add('createAccount', (user) => {
	return cy.request({ method: 'POST', url: '/api/createAccount', form: true, body: user })
		.then(({ status, body }) => {
			expect(status, 'HTTP da preparacao da conta').to.equal(200);
			const response = typeof body === 'string' ? JSON.parse(body) : body;
			expect(response.responseCode, response.message).to.equal(201);
		});
});

Cypress.Commands.add('deleteAccount', (user) => {
	return cy.request({
		method: 'DELETE', url: '/api/deleteAccount', form: true,
		body: { email: user.email, password: user.password },
	}).then(({ status, body }) => {
		expect(status, 'HTTP da limpeza da conta').to.equal(200);
		const response = typeof body === 'string' ? JSON.parse(body) : body;
		expect(response.responseCode, response.message).to.be.oneOf([200, 404]);
	});
});

Cypress.Commands.add('login', (user) => {
	cy.contains('.login-form h2', 'Login to your account').should('be.visible');
	cy.getByQa('login-email').type(user.email);
	cy.getByQa('login-password').type(user.password, { log: false });
	cy.getByQa('login-button').click();
	cy.contains('#header a', `Logged in as ${user.name}`).should('be.visible');
});

Cypress.Commands.add('registerAccount', (user) => {
	cy.contains('.signup-form h2', 'New User Signup!').should('be.visible');
	cy.getByQa('signup-name').type(user.name);
	cy.getByQa('signup-email').type(user.email);
	cy.getByQa('signup-button').click();
	cy.contains('h2', 'Enter Account Information', { matchCase: false }).should('be.visible');
	cy.get('#id_gender1').check();
	cy.getByQa('name').should('have.value', user.name);
	cy.getByQa('email').should('have.value', user.email);
	cy.getByQa('password').type(user.password, { log: false });
	cy.getByQa('days').select(user.birth_date);
	cy.getByQa('months').select(user.birth_month);
	cy.getByQa('years').select(user.birth_year);
	cy.get('#newsletter').check().should('be.checked');
	cy.get('#optin').check().should('be.checked');
	cy.getByQa('first_name').type(user.firstname);
	cy.getByQa('last_name').type(user.lastname);
	cy.getByQa('company').type(user.company);
	cy.getByQa('address').type(user.address1);
	cy.getByQa('address2').type(user.address2);
	cy.getByQa('country').select(user.country);
	cy.getByQa('state').type(user.state);
	cy.getByQa('city').type(user.city);
	cy.getByQa('zipcode').type(user.zipcode);
	cy.getByQa('mobile_number').type(user.mobile_number);
	cy.getByQa('create-account').click();
	cy.getByQa('account-created').should('be.visible').and('contain.text', 'Account Created!');
	cy.getByQa('continue-button').click();
	cy.contains('#header a', `Logged in as ${user.name}`).should('be.visible');
});

Cypress.Commands.add('deleteAccountThroughUi', () => {
	cy.get('#header a[href="/delete_account"]').click();
	cy.getByQa('account-deleted').should('be.visible').and('contain.text', 'Account Deleted!');
	cy.getByQa('continue-button').click();
	cy.location('pathname').should('eq', '/');
});