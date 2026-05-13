import { test, expect } from "@playwright/test";
import { RegisterPage } from "../../pages/RegisterPage";
import registerData from "../data/register.data.json";
import { RegisterFormData, RegisterTestCase, RegisterExpected } from "../../types/register.type";
import { randomEmail } from "../../helpers/commonHelper";
import { resolveSpecialValues } from "../../helpers/dataHelper";
import { logStep, logTitle } from "../../helpers/Logger";
import { waitPastCloudflareIfAny } from "../../helpers/assertions";

type ExtendedRegisterCase = RegisterTestCase & {
  flow?: "duplicateEmail" | "passwordMaskingOnly";
};

type RegisterDataFile = {
  URL: string;
  MESSAGES: {
    REGISTER_SUCCESS: string;
  };
  BASE_VALID: RegisterFormData;
  BUSINESS_FLOW: {
    DUPLICATE_EMAIL: {
      summaryMessage: string;
    };
  };
  UI_ASSERTIONS: {
    PASSWORD_MASKING: {
      passwordType: string;
      confirmPasswordType: string;
    };
  };
  CASES: ExtendedRegisterCase[];
};

const dataFile = registerData as RegisterDataFile;

test.describe("Register Data Driven", () => {
  //test.describe.configure({ mode: "serial" });
  //test.describe.configure({ retries: 1 });

  let registerPage: RegisterPage;

  test.beforeAll(() => {
    logTitle("===== START REGISTER TEST =====");
  });

  test.afterAll(() => {
    logTitle("===== END REGISTER TEST =====");
  });

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);

    logStep("Navigate to Register page");
    await page.goto(dataFile.URL);
    await waitPastCloudflareIfAny(page);
  });

  const buildData = (override: Partial<RegisterFormData> = {}) => ({
    ...dataFile.BASE_VALID,
    email: randomEmail(),
    ...override,
  });

  const verifyExpected = async (
    page: any,
    expected: RegisterExpected
  ) => {
    if (expected.success) {
      await expect(registerPage.resultMessage).toContainText(dataFile.MESSAGES.REGISTER_SUCCESS);
      await expect(registerPage.logoutLink).toBeVisible();
      return;
    }

    await expect(page).toHaveURL(/register/i);
    await expect(registerPage.resultMessage).toHaveCount(0);

    if (expected.field) {
      const fieldError = registerPage.getFieldErrorLocator(expected.field);
      await expect(fieldError).toBeVisible();
      if (expected.message) {
        await expect(fieldError).toContainText(expected.message);
      }
    }

    if (expected.summaryMessage) {
      await expect(registerPage.validationSummaryErrors).toBeVisible();
      await expect(registerPage.validationSummaryErrors).toContainText(
        expected.summaryMessage
      );
    }
  };

  const cases = dataFile.CASES;

  for (const tc of cases) {
    test(`${tc.id} - ${tc.description}`, async ({ page }) => {
      logTitle(`RUN TEST: ${tc.id} - ${tc.description}`);

      // ===== BUILD DATA =====
      const rawData = buildData(tc.override);
      const finalData = resolveSpecialValues(rawData);

      // ===== FILL =====
      await test.step("Fill form", async () => {
        await registerPage.fillRegisterForm(finalData);
      });

      if (tc.flow === "passwordMaskingOnly") {
        await test.step("Verify password masking UI", async () => {
          const ui = dataFile.UI_ASSERTIONS.PASSWORD_MASKING;
          await expect(registerPage.passwordInput).toHaveAttribute("type", ui.passwordType);
          await expect(registerPage.confirmPasswordInput).toHaveAttribute(
            "type",
            ui.confirmPasswordType
          );
        });
        return;
      }

      if (tc.flow === "duplicateEmail") {
        await test.step("Submit first time", async () => {
          await registerPage.clickRegister();
        });

        await test.step("Verify first registration success", async () => {
          await expect(registerPage.resultMessage).toContainText(dataFile.MESSAGES.REGISTER_SUCCESS);
          await expect(registerPage.logoutLink).toBeVisible();
        });

        await test.step("Submit second time with same email", async () => {
          await registerPage.clickElement(registerPage.logoutLink, "Logout");
          await page.goto(dataFile.URL);
          await registerPage.fillRegisterForm(finalData);
          await registerPage.clickRegister();
        });

        await test.step("Verify duplicate email error", async () => {
          await verifyExpected(page, {
            success: false,
            summaryMessage: dataFile.BUSINESS_FLOW.DUPLICATE_EMAIL.summaryMessage,
          });
        });
        return;
      }

      // ===== SUBMIT =====
      await test.step("Submit", async () => {
        if (tc.id === "RE-026") {
          await registerPage.submitByEnter();
        } else {
          await registerPage.clickRegister();
        }
      });

      // ===== VERIFY =====
      await test.step("Verify", async () => {
        await verifyExpected(page, tc.expected);
      });
    });
  }
});