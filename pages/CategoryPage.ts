import { expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import UIHelpers from "../helpers/UIHelpers";
import { logStep } from "../helpers/logger";

export class CategoryPage extends BasePage {

  readonly productItems = this.page.locator(".product-item");
  readonly pageTitle = this.page.locator("div.page-title h1");
  readonly productTitles = this.page.locator(".product-title 1");
  readonly breadcrumb = this.page.locator(".breadcrumb");
  readonly breadcrumbLinks = this.page.locator(".breadcrumb li a");
  readonly subCategoryLinks = this.page.locator(".sub-category-item .title a");
  readonly successNotification = this.page.locator(".bar-notification.success");

  private getProductItem(productName: string) {
    return this.productItems
      .filter({ hasText: productName })
      .first();
  }

  async viewProductDetails(productName: string) {
    logStep(`Open product: ${productName}`);
    const productLink = this.getProductItem(productName).locator("h2.product-title a");

    await this.clickElement(productLink, `Product: ${productName}`);
    await this.waitForPageLoad();
  }

  async clickAddToCartFromList(productName: string) {
    logStep(`Add to cart: ${productName}`);
    const btn = this.getProductItem(productName).locator(".product-box-add-to-cart-button");

    await this.clickElement(btn, `Add to Cart button: ${productName}`);
  }

  async addToWishlistFromList(productName: string) {
    logStep(`Add to wishlist: ${productName}`);
    const btn = this.getProductItem(productName).locator(".add-to-wishlist-button");

    await this.clickElement(btn, `Wishlist button: ${productName}`);
  }

  async addToCompareFromList(productName: string) {
    logStep(`Add to compare: ${productName}`);
    const btn = this.getProductItem(productName).locator(".add-to-compare-list-button");

    await this.clickElement(btn, `Compare button: ${productName}`);
  }

  async clickBreadcrumb(label: string) {
    logStep(`Click breadcrumb: ${label}`);
    const breadcrumbLink = this.breadcrumbLinks
      .filter({ hasText: new RegExp(`^\\s*${label}\\s*$`, "i") })
      .first();

    await this.clickElement(breadcrumbLink, `Breadcrumb: ${label}`);
    await this.waitForPageLoad();
  }

  async expectTitle(text: string) {
    await UIHelpers.waitForVisible(this.pageTitle, "Page Title");
    await expect(this.pageTitle).toHaveText(text);
  }

  async expectProductTitle(text: string) {
    await UIHelpers.waitForVisible(this.productTitles.first(), "Product Title");
    await expect(this.productTitles.first()).toHaveText(text);
  }

  async expectBreadcrumb(expected: string) {
    await UIHelpers.waitForVisible(this.breadcrumb, "Breadcrumb");

    const normalize = (text: string) =>
      text.replace(/\s*\/\s*/g, " / ").replace(/\s+/g, " ").trim();

    const actual = normalize((await this.breadcrumb.textContent()) || "");
    expect(actual).toContain(normalize(expected));
  }

  async expectSubCategories(expectedNames: string[]) {
    await UIHelpers.waitForVisible(this.subCategoryLinks.first(), "Sub Categories");

    const actualNames = (await this.subCategoryLinks.allInnerTexts()).map((t) => t.trim());

    for (const name of expectedNames) {
      expect(actualNames).toContain(name);
    }
  }

  async expectProductsVisible() {
    await expect(this.productItems.first()).toBeVisible();
  }

  async expectSuccessNotificationContains(text: string) {
    await UIHelpers.waitForVisible(this.successNotification, "Success Notification", 15000);
    await expect(this.successNotification).toContainText(text);
  }
}