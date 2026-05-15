import { test, expect } from "@playwright/test";
import { HomePage } from "../../pages/HomePage";
import { CategoryPage } from "../../pages/CategoryPage";
import productCategoryData from "../data/productCategory.data.json";
import { logTitle } from "../../helpers/logger";
import type { ProductCategoryDataFile } from "../../types/productCategory.type";

const dataFile = productCategoryData as unknown as ProductCategoryDataFile;

test.describe("Product Category", () => {
  let homePage: HomePage;
  let categoryPage: CategoryPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    categoryPage = new CategoryPage(page);
    await homePage.goto(dataFile.URLS.HOME);
  });

  for (const tc of dataFile.CASES) {
    test(`${tc.id} - ${tc.description}`, async ({ page }) => {
      logTitle(`RUN TEST: ${tc.id} - ${tc.description}`);

      
      await test.step("Navigate to category", async () => {
        await homePage.navigateToCategory(
          tc.input.category,
          tc.input.subCategory
        );
      });

      if (tc.input.product) {
        await test.step("Perform product action", async () => {
          const product = tc.input.product!;
          const notificationType = tc.expected.notification;

          if (notificationType === "ADD_WISHLIST_SUCCESS") {
            await categoryPage.addToWishlistFromList(product);
          } else if (notificationType === "ADD_COMPARE_SUCCESS") {
            await categoryPage.addToCompareFromList(product);
          } else {
            await categoryPage.viewProductDetails(product);
          }
        });
      }

      await test.step("Verify result", async () => {
        const { expected } = tc;

        if (expected.title) {
          await categoryPage.expectTitle(expected.title);
        }

        if (expected.breadcrumb) {
          await categoryPage.expectBreadcrumb(expected.breadcrumb);
        }

        if (expected.subCategories) {
          await categoryPage.expectSubCategories(expected.subCategories);
        }

        if (expected.urlContains) {
          await expect(page).toHaveURL(new RegExp(expected.urlContains, "i"));
        }

        if (expected.notification) {
          const expectedMessage = dataFile.MESSAGES[expected.notification];
          await categoryPage.expectSuccessNotificationContains(expectedMessage);
        }
      });
    });
  }
});