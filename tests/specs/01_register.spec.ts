import { test, expect } from "@playwright/test";
import { RegisterPage } from "../../pages/RegisterPage";
import registerData from "../data/register.data.json";
import type { RegisterFormData, RegisterDataFile } from "../../types/register.type";
import { randomEmail } from "../../helpers/commonHelper";
import { resolveSpecialValues } from "../../helpers/dataHelper";
import { logStep, logTitle } from "../../helpers/logger";

const dataFile = registerData as RegisterDataFile;

test.describe("Register Data Driven", () => {
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
    await registerPage.goto(dataFile.URL);
  });

  const buildData = (override: Partial<RegisterFormData> = {}) => ({
    ...dataFile.BASE_VALID,
    email: randomEmail(),
    ...override,
  });

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

      // ===== SPECIAL FLOW =====
      if (tc.flow === "passwordMaskingOnly") {
        await test.step("Verify password masking UI", async () => {
          const ui = dataFile.UI_ASSERTIONS.PASSWORD_MASKING;

          await expect(registerPage.passwordInput).toHaveAttribute("type", ui.passwordType);
          await expect(registerPage.confirmPasswordInput).toHaveAttribute("type", ui.confirmPasswordType);
        });
        return;
      }

      // ===== DUPLICATE EMAIL FLOW =====
      if (tc.flow === "duplicateEmail") {
        await test.step("Submit first time", async () => {
          await registerPage.clickRegister();
        });

        await test.step("Verify first registration success", async () => {
          await registerPage.verifyResult({ success: true });
        });

        await test.step("Submit second time with same email", async () => {
          await registerPage.clickElement(registerPage.logoutLink, "Logout");
          await registerPage.goto(dataFile.URL);
          await registerPage.fillRegisterForm(finalData);
          await registerPage.clickRegister();
        });

        await test.step("Verify duplicate email error", async () => {
          await registerPage.verifyResult({
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
        await registerPage.verifyResult(tc.expected);
      });
    });
  }
});
