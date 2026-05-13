import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import UIHelpers from "../helpers/UIHelpers";
import { logStep } from "../helpers/Logger";

export class HomePage extends BasePage {
  // ===== LOCATORS =====
  readonly searchInput = this.page.locator("#small-searchterms");
  readonly searchButton = this.page.locator("button.search-box-button");

  //readonly headerMenu = this.page.locator(".header-menu");

  //readonly categoryMenuToggle = this.page.locator(".header-menu .menu__toggle").first();
  // readonly topMenuItems = this.page.locator(".header-menu .top-menu > li > a");
  // readonly subMenuItems = this.page.locator(".header-menu .sublist li a");
  readonly miniCartLabel = this.page.locator(".cart-label");
  readonly miniCartDropdown: Locator = this.page.locator("#flyout-cart");
  readonly miniCartCount: Locator = this.page.locator(".cart-qty");

  readonly successNotification: Locator = this.page.locator(".bar-notification.success");
  readonly errorNotification: Locator = this.page.locator(".bar-notification.error");
  readonly closeNotificationButton: Locator = this.page.locator(".bar-notification .close");

  constructor(page: Page) {
    super(page);
  }

  // ===== NAVIGATION =====
  async goto(url: string) {
    logStep(`Navigate to: ${url}`);

    await super.goto(url);
    await this.waitForPageLoad();

    await UIHelpers.waitForVisible(this.searchInput, "Search Input");
  }

  // ===== SEARCH =====
  async search(keyword: string, useEnter = false) {
    logStep(`Search: "${keyword}" (enter=${useEnter})`);

    await this.inputText(this.searchInput, keyword, "Search Input");

    if (useEnter) {
      await this.searchInput.press("Enter");
    } else {
      await this.clickElement(this.searchButton, "Search Button");
    }

    await this.waitForPageLoad("domcontentloaded");
  }

  async verifySearchInputValue(expected: string) {
    await expect(this.searchInput).toHaveValue(expected);
  }

  getTopMenuItem(name: string) {
    return this.page
      .locator(".header-menu .menu__link")
      .filter({ hasText: new RegExp(`^${name}$`, "i") })
      .first();
  }

  getSubMenuItem(name: string) {
    return this.page
      .locator(".header-menu .menu__list-view .menu__link")
      .filter({ hasText: new RegExp(`^${name}$`, "i") })
      .first();
  }

  async hoverCategory(name: string) {
    logStep(`Hover category: ${name}`);

    const menu = this.getTopMenuItem(name);
    await UIHelpers.waitForVisible(menu, `Top menu: ${name}`);
    await menu.hover();
  }

  async navigateToCategory(top: string, sub?: string) {
    logStep(`Navigate: ${top} ${sub ? `> ${sub}` : ""}`);

    const topMenu = this.getTopMenuItem(top);
    await UIHelpers.waitForVisible(topMenu, `Top menu: ${top}`);

    if (sub) {
      await topMenu.hover();

      const subMenu = this.getSubMenuItem(sub);
      await UIHelpers.waitForVisible(subMenu, `Sub menu: ${sub}`);

      await this.clickElement(subMenu, `Sub menu: ${sub}`);
    } else {
      await this.clickElement(topMenu, `Top menu: ${top}`);
    }

    await this.waitForPageLoad();
  }

  async getSubMenuTexts(): Promise<string[]> {
    const items = this.page.locator(".header-menu .menu__list-view .menu__link");

    await UIHelpers.waitForVisible(items.first(), "Sub menu items");

    return (await items.allInnerTexts())
      .map(t => t.trim())
      .filter(Boolean);
  }

  // ===== NOTIFICATION =====
  async verifyNotification(type: "success" | "error" | "warning" | "empty", message: string) {
    const locator =
      type === "success" ? this.successNotification : this.errorNotification;

    logStep(`Verify ${type} notification`);

    await UIHelpers.waitForVisible(locator, `${type} notification`, 15000);
    await expect(locator).toContainText(message);
  }

  async closeNotificationIfVisible() {
    if (await this.closeNotificationButton.isVisible()) {
      await this.clickElement(this.closeNotificationButton, "Close Notification");
    }
  }

  // ===== MINI CART =====
  async openMiniCart() {
    logStep("Open mini cart");

    await this.page.evaluate(() => window.scrollTo(0, 0));

    await UIHelpers.waitForVisible(this.miniCartLabel, "Mini Cart Label");
    await this.miniCartLabel.hover();

    await UIHelpers.waitForVisible(
      this.miniCartDropdown,
      "Mini Cart Dropdown"
    );
  }

  async verifyMiniCartEmpty(
    message: string = "You have no items in your shopping cart."
  ) {
    await UIHelpers.waitForVisible(this.miniCartDropdown, "Mini Cart Dropdown");
    await expect(this.miniCartDropdown).toContainText(message);
  }

  async verifyMiniCartCount(expected: string) {
    await UIHelpers.waitForVisible(this.miniCartCount, "Mini Cart Count");
    await expect(this.miniCartCount).toContainText(expected);
  }

  async verifyMiniCartCountNotZero() {
    await UIHelpers.waitForVisible(this.miniCartCount, "Mini Cart Count");
    await expect(this.miniCartCount).not.toContainText("(0)");
  }

  async verifyMiniCartContains(text: string) {
    await UIHelpers.waitForVisible(this.miniCartDropdown, "Mini Cart Dropdown");
    await expect(this.miniCartDropdown).toContainText(text);
  }

  async verifyMiniCartVisible() {
    await UIHelpers.waitForVisible(this.miniCartDropdown, "Mini Cart Dropdown");
  }

  async verifyMiniCartHidden() {
    await UIHelpers.waitForHidden(this.miniCartDropdown, "Mini Cart Dropdown");
  }

  async hoverOut(x: number, y: number) {
    await this.page.locator("body").hover({ position: { x, y } });
  }
}

// import { Locator, Page, expect } from "@playwright/test";
// import { BasePage } from "./BasePage";
// import UIHelpers from "../helpers/UIHelpers";
// import { logStep } from "../helpers/Logger";

// export class HomePage extends BasePage {
//   // ===== LOCATORS =====
//   readonly searchInput = this.page.locator("#small-searchterms");
//   readonly searchButton = this.page.locator("button.search-box-button");

//   readonly miniCart = this.page.locator("#topcartlink");
//   readonly miniCartCount = this.page.locator(".cart-qty");
//   readonly miniCartLabel = this.page.locator(".cart-label");
//   readonly miniCartDropdown = this.page.locator("#flyout-cart");

//   readonly successNotification = this.page.locator(".bar-notification.success");
//   readonly errorNotification = this.page.locator(".bar-notification.error");
//   readonly closeNotificationButton = this.page.locator(".bar-notification .close");

//   constructor(page: Page) {
//     super(page);
//   }

//   // ===== NAVIGATION =====
//   async goto(url: string) {
//     logStep("Navigate to Home Page");
//     await super.goto(url);
//     await this.waitForPageLoad();
//     await UIHelpers.waitForVisible(this.searchInput, "Search Input");
//   }

//   // ===== SEARCH (BASIC) =====
//   async search(keyword: string, useEnter = false) {
//     logStep(`Search: "${keyword}" (enter=${useEnter})`);

//     await this.inputText(this.searchInput, keyword, "Search Input");

//     if (useEnter) {
//       await this.searchInput.press("Enter");
//     } else {
//       await this.clickElement(this.searchButton, "Search Button");
//     }

//     await this.waitForPageLoad("domcontentloaded");
//   }

//   // ===== VERIFY SEARCH INPUT =====
//   async verifySearchInputValue(expected: string) {
//     await expect(this.searchInput).toHaveValue(expected);
//   }

  // // ===== CATEGORY =====
  // async navigateToCategory(top: string, sub?: string) {
  //   logStep(`Navigate: ${top} ${sub ? `> ${sub}` : ""}`);

  //   const topMenu = this.page
  //     .locator(".header-menu .top-menu > li > a")
  //     .filter({ hasText: new RegExp(`^${top}$`, "i") })
  //     .first();

  //   await UIHelpers.waitForVisible(topMenu, `Top menu: ${top}`);

  //   if (sub) {
  //     await topMenu.hover();

  //     const subMenu = this.page
  //       .locator(".header-menu .sublist li a")
  //       .filter({ hasText: new RegExp(`^${sub}$`, "i") })
  //       .first();

  //     await UIHelpers.waitForVisible(subMenu, `Sub menu: ${sub}`);
  //     await subMenu.click();
  //   } else {
  //     await topMenu.click();
  //   }

  //   await this.waitForPageLoad();
  // }

//   // ===== NOTIFICATION =====
//   async verifyNotification(type: "success" | "error", message: string) {
//     const locator =
//       type === "success" ? this.successNotification : this.errorNotification;

//     logStep(`Verify ${type} notification`);

//     await UIHelpers.waitForVisible(locator, `${type} notification`, 15000);
//     await expect(locator).toContainText(message);
//   }

//   async closeNotificationIfVisible() {
//     if (await this.closeNotificationButton.isVisible()) {
//       await this.closeNotificationButton.click();
//     }
//   }

//   // ===== MINI CART =====
//   async openMiniCart() {
//     logStep("Open mini cart");

//     await this.page.evaluate(() => window.scrollTo(0, 0));

//     await UIHelpers.waitForVisible(this.miniCartLabel, "Mini Cart");
//     await this.miniCartLabel.hover();

//     await UIHelpers.waitForVisible(
//       this.miniCartDropdown,
//       "Mini Cart Dropdown"
//     );
//   }

//   async verifyMiniCartEmpty(
//     message: string = "You have no items in your shopping cart."
//   ) {
//     await expect(this.miniCartDropdown).toContainText(message);
//   }
// }
