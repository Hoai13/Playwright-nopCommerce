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

// import { test, expect } from "@playwright/test";
// import { RegisterPage } from "../../pages/RegisterPage";
// import registerData from "../data/register.data.json";
// import type {
//   RegisterFormData,
//   RegisterTestCase,
//   RegisterExpected,
//   RegisterDataFile,
// } from "../../types/register.type";
// import { randomEmail } from "../../helpers/commonHelper";
// import { resolveSpecialValues } from "../../helpers/dataHelper";
// import { logStep, logTitle } from "../../helpers/logger";

// const dataFile = registerData as RegisterDataFile; //"hãy coi registerData có structure giống RegisterDataFile"

// test.describe("Register Data Driven", () => {

//   let registerPage: RegisterPage;

//   test.beforeAll(() => {
//     logTitle("===== START REGISTER TEST =====");
//   });

//   test.afterAll(() => {
//     logTitle("===== END REGISTER TEST =====");
//   });

//   test.beforeEach(async ({ page }) => {
//     registerPage = new RegisterPage(page);

//     logStep("Navigate to Register page");
//     await page.goto(dataFile.URL);
//   });

//   const buildData = (override: Partial<RegisterFormData> = {}) => ({
//     ...dataFile.BASE_VALID,
//     email: randomEmail(),
//     ...override,
//   });

//   const verifyExpected = async (
//     page: any,
//     expected: RegisterExpected
//   ) => {
//     if (expected.success) {
//       await expect(registerPage.resultMessage).toContainText(dataFile.MESSAGES.REGISTER_SUCCESS);
//       await expect(registerPage.logoutLink).toBeVisible();
//       return;
//     }

//     await expect(page).toHaveURL(/register/i);
//     await expect(registerPage.resultMessage).toHaveCount(0);

//     if (expected.field) {
//       const fieldError = registerPage.getFieldErrorLocator(expected.field);
//       await expect(fieldError).toBeVisible();
//       if (expected.message) {
//         await expect(fieldError).toContainText(expected.message);
//       }
//     }

//     if (expected.summaryMessage) {
//       await expect(registerPage.validationSummaryErrors).toBeVisible();
//       await expect(registerPage.validationSummaryErrors).toContainText(
//         expected.summaryMessage
//       );
//     }
//   };

//   const cases = dataFile.CASES;

//   for (const tc of cases) {
//     test(`${tc.id} - ${tc.description}`, async ({ page }) => { //Report sẽ hiện:RE-001 - Register successful, async page nghia la test này sẽ nhận vào một đối tượng page do Playwright cung cấp, đại diện cho một tab trình duyệt. Chúng ta sẽ sử dụng đối tượng này để tương tác với trang web trong suốt quá trình test.
//       logTitle(`RUN TEST: ${tc.id} - ${tc.description}`);

//       // ===== BUILD DATA =====
//       const rawData = buildData(tc.override);
//       const finalData = resolveSpecialValues(rawData);

//       // ===== FILL =====
//       await test.step("Fill form", async () => {
//         await registerPage.fillRegisterForm(finalData);
//       });

//       if (tc.flow === "passwordMaskingOnly") {
//         await test.step("Verify password masking UI", async () => { //test.step dùng để, Chia report thành step. Khi test chạy, trong phần report sẽ hiển thị rõ ràng từng step này, giúp dễ dàng theo dõi và debug hơn.
//           const ui = dataFile.UI_ASSERTIONS.PASSWORD_MASKING;// lay ra thông tin về passwordType và confirmPasswordType từ dataFile để verify UI của password và confirm password 
//           await expect(registerPage.passwordInput).toHaveAttribute("type", ui.passwordType);
//           await expect(registerPage.confirmPasswordInput).toHaveAttribute(
//             "type",
//             ui.confirmPasswordType
//           );
//         });
//         return;
//       }

//       if (tc.flow === "duplicateEmail") {
//         await test.step("Submit first time", async () => {
//           await registerPage.clickRegister();
//         });

//         await test.step("Verify first registration success", async () => {
//           await expect(registerPage.resultMessage).toContainText(dataFile.MESSAGES.REGISTER_SUCCESS);
//           await expect(registerPage.logoutLink).toBeVisible();
//         });

//         await test.step("Submit second time with same email", async () => {
//           await registerPage.clickElement(registerPage.logoutLink, "Logout");
//           await page.goto(dataFile.URL);
//           await registerPage.fillRegisterForm(finalData);
//           await registerPage.clickRegister();
//         });

//         await test.step("Verify duplicate email error", async () => {
//           await verifyExpected(page, {
//             success: false,
//             summaryMessage: dataFile.BUSINESS_FLOW.DUPLICATE_EMAIL.summaryMessage,
//           });
//         });
//         return;
//       }

//       // ===== SUBMIT =====
//       await test.step("Submit", async () => {
//         if (tc.id === "RE-026") {
//           await registerPage.submitByEnter();
//         } else {
//           await registerPage.clickRegister();
//         }
//       });

//       // ===== VERIFY =====
//       await test.step("Verify", async () => {
//         await verifyExpected(page, tc.expected);
//       });
//     });
//   }
// });