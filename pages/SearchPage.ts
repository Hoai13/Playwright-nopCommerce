import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import UIHelpers from "../helpers/UIHelpers";
import { logStep } from "../helpers/logger";
import { SearchData } from "../types/search.type";
import { SearchExpected } from "../types/search.type";

export class SearchPage extends BasePage {
  // ===== LOCATORS =====
  readonly keywordInput = this.page.locator("#q");
  readonly advancedCheckbox = this.page.locator("#advs");
  readonly categoryDropdown = this.page.locator("#cid");
  readonly manufacturerDropdown = this.page.locator("#mid");
  readonly subCategoryCheckbox = this.page.locator("#isc");
  readonly descriptionCheckbox = this.page.locator("#sid");
  readonly tagsCheckbox = this.page.locator("#sit");
  readonly searchButton = this.page.locator("button.search-button");
  readonly warningMessage = this.page.locator(".warning");
  readonly noResultMessage = this.page.locator(".no-result");
  readonly products = this.page.locator(".product-grid .item-box");
  readonly productTitles = this.page.locator(".product-title a");
  readonly productPrices = this.page.locator(".prices .actual-price");

  constructor(page: Page) {
    super(page);
  }

  // ===== ACTIONS =====
  async goto(url: string) {
    logStep("Go to Search Page");
    await super.goto(url);
    await this.waitForPageLoad();
    await UIHelpers.waitForVisible(this.keywordInput, "Keyword Input");
  }

  async executeSearch(data: SearchData) {
    logStep("Execute search");

    if (data.keyword !== undefined) {
      await this.inputText(this.keywordInput, data.keyword, "Keyword Input");
    }

    if (data.advanced !== undefined) {
      await this.toggleAdvanced(data.advanced);
    }

    if (data.categoryLabel) {
      await UIHelpers.waitForVisible(this.categoryDropdown, "Category Dropdown");
      await this.categoryDropdown.selectOption({ label: data.categoryLabel });
    }

    if (data.manufacturerLabel) {
      await UIHelpers.waitForVisible(this.manufacturerDropdown, "Manufacturer Dropdown");
      await this.manufacturerDropdown.selectOption({
        label: data.manufacturerLabel,
      });
    }

    if (data.includeSub !== undefined) {
      await this.toggleCheckbox(this.subCategoryCheckbox, data.includeSub);
    }

    if (data.inDescription !== undefined) {
      await this.toggleCheckbox(this.descriptionCheckbox, data.inDescription);
    }

    if (data.inTags !== undefined) {
      await this.toggleCheckbox(this.tagsCheckbox, data.inTags);
    }

    if (data.useEnter) {
      await UIHelpers.waitForVisible(this.keywordInput, "Keyword Input");
      await this.keywordInput.press("Enter");
    } else {
      await this.clickElement(this.searchButton, "Search Button");
    }

    await this.waitForPageLoad("domcontentloaded");
  }

  async toggleAdvanced(state: boolean) {
    logStep(`Toggle advanced search: ${state}`);
    await UIHelpers.waitForVisible(this.advancedCheckbox, "Advanced Search Checkbox");
    const checked = await this.advancedCheckbox.isChecked();

    if (state && !checked) await this.advancedCheckbox.check();
    if (!state && checked) await this.advancedCheckbox.uncheck();
  }

  async toggleCheckbox(locator: Locator, state: boolean) {
    await UIHelpers.waitForVisible(locator, "Checkbox");
    const checked = await locator.isChecked();

    if (state && !checked) await locator.check();
    if (!state && checked) await locator.uncheck();
  }

  // ===== VERIFICATIONS (ASSERTIONS) =====
  async assertByStatus(expected: SearchExpected, messages?: Record<string, string>) {
    switch (expected.status) {
      case "warning":
        logStep("Assert warning");
        await UIHelpers.waitForVisible(this.warningMessage, "Warning Message");
        if (expected.messageKey && messages) {
          await expect(this.warningMessage).toContainText(messages[expected.messageKey]);
        }
        break;

      case "empty":
        logStep("Assert no result");
        await UIHelpers.waitForVisible(this.noResultMessage, "No Result Message");
        if (expected.messageKey && messages) {
          await expect(this.noResultMessage).toContainText(messages[expected.messageKey]);
        }
        break;

      case "success":
        logStep("Assert has results");
        await UIHelpers.waitForVisible(this.products.first(), "First Product");
        break;

      case "ui":
        logStep("Assert UI state");
        if (expected.advancedVisible) {
          await UIHelpers.waitForVisible(this.categoryDropdown, "Category Dropdown");
        } else {
          await UIHelpers.waitForHidden(this.categoryDropdown, "Category Dropdown");
        }
        break;

      default:
        throw new Error(`Unknown expected status: ${expected.status}`);
    }
  }

  // ===== HELPERS =====
  async hasAnyResult(): Promise<boolean> {
    return (await this.products.count()) > 0;
  }

  async getAllProductTitles(): Promise<string[]> {
    const titles = await this.productTitles.allInnerTexts();
    return titles.map((t) => t.trim()).filter(Boolean);
  }

  async getAllProductPrices(): Promise<number[]> {
    const texts = await this.productPrices.evaluateAll((els) =>
      els.map((e) => (e as HTMLElement).innerText)
    );

    return texts
      .map((t) => parseFloat(t.replace(/[^0-9.]/g, "")))
      .filter((n) => Number.isFinite(n));
  }
}