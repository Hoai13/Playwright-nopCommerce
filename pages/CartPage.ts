import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import UIHelpers from "../helpers/UIHelpers";
import { logStep, logSuccess, logWarning } from "../helpers/logger";
import type { ExpectedResult } from "../types/cart.type";

export class CartPage extends BasePage {
  // ===== LOCATORS =====
  readonly addToCartButton = this.page.locator(".add-to-cart-button");
  readonly quantityInput = this.page.locator(".add-to-cart-panel .qty-input").first();
  readonly rentStartDate = this.page.locator('input[name*="rental_start"]');
  readonly rentEndDate = this.page.locator('input[name*="rental_end"]');
  readonly customerEnteredPrice = this.page.locator(".overview .enter-price-input");
  readonly ramSelect = this.page.locator("#product_attribute_2");
  readonly hddSelect = this.page.locator("#product_attribute_input_3");
  readonly cartRows = this.page.locator(".cart tbody tr");
  readonly cartProductNames = this.page.locator(".cart .product-name");
  readonly removeButton = this.page.locator(".remove-btn").first();
  readonly cartQtyInput = this.page.locator(".cart tbody tr .qty-input").first();
  readonly subtotal = this.page.locator(".product-subtotal");
  readonly productPrice = this.page.locator(".product-price .price-value");
  readonly emptyCartMessage = this.page.locator(".order-summary-content");

  constructor(page: Page) {
    super(page);
  }

  // ===== NAVIGATION =====
  async goto(url: string) {
    await super.goto(url);
    await this.waitForPageLoad();
  }

  // ===== ACTIONS =====
  async setQuantity(qty: string) {
    await this.inputText(this.quantityInput, qty, "Quantity input");
  }

  async setCustomerPrice(price: string) {
    await this.inputText(this.customerEnteredPrice, price, "Customer entered price");
  }

  async setRentDates(startDate: string, endDate: string) {
    await this.inputText(this.rentStartDate, startDate, "Rent start date");
    await this.inputText(this.rentEndDate, endDate, "Rent end date");
  }

  async addToCartFromDetail() {
    logStep("Add to cart from product detail");
    await this.clickElement(this.addToCartButton, "Add to cart button");
    await this.waitForPageLoad();
  }

  async updateCartQuantity(qty: string) {
    logStep(`Update cart quantity: ${qty}`);
    await this.inputText(this.cartQtyInput, qty, "Cart quantity input");
    await this.cartQtyInput.blur();
    await expect(this.cartQtyInput).toHaveValue(qty);
  }

  async removeFromCart() {
    logStep("Remove item from cart");
    await this.clickElement(this.removeButton, "Remove button");
    await this.waitForPageLoad();
  }

  // ===== CONFIGURATION =====
  async configureDesktopProduct(config: { ram?: string; hdd?: string }) {
    logStep(`Configure desktop product: ${JSON.stringify(config)}`);

    if (config.ram) {
      await UIHelpers.waitForVisible(this.ramSelect, "RAM Select");
      await this.ramSelect.selectOption({ label: config.ram });
    }

    if (config.hdd) {
      const hddOption = this.page.locator("label", { hasText: config.hdd });
      await UIHelpers.waitForVisible(hddOption, `HDD Option: ${config.hdd}`);
      await hddOption.click();
    }
  }

  // ===== MAIN VERIFY =====
  async verifyResult(expected: ExpectedResult) {
    if (expected.cart?.itemCount !== undefined) {
      await this.expectCartItemCount(expected.cart.itemCount);
    }

    if (expected.cart?.quantity !== undefined) {
      await this.expectCartQuantity(expected.cart.quantity.toString());
    }

    if (expected.cart?.empty) {
      await this.expectCartEmpty();
    }

    if ((expected as any).cart?.containsProduct) {
      await this.expectCartContainsProduct((expected as any).cart.containsProduct);
    }
  }

  // ===== LOW LEVEL VERIFY =====
  async getCartItemCount() {
    return await this.cartRows.count();
  }

  async expectCartItemCount(expected: number) {
    await expect(this.cartRows).toHaveCount(expected);
    logSuccess(`Cart item count = ${expected}`);
  }

  async expectCartQuantity(expected: string) {
    await UIHelpers.waitForVisible(this.cartQtyInput, "Cart quantity input");
    await expect(this.cartQtyInput).toHaveValue(expected);
    logSuccess(`Cart quantity = ${expected}`);
  }

  async expectCartEmpty() {
    await expect(this.cartRows).toHaveCount(0);
    await expect(this.emptyCartMessage).toContainText("Your Shopping Cart is empty!");
    logWarning("Cart is empty");
  }

  async expectCartContainsProduct(name: string) {
    await UIHelpers.waitForVisible(this.cartProductNames.first(), "Cart product name");
    await expect(this.cartProductNames.filter({ hasText: name })).toHaveCount(1);
    logSuccess(`Cart contains product: ${name}`);
  }

  // ===== GETTERS =====
  async getSubtotalText() {
    return (await this.subtotal.first().textContent())?.trim();
  }

  async getProductPrice() {
    const text = await this.productPrice.textContent();
    return text?.trim() ?? "";
  }
}