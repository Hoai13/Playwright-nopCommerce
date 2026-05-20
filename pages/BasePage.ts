import { Page, Locator, expect } from "@playwright/test";
import UIHelpers from "../helpers/UIHelpers";
import { logStep } from "../helpers/logger";

export class BasePage {
  constructor(readonly page: Page) {} //NHẬN browser tab từ Playwright rồi lưu vào class

  async goto(url: string): Promise<void> {
    logStep(`Navigating to ${url}`);
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
  }

  async clickElement(locator: Locator, elementName: string): Promise<void> {
    logStep(`Clicking element: ${elementName}`);
    await UIHelpers.waitForClickable(locator, elementName);
    await locator.click();
  }

  async inputText(
    locator: Locator,
    text: string,
    elementName: string
  ): Promise<void> {
    logStep(`Inputting "${text}" into element: ${elementName}`);
    await UIHelpers.waitForVisible(locator, elementName);
    await locator.fill(text);
  }

  async getText(locator: Locator, elementName: string): Promise<string> {
    await UIHelpers.waitForVisible(locator, elementName);
    const text = (await locator.textContent())?.trim() || "";
    logStep(`Getting text from ${elementName}: ${text}`);
    return text;
  }

  async verifyVisible(locator: Locator, elementName: string): Promise<void> {
    logStep(`Verifying ${elementName} is visible`);
    await UIHelpers.waitForVisible(locator, elementName);
  }

  async selectDropdown(
    locator: Locator,
    value: string,
    elementName: string
  ): Promise<void> {
    logStep(`Selecting "${value}" from ${elementName}`);
    await UIHelpers.waitForVisible(locator, elementName);
    await locator.selectOption(value);
  }

  async getAttribute(
    locator: Locator,
    attribute: string,
    elementName: string
  ): Promise<string | null> {
    await UIHelpers.waitForVisible(locator, elementName);
    return locator.getAttribute(attribute);
  }

  async waitForUrlContains(text: string, timeout = 10000): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(text), { timeout });
  }

  async waitForPageLoad(
    state: "load" | "domcontentloaded" | "networkidle" = "domcontentloaded"
  ): Promise<void> {
    await this.page.waitForLoadState(state);
    await this.page.waitForTimeout(200);
  }

  async readTableData(
    tableLocator: Locator,
    nextBtn: Locator
  ): Promise<string[][]> {
    logStep("Reading table data");
    const result: string[][] = [];

    while (true) {
      const rows = tableLocator.locator("tbody tr");
      const rowCount = await rows.count();

      for (let i = 0; i < rowCount; i++) {
        const cells = rows.nth(i).locator("td");
        const cellCount = await cells.count();
        const row: string[] = [];

        for (let j = 0; j < cellCount; j++) {
          const cellText = (await cells.nth(j).textContent())?.trim() || "";
          row.push(cellText);
        }

        result.push(row);
      }

      if (await nextBtn.isDisabled()) break;

      await this.clickElement(nextBtn, "Next Button");
      await this.waitForPageLoad();
    }

    logStep(`Table data read: ${JSON.stringify(result)}`);
    return result;
  }
}