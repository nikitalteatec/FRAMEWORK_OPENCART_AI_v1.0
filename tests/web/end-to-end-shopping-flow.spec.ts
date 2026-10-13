/**
 * Test Case: OpenCart end-to-end shopping flow
 *
 * Tags: @master @sanity @regression @web
 *
 * Steps:
 * 1) Register a new customer
 * 2) Log out
 * 3) Log in with the newly created account
 * 4) Search for MacBook
 * 5) Add the product to the cart
 * 6) Validate cart details
 */

import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';
import { Helper } from '../../utils/helper';

test('OpenCart end-to-end shopping flow test @master @sanity @regression @web', async ({
    homePage,
    registerPage,
    accountPage,
    loginPage,
    productPage,
    cartPage,
}) => {
    const productDetails = Helper.getProductDetails();
    const customer = {
        firstName: RandomDataUtil.getFirstName(),
        lastName: RandomDataUtil.getLastName(),
        email: `${Date.now()}_${RandomDataUtil.getUsername().replace(/[^a-zA-Z0-9]/g, '')}@example.com`,
        telephone: RandomDataUtil.getPhoneNumber().replace(/[^0-9]/g, '').slice(0, 10),
        password: 'Pass@123',
    };

    await test.step('1) Register a new customer', async () => {
        await homePage.openRegisterPage();
        expect(await registerPage.isRegisterPageVisible()).toBeTruthy();
        await registerPage.registerCustomer(customer);
        expect(await accountPage.isAccountCreatedVisible()).toBeTruthy();
    });

    await test.step('2) Log out', async () => {
        await accountPage.logout();
    });

    await test.step('3) Log in again using the created credentials', async () => {
        await homePage.openLoginPage();
        expect(await loginPage.isLoginPageVisible()).toBeTruthy();
        await loginPage.login(customer.email, customer.password);
        expect(await accountPage.isMyAccountPageVisible()).toBeTruthy();
    });

    await test.step('4) Search for a known product', async () => {
        await homePage.goto();
        await homePage.searchProduct(productDetails.productName);
        await productPage.openProductFromSearch(productDetails.productName);
        expect(await productPage.isProductPageVisible(productDetails.productName)).toBeTruthy();
    });

    await test.step('5) Add the product to the cart', async () => {
        await productPage.addProductToCart(Number(productDetails.productQuantity));
    });

    await test.step('6) Validate the product and cart totals', async () => {
        await cartPage.openCart();
        expect(await cartPage.isCartPageVisible()).toBeTruthy();
        expect(await cartPage.getProductName()).toContain(productDetails.productName);
        expect(await cartPage.getProductQuantity()).toBe(productDetails.productQuantity);
        expect(await cartPage.getProductPrice()).toBe(productDetails.totalPrice);
        expect(await cartPage.getCartTotal()).toBe(productDetails.totalPrice);
    });

    console.log('✅ End-to-end shopping flow completed successfully!');
});
