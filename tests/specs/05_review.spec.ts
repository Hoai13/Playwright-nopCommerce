import { test, expect } from "@playwright/test";
import { ReviewPage } from "../../pages/ReviewPage";
import { RegisterPage } from "../../pages/RegisterPage";
import { HomePage } from "../../pages/HomePage";
import { CategoryPage } from "../../pages/CategoryPage";
import { randomEmail } from "../../helpers/commonHelper";
import reviewData from "../data/review.data.json";
import { ReviewDataFile } from "../../types/review.type";
import { resolveSpecialTokens } from "../../helpers/dataHelper";

const data = (reviewData as unknown) as ReviewDataFile;

test.describe("Product Review Automation", () => {
  
  const setupProduct = async (page: any) => {
    const home = new HomePage(page);
    const category = new CategoryPage(page);
    await home.goto(data.URLS.HOME);
    await home.navigateToCategory(data.PRODUCT.CATEGORY, data.PRODUCT.SUB_CATEGORY);
    await category.viewProductDetails(data.PRODUCT.NAME);
  };

  const setupUser = async (page: any) => {
    const register = new RegisterPage(page);
    await register.goto(data.URLS.REGISTER);
    await register.fillRegisterForm({
      ...data.REGISTER_USER,
      email: randomEmail(data.REGISTER_USER.emailPrefix)
    });
    await register.clickRegister();
  };

  for (const tc of data.CASES) {
    test(`${tc.id} - ${tc.flow}`, async ({ page }) => {
      const reviewPage = new ReviewPage(page);

      if (tc.requiresLogin) {
        await setupUser(page);
      }
      await setupProduct(page);

      if (tc.flow === "viewWithoutLogin") {
        await expect(reviewPage.reviewList).toBeVisible();
        return;
      }

      await reviewPage.openReviewForm();

      const payload = tc.review 
        ? resolveSpecialTokens(tc.review, data.VALUES as Record<string, string>) 
        : {};
      
      await reviewPage.fillReview(payload);
      await reviewPage.submitButton.click();

      if (tc.expect?.errorKey) {
        const msgs = data.MESSAGES as Record<string, string>;
        const expectedText = msgs[tc.expect.errorKey];
        
        await expect(reviewPage.errorMessage).toContainText(expectedText);
      }
    });
  }
});