import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { RegisterFormData } from "../types/register.type";
import { RegisterExpected } from "../types/register.type";
import UIHelpers from "../helpers/UIHelpers";
import { logStep } from "../helpers/logger";

const FIELD_MAP: Record<keyof RegisterFormData, string> = {
    firstName: "FirstName",
    lastName: "LastName",
    email: "Email",
    company: "Company",
    password: "Password",
    confirmPassword: "ConfirmPassword",
    gender: "Gender",
    newsletter: "Newsletter"
  };
  
export class RegisterPage extends BasePage {
  // ===== LOCATORS =====
  readonly firstNameInput = this.page.locator("#FirstName");
  readonly lastNameInput = this.page.locator("#LastName");
  readonly emailInput = this.page.locator("#Email");
  readonly companyInput = this.page.locator("#Company");
  readonly passwordInput = this.page.locator("#Password");
  readonly confirmPasswordInput = this.page.locator("#ConfirmPassword");
  readonly genderMale = this.page.locator("#gender-male");
  readonly genderFemale = this.page.locator("#gender-female");
  readonly newsletterCheckbox = this.page
    .locator("#Newsletter, #NewsLetterSubscriptions_0__IsActive")
    .first();
  readonly registerButton = this.page.locator("#register-button");
  readonly resultMessage = this.page.locator(".result");
  readonly logoutLink = this.page.locator(".ico-logout");
  readonly validationSummaryErrors = this.page.locator(".validation-summary-errors");

  constructor(page: Page) {
    super(page);
  }

  // ===== NAVIGATION =====
  async goto(url: string) {
    await super.goto(url);
    await UIHelpers.waitForVisible(this.firstNameInput, "First Name");
  }

  // ===== ACTION =====
  async fillRegisterForm(data: RegisterFormData) {
    logStep("Filling register form");

    if (data.gender !== undefined) {
      const gender = data.gender === "Male" ? this.genderMale : this.genderFemale;
      await this.clickElement(gender, "Gender");
    }

    if (data.firstName !== undefined)
      await this.inputText(this.firstNameInput, data.firstName, "First Name");

    if (data.lastName !== undefined)
      await this.inputText(this.lastNameInput, data.lastName, "Last Name");

    if (data.email !== undefined)
      await this.inputText(this.emailInput, data.email, "Email");

    if (data.company !== undefined)
      await this.inputText(this.companyInput, data.company, "Company");

    if (data.newsletter !== undefined) {
      const isChecked = await this.newsletterCheckbox.isChecked();

      if (data.newsletter !== isChecked) {
        await this.clickElement(this.newsletterCheckbox, "Newsletter");
      }
    }

    if (data.password !== undefined)
      await this.inputText(this.passwordInput, data.password, "Password");

    if (data.confirmPassword !== undefined)
      await this.inputText(
        this.confirmPasswordInput,
        data.confirmPassword,
        "Confirm Password"
      );
  }

  async clickRegister() {
    await this.clickElement(this.registerButton, "Register Button");
  }

  async submitByEnter() {
    logStep("Submit by Enter");

    await this.confirmPasswordInput.press("Enter");
    await this.waitForPageLoad();
  }

  async verifyResult(expected: RegisterExpected) {
    if (expected.success) {
      await this.expectRegistrationSuccess();
      return;
    }

    await this.expectRegistrationUnsuccessful();

    if (!expected.field && !expected.summaryMessage) {
      console.warn("No validation target provided");
      return;
    }

    if (expected.field) {
      await this.expectFieldError(expected.field, expected.message);
    }

    if (expected.summaryMessage) {
      await this.expectSummaryError(expected.summaryMessage);
    }
  }

  // ===== VERIFY =====
  getFieldErrorLocator(field: keyof RegisterFormData) {
  return this.page.locator(
    `[data-valmsg-for="${FIELD_MAP[field]}"]`
  );
}

  async expectFieldError(field: keyof RegisterFormData, message?: string) {
    const locator = this.getFieldErrorLocator(field);

    await this.verifyVisible(locator, `${field} error message`);

    if (message) {
      await expect(locator).toContainText(message);
    } else {
      await expect(locator).not.toHaveText(/^\s*$/);
    }
  }

  async expectSummaryError(message?: string) {
    await this.verifyVisible(this.validationSummaryErrors, "Summary Error");

    if (message)
      await expect(this.validationSummaryErrors).toContainText(message);
  }

  async expectRegistrationSuccess() {
    await this.verifyVisible(this.resultMessage, "Success Message");
    await expect(this.resultMessage).toContainText("Your registration completed");
    await this.verifyVisible(this.logoutLink, "Logout Link");
  }

  async expectRegistrationUnsuccessful() {
    await this.waitForUrlContains("register");
    await expect(this.resultMessage).toHaveCount(0);
  }
}