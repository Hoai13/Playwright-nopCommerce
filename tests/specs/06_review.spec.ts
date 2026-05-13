import { test } from "@playwright/test";
import { HomePage } from "../../pages/HomePage";
import { CategoryPage } from "../../pages/CategoryPage";
import { ReviewPage } from "../../pages/ReviewPage";
import { RegisterPage } from "../../pages/RegisterPage";
import reviewData from "../data/review.data.json";
import { randomEmail } from "../../helpers/commonHelper";
import { resolveSpecialTokens } from "../../helpers/dataHelper";
import { logTitle } from "../../helpers/Logger";
import { ReviewDataFile, ReviewPayload } from "../../types/review.type";

const dataFile = reviewData as ReviewDataFile;
const msg = (key?: string) => (key ? dataFile.MESSAGES[key] : "");

const resolveReviewPayload = (payload?: ReviewPayload): ReviewPayload | undefined => {
  if (!payload) return payload;
  return resolveSpecialTokens(payload);
};

const goToReviewProduct = async (
  homePage: HomePage,
  categoryPage: CategoryPage,
  reviewPage: ReviewPage
) => {
  await homePage.goto(dataFile.URLS.HOME);
  await homePage.navigateToCategory(dataFile.PRODUCT.CATEGORY, dataFile.PRODUCT.SUB_CATEGORY);
  await categoryPage.viewProductDetails(dataFile.PRODUCT.NAME);
  await reviewPage.scrollToReviewSection();
};

const registerUser = async (registerPage: RegisterPage) => {
  await registerPage.goto(dataFile.URLS.REGISTER);
  await registerPage.fillRegisterForm({
    firstName: dataFile.REGISTER_USER.firstName,
    lastName: dataFile.REGISTER_USER.lastName,
    email: randomEmail(dataFile.REGISTER_USER.emailPrefix),
    password: dataFile.REGISTER_USER.password,
    confirmPassword: dataFile.REGISTER_USER.confirmPassword,
  });
  await registerPage.clickRegister();
  await registerPage.expectRegistrationSuccess();
};

test.describe("Add Review", () => {
  //test.describe.configure({ mode: "serial" });
  test.beforeAll(() => {
    logTitle("===== START REVIEW TEST =====");
  });

  test.afterAll(() => {
    logTitle("===== END REVIEW TEST =====");
  });

  for (const tc of dataFile.CASES) {
    test(`${tc.id} - ${tc.flow}`, async ({ page, browser }) => {
      const homePage = new HomePage(page);
      const categoryPage = new CategoryPage(page);
      const reviewPage = new ReviewPage(page);
      const registerPage = new RegisterPage(page);

      if (tc.flow === "viewWithoutLogin") {
        await goToReviewProduct(homePage, categoryPage, reviewPage);
        await reviewPage.expectReviewListVisible();
        await reviewPage.expectLoginLinkVisible();
        await reviewPage.expectVoteButtonsVisible();
        return;
      }

      if (tc.flow === "guestVoteHelpfulness") {
        await goToReviewProduct(homePage, categoryPage, reviewPage);
        await reviewPage.voteReview(0, true);
        await reviewPage.expectResultOrErrorVisible();
        return;
      }

      if (tc.flow === "voteOwnReview") {
        await registerUser(registerPage);
        await goToReviewProduct(homePage, categoryPage, reviewPage);
        await reviewPage.openReviewForm();
        await reviewPage.fillReview(resolveReviewPayload(tc.review) || {});
        await reviewPage.submitReview();
        await reviewPage.voteReview(0, true);
        await reviewPage.expectResultOrErrorVisible();
        return;
      }

      if (tc.flow === "voteOtherReview") {
        const ctx1 = await browser.newContext();
        const page1 = await ctx1.newPage();
        const home1 = new HomePage(page1);
        const category1 = new CategoryPage(page1);
        const review1 = new ReviewPage(page1);
        const register1 = new RegisterPage(page1);

        await registerUser(register1);
        await goToReviewProduct(home1, category1, review1);
        await review1.openReviewForm();
        await review1.fillReview(resolveReviewPayload(tc.seedReview) || {});
        await review1.submitReview();

        const ctx2 = await browser.newContext();
        const page2 = await ctx2.newPage();
        const home2 = new HomePage(page2);
        const category2 = new CategoryPage(page2);
        const review2 = new ReviewPage(page2);
        const register2 = new RegisterPage(page2);

        await registerUser(register2);
        await goToReviewProduct(home2, category2, review2);
        await review2.voteReview(0, true);
        await review2.expectResultOrErrorVisible();

        await ctx2.close();
        await ctx1.close();
        return;
      }

      if (tc.flow === "submitReview") {
        if (tc.requiresLogin) {
          await registerUser(registerPage);
        }

        await goToReviewProduct(homePage, categoryPage, reviewPage);
        await reviewPage.openReviewForm();
        await reviewPage.fillReview(resolveReviewPayload(tc.review) || {});
        await reviewPage.submitReview();

        if (tc.expect?.success) {
          await reviewPage.expectSuccess(msg("REVIEW_SUCCESS"));
          if (tc.expect.containsTitle) {
            await reviewPage.expectReviewVisible(tc.expect.containsTitle);
          }
          return;
        }

        if (tc.expect?.errorKey) {
          await reviewPage.expectError(msg(tc.expect.errorKey));
          return;
        }

        if (tc.expect?.resultOrErrorVisible) {
          await reviewPage.expectResultOrErrorVisible();
        }
      }
    });
  }

  for (const rating of dataFile.RATING_CASES) {
    test(`RV-012-${rating} - select rating ${rating}`, async ({ page }) => {
      const homePage = new HomePage(page);
      const categoryPage = new CategoryPage(page);
      const reviewPage = new ReviewPage(page);
      const registerPage = new RegisterPage(page);

      await registerUser(registerPage);
      await goToReviewProduct(homePage, categoryPage, reviewPage);
      await reviewPage.openReviewForm();
      await reviewPage.fillReview({
        title: `${dataFile.RATING_TEMPLATE.titlePrefix} ${rating}`,
        text: dataFile.RATING_TEMPLATE.text,
        rating,
      });
      await reviewPage.submitReview();
      await reviewPage.expectSuccess(msg("REVIEW_SUCCESS"));
    });
  }
});
