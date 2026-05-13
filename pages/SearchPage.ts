import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import UIHelpers from "../helpers/UIHelpers";
import { logStep } from "../helpers/Logger";
import { SearchData } from "../types/search.type";
import { SearchExpected } from "../types/search.type";
import { log } from "node:console";

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
      await this.toggleAdvanced(data.advanced); }

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

  async assertByStatus(expected: SearchExpected, messages?: Record<string, string>) {
    switch (expected.status) {
      case "warning":
        logStep("Assert warning");
        await UIHelpers.waitForVisible(this.warningMessage, "Warning Message");
        if (expected.messageKey && messages) { 
          await expect(this.warningMessage) 
          .toContainText(messages[expected.messageKey]); }
        break;

      case "empty":
        logStep("Assert no result");                                                                                                                        
        await UIHelpers.waitForVisible(this.noResultMessage, "No Result Message");
        if (expected.messageKey && messages) { await expect(this.noResultMessage) .toContainText(messages[expected.messageKey]); }
        break;

      case "success":
        logStep("Assert has results");
        await UIHelpers.waitForVisible(this.products.first(), "First Product");
        break;

      case "ui":
        logStep("Assert UI state");
        if (expected.advancedVisible) {
          await UIHelpers.waitForVisible(
            this.categoryDropdown,
            "Category Dropdown"
          );
        } else {
          await UIHelpers.waitForHidden(
            this.categoryDropdown,
            "Category Dropdown"
          );
        }
        break;

      default:
        throw new Error(`Unknown expected status: ${expected.status}`);
    }
  }

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



// import { Locator, Page, expect } from "@playwright/test";
// import { BasePage } from "./BasePage";
// import UIHelpers from "../helpers/UIHelpers";
// import { logStep } from "../helpers/Logger";

// export interface AdvancedSearchData {
//   keyword?: string;
//   categoryLabel?: string;
//   includeSub?: boolean;
//   manufacturerLabel?: string;
//   inDescription?: boolean;
//   inTags?: boolean;
// }

// export class SearchPage extends BasePage {
//   // ===== LOCATORS =====
//   readonly keywordInput = this.page.locator("#q");
//   readonly advancedSearchCheckbox = this.page.locator("#advs");
//   readonly categoryDropdown = this.page.locator("#cid");
//   readonly subCategoryCheckbox = this.page.locator("#isc");
//   readonly manufacturerDropdown = this.page.locator("#mid");
//   readonly searchInDescriptionCheckbox = this.page.locator("#sid");
//   readonly searchInTagsCheckbox = this.page.locator("#sit");
//   readonly searchButton = this.page.locator("button.search-button");
//   readonly sortByDropdown = this.page.locator("#products-orderby");

//   readonly warningMessage = this.page.locator(".warning");
//   readonly noResultMessage = this.page.locator(".no-result");
//   readonly productTitles = this.page.locator(".product-grid .product-title a");
//   readonly productPrices = this.page.locator(".product-grid .prices .actual-price");

//   constructor(page: Page) {
//     super(page);
//   }

//   // ===== NAVIGATION =====
//   async goto(url: string) {
//     logStep("Navigating to Search Page");
//     await super.goto(url);
//     await this.waitForPageLoad();
//     await UIHelpers.waitForVisible(this.keywordInput, "Keyword Input");
//   }

//   // ===== ACTION =====
//   async toggleAdvancedSearch(state: boolean) {
//     logStep(`Toggle Advanced Search: ${state}`);

//     await UIHelpers.waitForVisible(
//       this.advancedSearchCheckbox,
//       "Advanced Search Checkbox"
//     );

//     const isChecked = await this.advancedSearchCheckbox.isChecked();

//     if (state && !isChecked) await this.advancedSearchCheckbox.check();
//     if (!state && isChecked) await this.advancedSearchCheckbox.uncheck();
//   }

//   async fillAdvancedSearch(data: AdvancedSearchData) {
//     logStep("Filling advanced search form");

//     if (data.keyword)
//       await this.inputText(
//         this.keywordInput,
//         data.keyword,
//         "Keyword"
//       );

//     if (data.categoryLabel) {
//       await UIHelpers.waitForVisible(
//         this.categoryDropdown,
//         "Category Dropdown"
//       );
//       await this.categoryDropdown.selectOption({
//         label: data.categoryLabel,
//       });
//     }

//     if (data.includeSub !== undefined) {
//       await UIHelpers.waitForVisible(
//         this.subCategoryCheckbox,
//         "Include Subcategory"
//       );

//       const isChecked = await this.subCategoryCheckbox.isChecked();

//       if (data.includeSub && !isChecked)
//         await this.subCategoryCheckbox.check();

//       if (!data.includeSub && isChecked)
//         await this.subCategoryCheckbox.uncheck();
//     }

//     if (data.manufacturerLabel) {
//       await UIHelpers.waitForVisible(
//         this.manufacturerDropdown,
//         "Manufacturer Dropdown"
//       );

//       await this.manufacturerDropdown.selectOption({
//         label: data.manufacturerLabel,
//       });
//     }

//     if (data.inDescription !== undefined) {
//       const isChecked =
//         await this.searchInDescriptionCheckbox.isChecked();

//       if (data.inDescription && !isChecked)
//         await this.searchInDescriptionCheckbox.check();

//       if (!data.inDescription && isChecked)
//         await this.searchInDescriptionCheckbox.uncheck();
//     }

//     if (data.inTags !== undefined) {
//       const isChecked = await this.searchInTagsCheckbox.isChecked();

//       if (data.inTags && !isChecked)
//         await this.searchInTagsCheckbox.check();

//       if (!data.inTags && isChecked)
//         await this.searchInTagsCheckbox.uncheck();
//     }
//   }

//   async clickSearch() {
//     logStep("Click Search button");

//     await UIHelpers.waitForEnabled(
//       this.searchButton,
//       "Search Button"
//     );

//     await this.searchButton.click();

//     await this.waitForPageLoad("domcontentloaded");
//   }

//   // ===== UI STATE =====
//   async expectAdvancedVisible() {
//     logStep("Verify advanced search fields visible");

//     await UIHelpers.waitForVisible(this.categoryDropdown, "Category Dropdown");
//     await UIHelpers.waitForVisible(
//       this.manufacturerDropdown,
//       "Manufacturer Dropdown"
//     );
//   }

//   async expectAdvancedHiddenOrDisabled() {
//     logStep("Verify advanced search fields hidden/disabled");

//     // nopCommerce sometimes keeps controls in DOM but disables/hides them
//     const cidVisible = await this.categoryDropdown.isVisible().catch(() => false);
//     const midVisible = await this.manufacturerDropdown.isVisible().catch(() => false);

//     if (cidVisible) {
//       await UIHelpers.waitForDisabled(this.categoryDropdown, "Category Dropdown");
//     } else {
//       await UIHelpers.waitForHidden(this.categoryDropdown, "Category Dropdown");
//     }

//     if (midVisible) {
//       await UIHelpers.waitForDisabled(
//         this.manufacturerDropdown,
//         "Manufacturer Dropdown"
//       );
//     } else {
//       await UIHelpers.waitForHidden(
//         this.manufacturerDropdown,
//         "Manufacturer Dropdown"
//       );
//     }
//   }

//   // ===== ASSERT =====
//   async expectWarningContains(text: string) {
//     logStep("Verify warning message");

//     await UIHelpers.waitForVisible(
//       this.warningMessage,
//       "Warning Message"
//     );

//     await expect(this.warningMessage).toContainText(text);
//   }

//   async expectNoResultContains(
//     text = "No products were found"
//   ) {
//     logStep("Verify no result message");

//     await UIHelpers.waitForVisible(
//       this.noResultMessage,
//       "No Result Message"
//     );

//     await expect(this.noResultMessage).toContainText(text);
//   }

//   async expectHasResults() {
//     logStep("Verify search has results");

//     await UIHelpers.waitForVisible(
//       this.productTitles.first(),
//       "First Product"
//     );
//   }

//   async hasAnyResult(): Promise<boolean> {
//     return (await this.productTitles.count()) > 0;
//   }

//   // ===== DATA =====
//   async getAllProductTitles(): Promise<string[]> {
//     logStep("Getting all product titles");

//     const titles = await this.productTitles.allInnerTexts();
//     return titles.map((t) => t.trim()).filter(Boolean);
//   }

//   async getAllProductPrices(): Promise<number[]> {
//     logStep("Getting all product prices");

//     const texts = await this.productPrices.evaluateAll((els) =>
//       els.map((e) => (e as HTMLElement).innerText)
//     );

//     return texts
//       .map((t) => parseFloat(t.replace(/[^0-9.]/g, "")))
//       .filter((n) => Number.isFinite(n));
//   }
// }