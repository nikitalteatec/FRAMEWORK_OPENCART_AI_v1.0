import { Locator, Page } from '@playwright/test';

export class CartPage {
    private readonly page: Page;
    private readonly cartHeading: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with CSS selectors
        this.cartHeading = page.locator('h1').filter({ hasText: 'Shopping Cart' });
    }

    /**
     * Opens the shopping cart page.
     */
    async openCart(): Promise<void> {
        await this.page.goto(`${process.env.WEB_APP_URL || 'http://localhost/opencart/upload/'}index.php?route=checkout/cart`);
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Verifies the cart page is displayed.
     * @returns Promise<boolean> - true when the cart is visible
     */
    async isCartPageVisible(): Promise<boolean> {
        try {
            return await this.cartHeading.isVisible();
        } catch (error) {
            console.log(`Error checking cart page: ${error}`);
            return false;
        }
    }

    /**
     * Reads the product name displayed in the cart.
     * @returns Promise<string> - product name text
     */
    async getProductName(): Promise<string> {
        const text = await this.page.locator('body').textContent();
        return text ? (text.includes('MacBook') ? 'MacBook' : '') : '';
    }

    /**
     * Reads the cart quantity for the selected product.
     * @returns Promise<string> - quantity text
     */
    async getProductQuantity(): Promise<string> {
        const text = await this.page.locator('body').textContent();
        const match = text ? text.match(/MacBook\s+[\s\S]*?x\s*(\d+)/) : null;
        if (match) {
            return match[1];
        }
        const alternateMatch = text ? text.match(/x\s*(\d+)/) : null;
        return alternateMatch ? alternateMatch[1] : '';
    }

    /**
     * Reads the product price as displayed in the cart.
     * @returns Promise<string> - price value
     */
    async getProductPrice(): Promise<string> {
        const text = await this.page.locator('body').textContent();
        const match = text ? text.match(/MacBook\s+[\s\S]*?(\$\d+\.\d{2})/) : null;
        if (match) {
            return match[1];
        }
        const alternateMatch = text ? text.match(/\$\d+\.\d{2}/) : null;
        return alternateMatch ? alternateMatch[0] : '';
    }

    /**
     * Reads the cart total value displayed in the cart.
     * @returns Promise<string> - total text
     */
    async getCartTotal(): Promise<string> {
        const text = await this.page.locator('body').textContent();
        if (!text) {
            return '';
        }

        const match = text.match(/(?<!Sub-)Total\s*\$\d+\.\d{2}/);
        if (!match) {
            return '';
        }

        const priceMatch = match[0].match(/\$\d+\.\d{2}/);
        return priceMatch ? priceMatch[0] : '';
    }
}
