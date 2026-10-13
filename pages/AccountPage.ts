import { Locator, Page } from '@playwright/test';

export class AccountPage {
    private readonly page: Page;
    private readonly accountSuccessHeading: Locator;
    private readonly accountMenuHeading: Locator;
    private readonly accountMenu: Locator;
    private readonly logoutLink: Locator;
    private readonly loginLink: Locator;
    private readonly registerLink: Locator;
    private readonly logoutConfirmationHeading: Locator;
    private readonly continueButton: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with CSS selectors
        this.accountSuccessHeading = page.locator('h1').filter({ hasText: 'Your Account Has Been Created!' });
        this.accountMenuHeading = page.locator('h1, h2').filter({ hasText: 'My Account' }).first();
        this.accountMenu = page.locator('#top-links .dropdown-toggle').filter({ hasText: 'My Account' }).first();
        this.logoutLink = page.locator('#top-links a[href*="route=account/logout"]');
        this.loginLink = page.locator('#top-links a[href*="route=account/login"]');
        this.registerLink = page.locator('#top-links a[href*="route=account/register"]');
        this.logoutConfirmationHeading = page.locator('h1').filter({ hasText: 'Account Logout' });
        this.continueButton = page.getByRole('link', { name: 'Continue', exact: true });
    }

    /**
     * Verifies the account registration success page is displayed.
     * @returns Promise<boolean> - true when the confirmation heading is visible
     */
    async isAccountCreatedVisible(): Promise<boolean> {
        try {
            return await this.accountSuccessHeading.isVisible();
        } catch (error) {
            console.log(`Error checking account success page: ${error}`);
            return false;
        }
    }

    /**
     * Verifies the authenticated account page is visible.
     * @returns Promise<boolean> - true when the My Account page is visible
     */
    async isMyAccountPageVisible(): Promise<boolean> {
        try {
            return await this.accountMenuHeading.isVisible();
        } catch (error) {
            console.log(`Error checking My Account page: ${error}`);
            return false;
        }
    }

    /**
     * Checks whether the authenticated account navigation includes logout.
     * @returns Promise<boolean> - true when the logout option is visible
     */
    async hasLogoutOption(): Promise<boolean> {
        await this.accountMenu.click();
        return await this.logoutLink.isVisible();
    }

    /**
     * Checks that account navigation shows logged-out options and no logout option.
     * @returns Promise<boolean> - true when login and registration are available
     */
    async isLoggedOutNavigationVisible(): Promise<boolean> {
        await this.accountMenu.click();
        return await this.loginLink.isVisible()
            && await this.registerLink.isVisible()
            && !(await this.logoutLink.isVisible());
    }

    /**
     * Logs out using the authenticated account navigation.
     */
    async logout(): Promise<void> {
        await this.accountMenu.click();
        await this.logoutLink.click();
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Checks whether the logout confirmation page is displayed.
     * @returns Promise<boolean> - true when the logout heading is visible
     */
    async isLogoutConfirmationVisible(): Promise<boolean> {
        return await this.logoutConfirmationHeading.isVisible();
    }

    /**
     * Continues from the logout confirmation page.
     */
    async continueAfterLogout(): Promise<void> {
        await this.continueButton.click();
        await this.page.waitForLoadState('networkidle');
    }
}
