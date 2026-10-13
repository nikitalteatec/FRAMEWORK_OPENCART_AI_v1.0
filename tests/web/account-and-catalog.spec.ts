/**
 * Test Case: OpenCart account and catalog flows
 *
 * Tags: @master @sanity @regression @web
 */

import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';
import { Helper } from '../../utils/helper';

test('User registration flow @master @sanity @regression @web', async ({
    homePage,
    registerPage,
    accountPage,
}) => {
    const customer = {
        firstName: RandomDataUtil.getFirstName(),
        lastName: RandomDataUtil.getLastName(),
        email: `${Date.now()}_${RandomDataUtil.getUsername().replace(/[^a-zA-Z0-9]/g, '')}@example.com`,
        telephone: RandomDataUtil.getPhoneNumber().replace(/[^0-9]/g, '').slice(0, 10),
        password: 'Pass@123',
    };

    await test.step('1) Open My Account and navigate to Register', async () => {
        await homePage.clickRegister();
        expect(await registerPage.isRegisterPageVisible()).toBeTruthy();
    });

    await test.step('2) Register a new customer and verify the confirmation', async () => {
        await registerPage.registerCustomer(customer);
        expect(await accountPage.isAccountCreatedVisible()).toBeTruthy();
        expect(await accountPage.hasLogoutOption()).toBeTruthy();
    });

    console.log('✅ Customer registration flow completed successfully!');
});

test('Valid customer login flow @master @sanity @regression @web', async ({
    homePage,
    registerPage,
    loginPage,
    accountPage,
}) => {
    const customer = {
        firstName: RandomDataUtil.getFirstName(),
        lastName: RandomDataUtil.getLastName(),
        email: `${Date.now()}_${RandomDataUtil.getUsername().replace(/[^a-zA-Z0-9]/g, '')}@example.com`,
        telephone: RandomDataUtil.getPhoneNumber().replace(/[^0-9]/g, '').slice(0, 10),
        password: 'Pass@123',
    };

    await test.step('1) Create a valid customer account for this isolated test', async () => {
        await homePage.clickRegister();
        await registerPage.registerCustomer(customer);
        expect(await accountPage.isAccountCreatedVisible()).toBeTruthy();
        await accountPage.logout();
    });

    await test.step('2) Open My Account and navigate to Login', async () => {
        await homePage.clickLogin();
        expect(await loginPage.isLoginPageVisible()).toBeTruthy();
    });

    await test.step('3) Log in and verify the authenticated account area', async () => {
        await loginPage.login(customer.email, customer.password);
        expect(await accountPage.isMyAccountPageVisible()).toBeTruthy();
        expect(await accountPage.hasLogoutOption()).toBeTruthy();
    });

    console.log('✅ Valid customer login flow completed successfully!');
});

test('Invalid customer login flow @master @sanity @regression @web', async ({
    homePage,
    loginPage,
    accountPage,
}) => {
    const invalidEmail = `invalid-${Date.now()}-${RandomDataUtil.getUsername().replace(/[^a-zA-Z0-9]/g, '')}@example.com`;

    await test.step('1) Open the login page and submit invalid credentials', async () => {
        await homePage.clickLogin();
        expect(await loginPage.isLoginPageVisible()).toBeTruthy();
        await loginPage.login(invalidEmail, 'invalid-password');
    });

    await test.step('2) Verify authentication fails and the warning is displayed', async () => {
        expect(await loginPage.isInvalidLoginWarningVisible()).toBeTruthy();
        expect(await accountPage.isLoggedOutNavigationVisible()).toBeTruthy();
    });

    console.log('✅ Invalid customer login was rejected as expected!');
});

test('Customer logout flow @master @sanity @regression @web', async ({
    homePage,
    loginPage,
    accountPage,
}) => {
    const { email, password } = Helper.getLoginDetails();

    await test.step('1) Log in with valid customer credentials', async () => {
        await homePage.clickLogin();
        await loginPage.login(email, password);
        expect(await accountPage.isMyAccountPageVisible()).toBeTruthy();
    });

    await test.step('2) Log out and verify the confirmation page', async () => {
        await accountPage.logout();
        expect(await accountPage.isLogoutConfirmationVisible()).toBeTruthy();
    });

    await test.step('3) Continue to the home page and verify the customer is logged out', async () => {
        await accountPage.continueAfterLogout();
        expect(await homePage.isHomePageVisible()).toBeTruthy();
        expect(await accountPage.isLoggedOutNavigationVisible()).toBeTruthy();
    });

    console.log('✅ Customer logout flow completed successfully!');
});

test('Product search flow @master @sanity @regression @web', async ({
    homePage,
}) => {
    const { productName } = Helper.getProductDetails();

    await test.step('1) Search for the known product', async () => {
        await homePage.searchProduct(productName);
    });

    await test.step('2) Verify the search page and matching product are displayed', async () => {
        expect(await homePage.isProductSearchResultVisible(productName)).toBeTruthy();
    });

    console.log('✅ Product search flow completed successfully!');
});

test('Add product to cart with the requested quantity @master @sanity @regression @web', async ({
    homePage,
    productPage,
    cartPage,
}) => {
    const { productName, productQuantity } = Helper.getProductDetails();

    await test.step('1) Search for the product and open its details', async () => {
        await homePage.searchProduct(productName);
        expect(await homePage.isProductSearchResultVisible(productName)).toBeTruthy();
        await productPage.openProductFromSearch(productName);
        expect(await productPage.isProductPageVisible(productName)).toBeTruthy();
    });

    await test.step('2) Add the selected quantity and verify the success notification', async () => {
        await productPage.addProductToCart(Number(productQuantity));
        expect(await productPage.isProductAddedMessageVisible()).toBeTruthy();
    });

    await test.step('3) Verify the product and quantity in the shopping cart', async () => {
        await cartPage.openCart();
        expect(await cartPage.isCartPageVisible()).toBeTruthy();
        expect(await cartPage.getProductName()).toContain(productName);
        expect(await cartPage.getProductQuantity()).toBe(productQuantity);
    });

    console.log('✅ Add product to cart flow completed successfully!');
});
