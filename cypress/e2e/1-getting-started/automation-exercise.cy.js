import userTemplate from '../../fixtures/user.json';

const product = { id: 1, name: 'Blue Top', price: 500 };

function openLogin() {
    cy.get('#header a[href="/login"]').click();
    cy.location('pathname').should('eq', '/login');
}

function openProducts() {
    cy.get('#header a[href="/products"]').click();
    cy.location('pathname').should('eq', '/products');
    cy.contains('.features_items h2', 'All Products').should('be.visible');
}

function checkAddress(selector, user) {
    cy.get(selector).should('be.visible').within(() => {
        cy.get('.address_firstname.address_lastname').should('have.text', `Mr. ${user.firstname} ${user.lastname}`);
        cy.get('.address_address1.address_address2').then(($lines) => {
            expect($lines.toArray().map((line) => line.textContent.trim())).to.deep.equal([
                user.company, user.address1, user.address2,
            ]);
        });
        cy.get('.address_city.address_state_name.address_postcode').invoke('text').then((text) => {
            expect(text.replace(/\s+/g, ' ').trim()).to.equal(`${user.city} ${user.state} ${user.zipcode}`);
        });
        cy.get('.address_country_name').should('have.text', user.country);
        cy.get('.address_phone').should('have.text', user.mobile_number);
    });
}

function placeOrder(user) {
    cy.get(`.features_items .productinfo [data-product-id="${product.id}"]`).should('have.length', 1).click();
    cy.get('#cartModal').should('be.visible').within(() => {
        cy.contains('Added!').should('be.visible');
        cy.contains('button', 'Continue Shopping').click();
    });
    cy.get('#cartModal').should('not.be.visible');
    cy.get('#header a[href="/view_cart"]').click();
    cy.location('pathname').should('eq', '/view_cart');
    cy.get(`#product-${product.id}`).should('be.visible').within(() => {
        cy.get('.cart_description').should('contain.text', product.name);
        cy.get('.cart_price').should('contain.text', `Rs. ${product.price}`);
        cy.get('.cart_quantity button').should('have.text', '1');
        cy.get('.cart_total_price').should('have.text', `Rs. ${product.price}`);
    });
    cy.contains('a', 'Proceed To Checkout').click();
    cy.location('pathname').should('eq', '/checkout');
    cy.contains('h2', 'Address Details').should('be.visible');
    checkAddress('#address_delivery', user);
    checkAddress('#address_invoice', user);
    cy.contains('h2', 'Review Your Order').should('be.visible');
    cy.get(`#product-${product.id}`).within(() => {
        cy.get('.cart_description').should('contain.text', product.name);
        cy.get('.cart_quantity button').should('have.text', '1');
        cy.get('.cart_total_price').should('have.text', `Rs. ${product.price}`);
    });
    cy.contains('tr', 'Total Amount').find('.cart_total_price').should('have.text', `Rs. ${product.price}`);
    cy.get('#ordermsg textarea[name="message"]').type('Pedido automatizado de teste PGATS.');
    cy.contains('a', 'Place Order').click();
    cy.location('pathname').should('eq', '/payment');
    cy.getByQa('name-on-card').type(`${user.firstname} ${user.lastname}`);
    cy.getByQa('card-number').type('4111111111111111', { log: false });
    cy.getByQa('cvc').type('123', { log: false });
    cy.getByQa('expiry-month').type('12');
    cy.getByQa('expiry-year').type('2030');
    cy.getByQa('pay-button').click();
    cy.location('pathname').should('match', /^\/payment_done\/\d+$/);
    cy.getByQa('order-placed').should('be.visible').and('contain.text', 'Order Placed!');
    cy.contains('p', 'Congratulations! Your order has been confirmed!').should('be.visible');
    cy.deleteAccountThroughUi();
}

describe('Automation Exercise - casos oficiais', () => {
    let user;
    let needsCleanup;

    beforeEach(() => {
        user = { ...userTemplate, email: `qa.${Date.now()}.${Cypress._.random(100000, 999999)}@example.com` };
        needsCleanup = false;
        cy.intercept({ url: /https?:\/\/([^/]+\.)?(doubleclick\.net|googlesyndication\.com|googleadservices\.com)\// }, {
            statusCode: 204, body: '',
        });
    });

    afterEach(() => {
        if (needsCleanup) cy.deleteAccount(user);
    });

    function visitHome() {
        cy.visit('/');
        cy.location('pathname').should('eq', '/');
        cy.get('#header .logo img').should('be.visible');
        cy.get('#slider').should('be.visible');
        cy.contains('.features_items h2', 'Features Items').should('be.visible');
    }

    function prepareAccount() {
        needsCleanup = true;
        cy.createAccount(user);
    }

    it('CT01 - cadastrar usuario e excluir a conta', () => {
        visitHome();
        openLogin();
        needsCleanup = true;
        cy.registerAccount(user);
        cy.deleteAccountThroughUi();
    });

    it('CT02 - entrar com email e senha corretos', () => {
        prepareAccount();
        visitHome();
        openLogin();
        cy.login(user);
        cy.deleteAccountThroughUi();
    });

    it('CT03 - rejeitar email e senha incorretos', () => {
        visitHome();
        openLogin();
        cy.contains('.login-form h2', 'Login to your account').should('be.visible');
        cy.getByQa('login-email').type(user.email);
        cy.getByQa('login-password').type('Senha-Incorreta!', { log: false });
        cy.getByQa('login-button').click();
        cy.contains('.login-form p', 'Your email or password is incorrect!').should('be.visible');
        cy.location('pathname').should('eq', '/login');
        cy.get('#header a[href="/logout"]').should('not.exist');
    });

    it('CT04 - sair da conta autenticada', () => {
        prepareAccount();
        visitHome();
        openLogin();
        cy.login(user);
        cy.get('#header a[href="/logout"]').click();
        cy.location('pathname').should('eq', '/login');
        cy.contains('.login-form h2', 'Login to your account').should('be.visible');
        cy.get('#header a[href="/logout"]').should('not.exist');
        cy.contains('#header a', `Logged in as ${user.name}`).should('not.exist');
    });

    it('CT05 - rejeitar cadastro com email existente', () => {
        prepareAccount();
        visitHome();
        openLogin();
        cy.contains('.signup-form h2', 'New User Signup!').should('be.visible');
        cy.getByQa('signup-name').type(user.name);
        cy.getByQa('signup-email').type(user.email);
        cy.getByQa('signup-button').click();
        cy.contains('.signup-form p', 'Email Address already exist!').should('be.visible');
        cy.location('pathname').should('eq', '/signup');
    });

    it('CT08 - listar produtos e verificar detalhes do primeiro', () => {
        visitHome();
        openProducts();
        cy.get('.features_items .product-image-wrapper').should('have.length.greaterThan', 0)
            .each(($card) => cy.wrap($card).should('be.visible'));
        cy.get('.features_items .choose a').first().click();
        cy.location('pathname').should('eq', `/product_details/${product.id}`);
        cy.get('.product-information').should('be.visible').within(() => {
            cy.get('h2').should('have.text', product.name);
            cy.contains('p', 'Category: Women > Tops').should('be.visible');
            cy.contains('span', `Rs. ${product.price}`).should('be.visible');
            cy.contains('p', 'Availability: In Stock').should('be.visible');
            cy.contains('p', 'Condition: New').should('be.visible');
            cy.contains('p', 'Brand: Polo').should('be.visible');
        });
    });

    it('CT09 - pesquisar e exibir todos os produtos relacionados', () => {
        visitHome();
        openProducts();
        cy.request('/api/productsList').then(({ status, body }) => {
            expect(status).to.equal(200);
            const catalog = typeof body === 'string' ? JSON.parse(body) : body;
            expect(catalog.responseCode).to.equal(200);
            const expectedNames = catalog.products
                .filter((item) => [item.name, item.category.category]
                    .some((value) => value.toLowerCase().includes('top')))
                .map((item) => item.name);
            expect(expectedNames, 'produtos do catalogo relacionados a top').not.to.be.empty;
            cy.get('#search_product').type('top');
            cy.get('#submit_search').click();
            cy.contains('.features_items h2', 'Searched Products').should('be.visible');
            cy.get('.features_items .productinfo p').should(($results) => {
                const actualNames = $results.toArray().map((element) => element.textContent.trim());
                expect(actualNames).to.have.members(expectedNames);
                expect(actualNames).to.have.length(expectedNames.length);
            }).each(($name) => cy.wrap($name).should('be.visible'));
        });
    });

    it('CT10 - realizar inscricao na pagina inicial', () => {
        visitHome();
        cy.get('#footer').scrollIntoView();
        cy.contains('#footer h2', 'Subscription').should('be.visible');
        cy.get('#susbscribe_email').type(user.email);
        cy.get('#subscribe').click();
        cy.get('#success-subscribe').should('be.visible')
            .and('contain.text', 'You have been successfully subscribed!');
    });

    it('CT15 - cadastrar antes do checkout e concluir pedido', () => {
        visitHome();
        openLogin();
        needsCleanup = true;
        cy.registerAccount(user);
        placeOrder(user);
    });

    it('CT16 - entrar antes do checkout e concluir pedido', () => {
        prepareAccount();
        visitHome();
        openLogin();
        cy.login(user);
        placeOrder(user);
    });
});