import { Locator, Page } from '@playwright/test';

export class ProductPage {
    private readonly page: Page;
    private readonly quantityInput: Locator;
    private readonly addToCartButton: Locator;
    private readonly productAddedMessage: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with CSS selectors
        this.quantityInput = page.locator('#input-quantity');
        this.addToCartButton = page.locator('#button-cart');
        this.productAddedMessage = page.locator('.alert-success');
    }

    /**
     * Verifies the product details page is visible.
     * @param productName - Product expected to be on the page
     * @returns Promise<boolean> - true if the product heading is visible
     */
    async isProductPageVisible(productName: string): Promise<boolean> {
        try {
            return await this.page.locator('h1').filter({ hasText: productName }).isVisible();
        } catch (error) {
            console.log(`Error checking product page: ${error}`);
            return false;
        }
    }

    /**
     * Adds the given product quantity to the shopping cart.
     * @param quantity - Number of units to add
     */
    async openProductFromSearch(productName: string): Promise<void> {
        const productLink = this.page.locator('a').filter({ hasText: productName }).first();
        await productLink.waitFor({ state: 'visible', timeout: 15000 });
        await productLink.click();
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForURL(/route=product\/product/, { timeout: 15000 });
    }

    async addProductToCart(quantity: number = 1): Promise<void> {
        await this.quantityInput.waitFor({ state: 'visible', timeout: 15000 });
        await this.quantityInput.fill(String(quantity));
        await this.addToCartButton.waitFor({ state: 'visible', timeout: 15000 });
        await this.addToCartButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Checks whether OpenCart confirms the product was added to the cart.
     * @returns Promise<boolean> - true when the success message is visible
     */
    async isProductAddedMessageVisible(): Promise<boolean> {
        await this.productAddedMessage.waitFor({ state: 'visible', timeout: 10000 });
        return await this.productAddedMessage.isVisible();
    }
}
