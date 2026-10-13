import { Locator, Page } from '@playwright/test';

export class RegisterPage {
    private readonly page: Page;
    private readonly firstNameInput: Locator;
    private readonly lastNameInput: Locator;
    private readonly emailInput: Locator;
    private readonly telephoneInput: Locator;
    private readonly passwordInput: Locator;
    private readonly confirmPasswordInput: Locator;
    private readonly privacyCheckbox: Locator;
    private readonly submitButton: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with CSS selectors
        this.firstNameInput = page.locator('#input-firstname');
        this.lastNameInput = page.locator('#input-lastname');
        this.emailInput = page.locator('#input-email');
        this.telephoneInput = page.locator('#input-telephone');
        this.passwordInput = page.locator('#input-password');
        this.confirmPasswordInput = page.locator('#input-confirm');
        this.privacyCheckbox = page.locator('input[name="agree"]');
        this.submitButton = page.locator('input[type="submit"]');
    }

    /**
     * Verifies the register page is displayed.
     * @returns Promise<boolean> - true when the page is visible
     */
    async isRegisterPageVisible(): Promise<boolean> {
        try {
            return await this.page.locator('h1').filter({ hasText: 'Register Account' }).isVisible();
        } catch (error) {
            console.log(`Error checking register page: ${error}`);
            return false;
        }
    }

    /**
     * Registers a new customer with the provided details.
     * @param customerData - First name, last name, email, telephone, password
     */
    async registerCustomer(customerData: {
        firstName: string;
        lastName: string;
        email: string;
        telephone: string;
        password: string;
    }): Promise<void> {
        await this.firstNameInput.fill(customerData.firstName);
        await this.lastNameInput.fill(customerData.lastName);
        await this.emailInput.fill(customerData.email);
        await this.telephoneInput.fill(customerData.telephone);
        await this.passwordInput.fill(customerData.password);
        await this.confirmPasswordInput.fill(customerData.password);
        await this.privacyCheckbox.check();
        await this.submitButton.click();
        await this.page.waitForLoadState('networkidle');
    }
}
