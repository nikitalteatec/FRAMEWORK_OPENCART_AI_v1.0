import { Locator, Page } from '@playwright/test';

export class LoginPage {
    private readonly page: Page;
    private readonly emailInput: Locator;
    private readonly passwordInput: Locator;
    private readonly submitButton: Locator;
    private readonly warningMessage: Locator;
    private readonly warningAlert: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with CSS selectors
        this.emailInput = page.locator('#input-email');
        this.passwordInput = page.locator('#input-password');
        this.submitButton = page.locator('input[type="submit"]');
        this.warningMessage = page.getByText('Warning: No match for E-Mail Address and/or Password.', { exact: false });
        this.warningAlert = page.locator('.alert-danger');
    }

    /**
     * Verifies the login page is displayed.
     * @returns Promise<boolean> - true when the page is visible
     */
    async isLoginPageVisible(): Promise<boolean> {
        try {
            return await this.emailInput.isVisible() && await this.passwordInput.isVisible();
        } catch (error) {
            console.log(`Error checking login page: ${error}`);
            return false;
        }
    }

    /**
     * Logs in with valid credentials.
     * @param email - Customer email
     * @param password - Customer password
     */
    async login(email: string, password: string): Promise<void> {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.submitButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Checks whether the expected invalid-login warning is displayed.
     * @returns Promise<boolean> - true when the warning is visible
     */
    async isInvalidLoginWarningVisible(): Promise<boolean> {
        return await this.warningMessage.isVisible();
    }

    /**
     * Checks whether OpenCart displays a login failure warning.
     * @returns Promise<boolean> - true when an error alert is visible
     */
    async isLoginFailureWarningVisible(): Promise<boolean> {
        return await this.warningAlert.isVisible();
    }
}
