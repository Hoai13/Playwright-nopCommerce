import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import UIHelpers from "../helpers/UIHelpers";
import { logStep } from "../helpers/Logger";

export class CategoryPage extends BasePage {
  readonly productItems = this.page.locator(".product-item");
  readonly pageTitle = this.page.locator("div.page-title h1");
  readonly breadcrumb = this.page.locator(".breadcrumb");
  readonly breadcrumbLinks = this.page.locator(".breadcrumb li a");
  readonly subCategoryItems = this.page.locator(".sub-category-item");
  readonly subCategoryLinks = this.page.locator(".sub-category-item .title a");
  readonly gridViewBtn = this.page.locator(".viewmode-icon.grid");
  readonly listViewBtn = this.page.locator(".viewmode-icon.list");
  readonly productGrid = this.page.locator(".product-grid");
  readonly productList = this.page.locator(".product-list");
  readonly filterPanel = this.page.locator(".product-filters");
  readonly filterLabels = this.page.locator(".product-filters label");
  readonly sortDropdown = this.page.getByLabel('Sort by');
  readonly nextBtn = this.page.getByRole('link', { name: 'Next' });
  readonly prevBtn = this.page.getByRole('link', { name: 'Previous' });
  readonly pager = this.page.locator(".pager");
  readonly pagerPages = this.page.locator(".pager li a");
  readonly pagerCurrent = this.page.locator(".pager .current-page, .pager .current-page span");
  readonly pageSizeDropdown = this.page.getByLabel('Display');
  readonly noProductMessage = this.page.locator(".no-result");
  readonly successNotification = this.page.locator(".bar-notification.success");
  readonly cartQty = this.page.locator(".cart-qty");

  // ===== PRODUCT =====
  getProductItem(productName: string) {
    return this.productItems.filter({ hasText: productName }).first();
  }

  getAddToCartButton(productName: string) {
    return this.getProductItem(productName)
      .locator(".product-box-add-to-cart-button");
  }

  getAddToWishlistButton(productName: string) {
    return this.getProductItem(productName)
      .locator(".add-to-wishlist-button");
  }

  getAddToCompareButton(productName: string) {
    return this.getProductItem(productName)
      .locator(".add-to-compare-list-button");
  }

  getProductTitleLink(productName: string) {
    return this.getProductItem(productName)
      .locator("h2.product-title a");
  }

  async clickAddToCartFromList(productName: string) {
    logStep(`Add to cart: ${productName}`);

    const btn = this.getAddToCartButton(productName);
    await this.clickElement(btn, `Add button: ${productName}`);
  }

  async viewProductDetails(productName: string) {
    logStep(`Open product: ${productName}`);

    const link = this.getProductTitleLink(productName);
    await this.clickElement(link, "Product title");

    await this.waitForPageLoad();
  }

  async addToWishlistFromList(productName: string) {
    logStep(`Add to wishlist: ${productName}`);
    const btn = this.getAddToWishlistButton(productName);
    await this.clickElement(btn, `Wishlist button: ${productName}`);
  }

  async addToCompareFromList(productName: string) {
    logStep(`Add to compare: ${productName}`);
    const btn = this.getAddToCompareButton(productName);
    await this.clickElement(btn, `Compare button: ${productName}`);
  }

  // async addToCart(productName: string) {
  //   const btn = this.getProductItem(productName)
  //     .locator(".product-box-add-to-cart-button");

  //   await UIHelpers.waitForVisible(btn, "Add to cart");
  //   await btn.click();
  // }

  // async openProductDetail(productName: string) {
  //   const link = this.getProductItem(productName)
  //     .locator("h2.product-title a");

  //   await UIHelpers.waitForVisible(link, "Product link");
  //   await link.click();
  // }

  // ===== VERIFY =====
  
  // ===== VIEW MODE =====
  async switchToGrid() {
    await this.clickElement(this.gridViewBtn, "Grid View");
  }

  async switchToList() {
    await this.clickElement(this.listViewBtn, "List View");
  }

  // async expectGridSelected() {
  //   await UIHelpers.waitForVisible(this.gridViewBtn, "Grid View");
  //   await expect(this.gridViewBtn).toHaveClass(/selected/);
  // }

  // async expectListSelected() {
  //   await UIHelpers.waitForVisible(this.listViewBtn, "List View");
  //   await expect(this.listViewBtn).toHaveClass(/selected/);
  // }

  async expectGridLayout() {
    await UIHelpers.waitForVisible(this.productGrid, "Product Grid");
    await expect(this.productGrid).toBeVisible();
  }

  async expectListLayout() {
    await UIHelpers.waitForVisible(this.productList, "Product List");
    await expect(this.productList).toBeVisible();
  }

  // ===== PAGINATION =====
  async goNextPage() {
    await this.clickElement(this.nextBtn, "Next Page");
    await this.waitForPageLoad();
  }

  async goPrevPage() {
    await this.clickElement(this.prevBtn, "Previous Page");
    await this.waitForPageLoad();
  }

  async goToPage(pageNumber: number) {
    const pageLink = this.pagerPages.filter({ hasText: String(pageNumber) }).first();
    await this.clickElement(pageLink, `Page ${pageNumber}`);
    await this.waitForPageLoad();
  }

  async changePageSize(size: string) {
    await UIHelpers.waitForVisible(this.pageSizeDropdown, "Page Size Dropdown");
    await this.pageSizeDropdown.selectOption(size);
    await this.waitForPageLoad();
  }

  async selectSort(label: string) {
    await UIHelpers.waitForVisible(this.sortDropdown, "Sort Dropdown");
    await this.sortDropdown.selectOption({ label });
    await this.waitForPageLoad();
  }

  private getFilterLabel(label: string) {
    return this.filterLabels.filter({ hasText: new RegExp(`^${label}$`, "i") }).first();
  }

  async applyFilterByLabel(label: string) {
    await UIHelpers.waitForVisible(this.filterPanel, "Filter Panel");
    const filterLabel = this.getFilterLabel(label);
    await this.clickElement(filterLabel, `Filter: ${label}`);
    await UIHelpers.waitForVisible(this.productItems.first(), "Filtered products");
  }

  async expectFilterChecked(label: string) {
    const filterLabel = this.getFilterLabel(label);
    await UIHelpers.waitForVisible(filterLabel, `Filter: ${label}`);
    const inputInLabel = filterLabel.locator('input[type="checkbox"]');

    if (await inputInLabel.count()) {
      await expect(inputInLabel).toBeChecked();
      return;
    }

    const classAttr = await filterLabel.getAttribute("class");
    expect(classAttr || "").toMatch(/checked|selected|active/);
  }

  // ===== VERIFY =====
  async expectBreadcrumb(expected: string) {
  await UIHelpers.waitForVisible(this.breadcrumb, "Breadcrumb");

  const normalize = (s: string) =>
    s
      .replace(/\s*\/\s*/g, " / ")
      .replace(/\s+/g, " ")   
      .trim();

  const actual = normalize(await this.breadcrumb.textContent() || "");
  const exp = normalize(expected);

  expect(actual).toContain(exp);
}

  async clickBreadcrumb(label: string) {
    const link = this.breadcrumbLinks
      .filter({ hasText: new RegExp(`^\\s*${label}\\s*$`, "i"), })
      .first();
    await this.clickElement(link, `Breadcrumb: ${label}`);
    await this.waitForPageLoad();
  }

  async expectTitle(text: string) {
    await UIHelpers.waitForVisible(this.pageTitle, "Page Title");
    await expect(this.pageTitle).toHaveText(text);
  }

  async expectSubCategories(names: string[]) {
    await UIHelpers.waitForVisible(this.subCategoryLinks.first(), "Sub Category Link");
    const texts = (await this.subCategoryLinks.allInnerTexts())
      .map((name) => name.trim())
      .filter(Boolean);
    for (const expectedName of names) {
      expect(texts).toContain(expectedName);
    }
  }

  async expectNoProduct(message: string) {
    await UIHelpers.waitForVisible(this.noProductMessage, "No Product Message");
    await expect(this.noProductMessage).toContainText(message);
  }

  async expectProductsVisible() {
    await UIHelpers.waitForVisible(this.productItems.first(), "Product Item");
  }

  async expectProductCountAtMost(max: number) {
    const count = await this.productItems.count();
    expect(count).toBeLessThanOrEqual(max);
  }

  async expectNextDisabled() {
    await expect(this.nextBtn).toBeDisabled();
  }

  async expectPrevDisabled() {
    await expect(this.prevBtn).toBeDisabled();
  }

  async expectCurrentPage(pageNumber: number) {
    await UIHelpers.waitForVisible(this.pagerCurrent, "Current Page");
    await expect(this.pagerCurrent).toContainText(String(pageNumber));
  }

  async expectSuccessNotificationContains(text: string) {
    await UIHelpers.waitForVisible(this.successNotification, "Success Notification", 15000);
    await expect(this.successNotification).toContainText(text);
  }
}
