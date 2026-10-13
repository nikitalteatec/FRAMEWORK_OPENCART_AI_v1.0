import { Locator, Page } from '@playwright/test';

export class HomePage {
    private readonly page: Page;
    private readonly appUrl: string;
    private readonly searchInput: Locator;
    private readonly searchButton: Locator;
    private readonly accountMenu: Locator;
    private readonly registerLink: Locator;
    private readonly loginLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.appUrl = process.env.WEB_APP_URL || 'http://localhost/opencart/upload/';

        // Initialize locators with CSS selectors
        this.searchInput = page.locator('input[name="search"]');
        this.searchButton = page.locator('button.btn.btn-default.btn-lg');
        this.accountMenu = page.locator('.dropdown-toggle').filter({ hasText: 'My Account' }).first();
        this.registerLink = page.locator("a[href*='route=account/register']").first();
        this.loginLink = page.locator("a[href*='route=account/login']").first();
    }

    async goto(): Promise<void> {
        await this.page.goto(this.appUrl);
    }

    /**
     * Checks whether the application home page is displayed.
     * @returns Promise<boolean> - true when the store title is visible
     */
    async isHomePageVisible(): Promise<boolean> {
        return (await this.page.title()) === 'Your Store';
    }

    /**
     * Opens the registration page.
     */
    async openRegisterPage(): Promise<void> {
        await this.page.goto(`${this.appUrl}index.php?route=account/register`);
    }

    /**
     * Opens the login page.
     */
    async openLoginPage(): Promise<void> {
        await this.page.goto(`${this.appUrl}index.php?route=account/login`);
    }

    /**
     * Searches for a product from the home page header field.
     * @param productName - Product to search
     */
    async searchProduct(productName: string): Promise<void> {
        await this.searchInput.fill(productName);
        await this.searchButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Checks whether the search results page shows the requested product.
     * @param productName - Product expected in the search results
     * @returns Promise<boolean> - true when the result heading and product link are visible
     */
    async isProductSearchResultVisible(productName: string): Promise<boolean> {
        const resultsHeading = this.page.locator('h1').filter({ hasText: 'Search' });
        const productLink = this.page.getByRole('link', { name: productName, exact: true }).first();
        return await resultsHeading.isVisible() && await productLink.isVisible();
    }

    /**
     * Clicks the account menu and opens the register page.
     */
    async clickRegister(): Promise<void> {
        await this.accountMenu.click();
        await this.registerLink.click();
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Clicks the account menu and opens the login page.
     */
    async clickLogin(): Promise<void> {
        await this.accountMenu.click();
        await this.loginLink.click();
        await this.page.waitForLoadState('networkidle');
    }
}
