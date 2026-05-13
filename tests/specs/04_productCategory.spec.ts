import { test, expect } from "@playwright/test";
import { HomePage } from "../../pages/HomePage";
import { CategoryPage } from "../../pages/CategoryPage";
import productCategoryData from "../data/productCategory.data.json";
import { logTitle, logStep } from "../../helpers/Logger";
import {
  ProductCategoryDataFile,
  ProductCategoryTestCase,
} from "../../types/productCategory.type";

const dataFile = productCategoryData as ProductCategoryDataFile;

test.describe("Product Category", () => {
  //test.describe.configure({ mode: "serial" });
  let homePage: HomePage;
  let categoryPage: CategoryPage;

  test.beforeAll(() => {
    logTitle("===== START PRODUCT CATEGORY TEST =====");
  });

  test.afterAll(() => {
    logTitle("===== END PRODUCT CATEGORY TEST =====");
  });

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    categoryPage = new CategoryPage(page);
    await homePage.goto(dataFile.URLS.HOME);
  });

  for (const tc of dataFile.CASES as ProductCategoryTestCase[]) {
    test(`${tc.id} - ${tc.description}`, async ({ page }) => {
      logTitle(`RUN TEST: ${tc.id} - ${tc.description}`);

      switch (tc.flow) {
        case "categoryBasic": {
          await test.step("Navigate to category", async () => {
            await homePage.navigateToCategory(tc.category || "", tc.subCategory);
          });

          await test.step("Verify category page", async () => {
            if (tc.expected?.title) await categoryPage.expectTitle(tc.expected.title);
            if (tc.expected?.breadcrumb) await categoryPage.expectBreadcrumb(tc.expected.breadcrumb);
            if (tc.expected?.subCategories?.length) {
              await categoryPage.expectSubCategories(tc.expected.subCategories);
            }
          });
          break;
        }

        case "categoryNoProduct": {
          await test.step("Navigate to category", async () => {
            await homePage.navigateToCategory(tc.category || "", tc.subCategory);
          });

          await test.step("Edit URL to no-result query", async () => {
            const query = tc.invalidQuery || "specs=9999";
            await page.goto(`${page.url()}?${query}`);
          });

          await test.step("Verify no products message", async () => {
            await categoryPage.expectNoProduct(tc.expected?.message || dataFile.MESSAGES.NO_PRODUCTS);
          });
          break;
        }

        case "hoverSubMenu": {
          await test.step("Hover top category", async () => {
            await homePage.hoverCategory(tc.category || "");
          });

          await test.step("Verify sub-categories visible", async () => {
            const subMenuTexts = await homePage.getSubMenuTexts();
            for (const item of tc.expected?.subCategories || []) {
              expect(subMenuTexts).toContain(item);
            }
          });
          break;
        }

        case "navigateSubCategory": {
          await test.step("Navigate to sub-category", async () => {
            await homePage.navigateToCategory(tc.category || "", tc.subCategory);
          });

          await test.step("Verify sub-category page", async () => {
            if (tc.expected?.title) await categoryPage.expectTitle(tc.expected.title);
            if (tc.expected?.breadcrumb) await categoryPage.expectBreadcrumb(tc.expected.breadcrumb);
          });
          break;
        }

        case "breadcrumbDisplay": {
          await test.step("Navigate to category", async () => {
            await homePage.navigateToCategory(tc.category || "", tc.subCategory);
          });

          await test.step("Verify breadcrumb", async () => {
            if (tc.expected?.breadcrumb) await categoryPage.expectBreadcrumb(tc.expected.breadcrumb);
          });
          break;
        }

        case "breadcrumbToHome": {
          await test.step("Navigate to category", async () => {
            await homePage.navigateToCategory(tc.category || "", tc.subCategory);
          });

          await test.step("Click Home breadcrumb", async () => {
            await categoryPage.clickBreadcrumb(tc.breadcrumbClick || dataFile.MESSAGES.HOME_BREADCRUMB);
          });

          await test.step("Verify home URL", async () => {
            await expect(page).toHaveURL(
              new RegExp(tc.expected?.urlRegex || dataFile.MESSAGES.HOME_URL_REGEX)
            );
            await expect(page.locator(".header-logo a")).toBeVisible();
          });
          break;
        }

        case "breadcrumbToParent": {
          await test.step("Navigate to sub-category", async () => {
            await homePage.navigateToCategory(tc.category || "", tc.subCategory);
          });

          await test.step("Click parent breadcrumb", async () => {
            await categoryPage.clickBreadcrumb(tc.breadcrumbClick || tc.category || "");
          });

          await test.step("Verify parent category", async () => {
            if (tc.expected?.title) await categoryPage.expectTitle(tc.expected.title);
            if (tc.expected?.breadcrumb) await categoryPage.expectBreadcrumb(tc.expected.breadcrumb);
          });
          break;
        }

        case "viewModeDefault": {
          await test.step("Navigate to category", async () => {
            await homePage.navigateToCategory(tc.category || "", tc.subCategory);
          });

          await test.step("Verify default grid view", async () => {
            await categoryPage.expectGridLayout();
          });
          break;
        }

        case "viewModeGrid": {
          await test.step("Navigate to category", async () => {
            await homePage.navigateToCategory(tc.category || "", tc.subCategory);
          });

          await test.step("Switch to grid and verify", async () => {
            await categoryPage.switchToGrid();
            await categoryPage.waitForUrlContains( "viewmode=grid" );
            await categoryPage.expectGridLayout();
          });
          break;
        }

        case "viewModeList": {
          await test.step("Navigate to category", async () => {
            await homePage.navigateToCategory(tc.category || "", tc.subCategory);
          });

          await test.step("Switch to list and verify", async () => {
            await categoryPage.switchToList();
            await categoryPage.waitForUrlContains( "viewmode=list" );
            await categoryPage.expectListLayout();
          });
          break;
        }

        case "viewModeToggle": {
          await test.step("Navigate to category", async () => {
            await homePage.navigateToCategory(tc.category || "", tc.subCategory);
          });

          await test.step("Switch to list", async () => {
            await categoryPage.switchToList();
            await categoryPage.waitForUrlContains( "viewmode=list" );
            await categoryPage.expectListLayout();
          });

          await test.step("Switch back to grid", async () => {
            await categoryPage.switchToGrid();
            await categoryPage.waitForUrlContains( "viewmode=grid" );
            await categoryPage.expectGridLayout();
          });
          break;
        }

        case "viewModePersist": {
          await test.step("Navigate to category", async () => {
            await homePage.navigateToCategory(tc.category || "", tc.subCategory);
          });

          await test.step("Set list view", async () => {
            await categoryPage.switchToList();
            await categoryPage.waitForUrlContains( "viewmode=list" );
            await categoryPage.expectListLayout();
          });

          await test.step("Go to next page", async () => {
            await categoryPage.goNextPage();
           await categoryPage.waitForUrlContains( "viewmode=list" );
           await categoryPage.expectListLayout();
          });

          const sortLabel = tc.sortLabel;
          if (sortLabel) {
            await test.step("Apply sort", async () => {
              await categoryPage.selectSort(sortLabel);
              await categoryPage.waitForUrlContains( "viewmode=list" );
              await categoryPage.expectListLayout();
            });
          }

          const firstFilter = tc.filters?.[0];
          if (firstFilter) {
            await test.step("Apply filter", async () => {
              await categoryPage.applyFilterByLabel(firstFilter.label);
              await categoryPage.waitForUrlContains( "viewmode=list" );
              await categoryPage.expectListLayout();
            });
          }
          break;
        }

        case "productDetail": {
          await test.step("Navigate to product", async () => {
            await homePage.navigateToCategory(tc.category || "", tc.subCategory);
            await categoryPage.viewProductDetails(tc.productName || "");
          });

          await test.step("Verify product detail page", async () => {
            if (tc.expected?.title) await expect(page.locator("h1")).toContainText(tc.expected.title);
            await expect(page.locator(".overview .product-name")).toBeVisible();
            if (tc.expected?.urlRegex) {
              await expect(page).toHaveURL(new RegExp(tc.expected.urlRegex, "i"));
            }
          });
          break;
        }

        case "addToCart": {
          await test.step("Navigate to category", async () => {
            await homePage.navigateToCategory(tc.category || "", tc.subCategory);
          });

          await test.step("Add to cart", async () => {
            await categoryPage.clickAddToCartFromList(tc.productName || "");
          });

          await test.step("Verify add to cart success", async () => {
            await categoryPage.expectSuccessNotificationContains("The product has been added");
            await expect(categoryPage.cartQty).not.toHaveText("(0)");
          });
          break;
        }

        case "requireOptionCart": {
          await test.step("Navigate to category", async () => {
            await homePage.navigateToCategory(tc.category || "", tc.subCategory);
          });

          await test.step("Click add to cart on configurable product", async () => {
            await categoryPage.clickAddToCartFromList(tc.productName || "");
          });

          await test.step("Verify redirected to product detail", async () => {
            if (tc.expected?.urlRegex) {
              await expect(page).toHaveURL(new RegExp(tc.expected.urlRegex, "i"));
            }
          });
          break;
        }

        case "addToWishlist": {
          await test.step("Navigate to category", async () => {
            await homePage.navigateToCategory(tc.category || "", tc.subCategory);
          });

          await test.step("Add to wishlist", async () => {
            await categoryPage.addToWishlistFromList(tc.productName || "");
          });

          await test.step("Verify wishlist success", async () => {
            await categoryPage.expectSuccessNotificationContains("The product has been added to your wishlist");
          });
          break;
        }

        case "requireOptionWishlist": {
          await test.step("Navigate to category", async () => {
            await homePage.navigateToCategory(tc.category || "", tc.subCategory);
          });

          await test.step("Click add to wishlist on configurable product", async () => {
            await categoryPage.addToWishlistFromList(tc.productName || "");
          });

          await test.step("Verify redirected to product detail", async () => {
            if (tc.expected?.urlRegex) {
              await expect(page).toHaveURL(new RegExp(tc.expected.urlRegex, "i"));
            }
          });
          break;
        }

        case "addToCompare": {
          await test.step("Navigate to category", async () => {
            await homePage.navigateToCategory(tc.category || "", tc.subCategory);
          });

          await test.step("Add to compare list", async () => {
            await categoryPage.addToCompareFromList(tc.productName || "");
          });

          await test.step("Verify compare success", async () => {
            await categoryPage.expectSuccessNotificationContains("The product has been added to your product comparison");
          });
          break;
        }

        case "filterSingle": {
          await test.step("Navigate to category", async () => {
            await homePage.navigateToCategory(tc.category || "", tc.subCategory);
          });

          await test.step("Apply single filter", async () => {
            await categoryPage.applyFilterByLabel(tc.filters?.[0]?.label || "");
            await categoryPage.expectFilterChecked(tc.filters?.[0]?.label || "");
          });

          await test.step("Verify products visible", async () => {
            await categoryPage.expectProductsVisible();
          });
          break;
        }

        case "filterMultiple": {
          await test.step("Navigate to category", async () => {
            await homePage.navigateToCategory(tc.category || "", tc.subCategory);
          });

          await test.step("Apply multiple filters", async () => {
            for (const filter of tc.filters || []) {
              await categoryPage.applyFilterByLabel(filter.label);
              await categoryPage.expectFilterChecked(filter.label);
            }
          });

          await test.step("Verify products visible", async () => {
            await categoryPage.expectProductsVisible();
          });
          break;
        }

        case "paginationFirst": {
          await test.step("Navigate to category", async () => {
            await homePage.navigateToCategory(tc.category || "", tc.subCategory);
          });

          const pageSize = tc.pageSize;
          if (pageSize) {
            await test.step("Set page size", async () => {
              await categoryPage.changePageSize(pageSize);
            });
          }

          await test.step("Verify first page", async () => {
            await categoryPage.expectPrevDisabled();
            await categoryPage.expectCurrentPage(tc.expected?.currentPage || 1);
          });
          break;
        }

        case "paginationNext": {
          await test.step("Navigate to category", async () => {
            await homePage.navigateToCategory(tc.category || "", tc.subCategory);
          });

          const pageSize = tc.pageSize;
          if (pageSize) {
            await test.step("Set page size", async () => {
              await categoryPage.changePageSize(pageSize);
            });
          }

          await test.step("Go next page", async () => {
            await categoryPage.goNextPage();
          });

          await test.step("Verify page 2", async () => {
            await categoryPage.expectCurrentPage(tc.expected?.currentPage || 2);
          });
          break;
        }

        case "paginationLast": {
          await test.step("Navigate to category", async () => {
            await homePage.navigateToCategory(tc.category || "", tc.subCategory);
          });

          const pageSize = tc.pageSize;
          if (pageSize) {
            await test.step("Set page size", async () => {
              await categoryPage.changePageSize(pageSize);
            });
          }

          await test.step("Go to last page", async () => {
            await categoryPage.goNextPage();
          });

          await test.step("Verify next disabled", async () => {
            await categoryPage.expectNextDisabled();
          });
          break;
        }

        case "paginationPrevious": {
          await test.step("Navigate to category", async () => {
            await homePage.navigateToCategory(tc.category || "", tc.subCategory);
          });

          const pageSize = tc.pageSize;
          if (pageSize) {
            await test.step("Set page size", async () => {
              await categoryPage.changePageSize(pageSize);
            });
          }

          await test.step("Go to page 2", async () => {
            await categoryPage.goNextPage();
          });

          await test.step("Go previous page", async () => {
            await categoryPage.goPrevPage();
          });

          await test.step("Verify page 1", async () => {
            await categoryPage.expectCurrentPage(tc.expected?.currentPage || 1);
          });
          break;
        }

        case "pageSizeChange": {
          await test.step("Navigate to category", async () => {
            await homePage.navigateToCategory(tc.category || "", tc.subCategory);
          });

          const pageSize = tc.pageSize;
          if (pageSize) {
            await test.step("Change page size", async () => {
              await categoryPage.changePageSize(pageSize);
            });
          }

          await test.step("Verify product count", async () => {
            if (tc.expected?.productsPerPage) {
              await categoryPage.expectProductCountAtMost(tc.expected.productsPerPage);
            }
          });
          break;
        }

        case "pageSizeReset": {
          await test.step("Navigate to category", async () => {
            await homePage.navigateToCategory(tc.category || "", tc.subCategory);
          });

          await test.step("Go to page 2", async () => {
            await categoryPage.goNextPage();
          });

          const pageSize = tc.pageSize;
          if (pageSize) {
            await test.step("Change page size", async () => {
              await categoryPage.changePageSize(pageSize);
            });
          }

          await test.step("Verify reset to page 1", async () => {
            await categoryPage.expectCurrentPage(tc.expected?.currentPage || 1);
          });
          break;
        }

        case "paginationInvalidLow": {
          await test.step("Navigate to category", async () => {
            await homePage.navigateToCategory(tc.category || "", tc.subCategory);
          });

          await test.step("Edit URL with invalid page number", async () => {
            const value = tc.invalidPageNumber || "0";
            await page.goto(`${page.url()}?pagenumber=${value}`);
          });

          await test.step("Verify default page 1", async () => {
            await categoryPage.expectCurrentPage(tc.expected?.currentPage || 1);
            await categoryPage.expectProductsVisible();
          });
          break;
        }

        case "paginationInvalidHigh": {
          await test.step("Navigate to category", async () => {
            await homePage.navigateToCategory(tc.category || "", tc.subCategory);
          });

          await test.step("Edit URL with invalid page number", async () => {
            const value = tc.invalidPageNumber || "999";
            await page.goto(`${page.url()}?pagenumber=${value}`);
          });

          await test.step("Verify no products", async () => {
            await categoryPage.expectNoProduct(tc.expected?.message || dataFile.MESSAGES.NO_PRODUCTS);
          });
          break;
        }

        case "paginationInvalidFormat": {
          await test.step("Navigate to category", async () => {
            await homePage.navigateToCategory(tc.category || "", tc.subCategory);
          });

          await test.step("Edit URL with invalid page number", async () => {
            const value = tc.invalidPageNumber || "abc";
            await page.goto(`${page.url()}?pagenumber=${value}`);
          });

          await test.step("Verify default page 1", async () => {
            await categoryPage.expectCurrentPage(tc.expected?.currentPage || 1);
            await categoryPage.expectProductsVisible();
          });
          break;
        }

        default:
          logStep(`Unhandled flow: ${tc.flow}`);
      }
    });
  }
});
