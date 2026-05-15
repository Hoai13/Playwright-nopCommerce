import { expect, Locator } from "@playwright/test";
import { logStep, logSuccess, logWarning } from "./logger";

export default class UIHelpers {
  static DEFAULT_TIMEOUT = 10000;

  static async waitForVisible(
    locator: Locator,
    elementName: string,
    timeout: number = UIHelpers.DEFAULT_TIMEOUT
  ) {
    logStep(`Waiting for ${elementName} to be visible`);
    await expect(locator).toBeVisible({ timeout });

    logSuccess(`${elementName} is visible`);
  }

  static async waitForClickable(
    locator: Locator,
    elementName: string,
    timeout: number = UIHelpers.DEFAULT_TIMEOUT
  ) {
    logStep(`Waiting for ${elementName} to be clickable`);

    await this.waitForVisible(locator, elementName, timeout);
    await expect(locator).toBeEnabled({ timeout });

    logSuccess(`${elementName} is clickable`);
  }

  static async waitForHidden(
    locator: Locator,
    elementName: string,
    timeout: number = UIHelpers.DEFAULT_TIMEOUT
  ) {
    logStep(`Waiting for ${elementName} to be hidden`);

    await expect(locator).toBeHidden({ timeout });

    logSuccess(`${elementName} is hidden`);
  }

  static async waitForEnabled(
    locator: Locator,
    elementName: string,
    timeout: number = UIHelpers.DEFAULT_TIMEOUT
  ) {
    logStep(`Waiting for ${elementName} to be enabled`);

    await expect(locator).toBeEnabled({ timeout });

    logSuccess(`${elementName} is enabled`);
  }

  static async waitForDisabled(
    locator: Locator,
    elementName: string,
    timeout: number = UIHelpers.DEFAULT_TIMEOUT
  ) {
    logStep(`Waiting for ${elementName} to be disabled`);

    await expect(locator).toBeDisabled({ timeout });

    logSuccess(`${elementName} is disabled`);
  }

  static async waitForAttribute(
    locator: Locator,
    elementName: string,
    attribute: string,
    expectedValue: string | RegExp,
    timeout: number = UIHelpers.DEFAULT_TIMEOUT
  ) {
    logStep(
      `Waiting for ${elementName} attribute ${attribute} to match ${expectedValue}`
    );

    await expect(locator).toHaveAttribute(attribute, expectedValue, { timeout });

    logSuccess(`${elementName} has expected attribute ${attribute}`);
  }

  static async isElementDisabled(locator: Locator, elementName: string) {
    logStep(`Checking if ${elementName} is disabled`);
    const disabled = await locator.isDisabled();
    logSuccess(`${elementName} disabled = ${disabled}`);
    return disabled;
  }

  static async waitForText(
    locator: Locator,
    elementName: string,
    expected: string | RegExp,
    timeout: number = UIHelpers.DEFAULT_TIMEOUT
  ) {
    logStep(`Waiting for ${elementName} text: ${expected}`);

    await expect(locator).toContainText(expected, { timeout });

    logSuccess(`${elementName} contains expected text`);
  }

  static async retry(
    action: () => Promise<void>,
    retries = 3,
    delay = 1000
  ) {
    for (let i = 0; i < retries; i++) {
      try {
        await action();
        return;
      } catch (err) {
        if (i === retries - 1) throw err;

        logWarning(`Retry ${i + 1}/${retries}: ${err}`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
}