/**
 * Test Case: OpenCart login with external test data
 *
 * Tags: @master @datadriven @web
 */

import * as path from 'path';
import { test, expect } from '../../fixtures/pageFixtures';
import { DataProvider } from '../../utils/DataReader';
import { RandomDataUtil } from '../../utils/dataGenerator';

type LoginData = {
    testName: string;
    email: string;
    password: string;
    expected: 'success' | 'failure';
};

const loginData = DataProvider.readJson(path.resolve(__dirname, '../../testdata/opencart_logindata.json')) as LoginData[];

loginData.forEach((data, index) => {
    test(`${data.testName} - login data row ${index + 1} @master @datadriven @web`, async ({
        homePage,
        loginPage,
        accountPage,
        registerPage,
    }) => {
        await test.step('1) Open the login page and submit the external test data', async () => {
            await homePage.openLoginPage();
            expect(await loginPage.isLoginPageVisible()).toBeTruthy();
            await loginPage.login(data.email?.trim() ?? '', data.password?.trim() ?? '');
        });

        if (data.expected === 'success') {
            await test.step('2) Ensure the configured valid account is available and verify login', async () => {
                if (await loginPage.isInvalidLoginWarningVisible()) {
                    await homePage.openRegisterPage();
                    await registerPage.registerCustomer({
                        firstName: RandomDataUtil.getFirstName(),
                        lastName: RandomDataUtil.getLastName(),
                        email: data.email.trim(),
                        telephone: RandomDataUtil.getPhoneNumber().replace(/[^0-9]/g, '').slice(0, 10),
                        password: data.password.trim(),
                    });
                    expect(await accountPage.isAccountCreatedVisible()).toBeTruthy();
                    await accountPage.logout();
                    await homePage.openLoginPage();
                    await loginPage.login(data.email.trim(), data.password.trim());
                }

                expect(await accountPage.isMyAccountPageVisible()).toBeTruthy();
                expect(await accountPage.hasLogoutOption()).toBeTruthy();
            });
        } else {
            await test.step('2) Verify login fails with the expected warning', async () => {
                expect(await loginPage.isLoginFailureWarningVisible()).toBeTruthy();
                expect(await accountPage.isLoggedOutNavigationVisible()).toBeTruthy();
            });
        }

        console.log(`✅ Data-driven login case completed: ${data.testName}`);
    });
});
