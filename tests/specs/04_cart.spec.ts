import { test } from "@playwright/test";
import { HomePage } from "../../pages/HomePage";
import { CartPage } from "../../pages/CartPage";
import { CategoryPage } from "../../pages/CategoryPage";
import cartData from "../data/cart.data.json";
import { addDays } from "../../helpers/commonHelper";
import { logTitle } from "../../helpers/logger";
import type { CartDataFile } from "../../types/cart.type";

const dataFile = cartData as CartDataFile;

test.describe("Shopping Cart", () => {
  let homePage: HomePage;
  let cartPage: CartPage;
  let categoryPage: CategoryPage;

  test.beforeAll(() => {
    logTitle("===== START CART TEST =====");
  });

  test.afterAll(() => {
    logTitle("===== END CART TEST =====");
  });

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    cartPage = new CartPage(page);
    categoryPage = new CategoryPage(page);

    await homePage.goto(dataFile.URLS.HOME);
  });

  const openCategory = async (categoryPath: string[]) => {
    await homePage.navigateToCategory(categoryPath[0], categoryPath[1]);
  };

  for (const tc of dataFile.CASES.ADD_TO_CART) {
    test(`${tc.id} - ${tc.description}`, async () => {
      logTitle(`RUN TEST: ${tc.id}`);

      // ===== OPEN CATEGORY =====
      await test.step("Open category", async () => {
        await openCategory(dataFile.CATEGORIES[tc.input.category!]);
      });

      // ===== CONFIGURABLE PRODUCT =====
      if (tc.input.configuration) {
        await test.step("Open configurable product", async () => {
          await categoryPage.viewProductDetails(dataFile.PRODUCTS[tc.input.product]);
        });

        await test.step("Configure product", async () => {
          await cartPage.configureDesktopProduct(tc.input.configuration!);
        });

        await test.step("Add configurable product", async () => {
          await cartPage.addToCartFromDetail();
        });
      } else {
        // ===== NORMAL PRODUCT =====
        await test.step("Add product to cart", async () => {
          const repeat = tc.input.repeat ?? 1;

          for (let i = 0; i < repeat; i++) {
            await categoryPage.clickAddToCartFromList(dataFile.PRODUCTS[tc.input.product]);
            await homePage.verifyNotificationResult(tc.expected);
            await homePage.closeNotificationIfVisible();
          }
        });
      }

      // ===== MINI CART =====
      if (tc.expected.miniCart) {
        await test.step("Open mini cart", async () => {
          await homePage.openMiniCart();
          await homePage.verifyMiniCartResult(tc.expected);
        });
      }

      // ===== CART PAGE =====
      if (tc.expected.cart) {
        await test.step("Open cart page", async () => {
          await cartPage.goto(dataFile.URLS.CART);
        });
      }

      // ===== VERIFY =====
      await test.step("Verify result", async () => {
        await cartPage.verifyResult(tc.expected);
      });
    });
  }

  for (const tc of dataFile.CASES.QUANTITY_VALIDATION) {
    test(`${tc.id} - ${tc.description}`, async ({ page }) => {
      logTitle(`RUN TEST: ${tc.id}`);

      await test.step("Open notebook product", async () => {
        await openCategory(dataFile.CATEGORIES.NOTEBOOKS);
        await categoryPage.viewProductDetails(dataFile.PRODUCTS.NOTEBOOK);
      });

      // ===== DUPLICATE FLOW =====
      if (tc.input.firstQty && tc.input.secondQty) {
        await test.step("Add first quantity", async () => {
          await cartPage.setQuantity(tc.input.firstQty!);
          await cartPage.addToCartFromDetail();
        });

        await test.step("Reload page", async () => {
          await page.reload();
        });

        await test.step("Add second quantity", async () => {
          await cartPage.setQuantity(tc.input.secondQty!);
          await cartPage.addToCartFromDetail();
        });
      } else {
        // ===== SINGLE QUANTITY =====
        await test.step("Set quantity", async () => {
          await cartPage.setQuantity(tc.input.value ?? "");
        });

        await test.step("Submit add to cart", async () => {
          await cartPage.addToCartFromDetail();
        });
      }

      // ===== VERIFY =====
      await test.step("Verify result", async () => {
        await homePage.verifyNotificationResult(tc.expected);
        await cartPage.verifyResult(tc.expected);
      });
    });
  }

  for (const tc of dataFile.CASES.RENTAL_VALIDATION) {
    test(`${tc.id} - ${tc.description}`, async () => {
      logTitle(`RUN TEST: ${tc.id}`);

      const dates = {
        today: addDays(0),
        tomorrow: addDays(1),
        past: addDays(-1),
      };

      await test.step("Open rental product", async () => {
        await openCategory(dataFile.CATEGORIES.JEWELRY);
        await categoryPage.viewProductDetails(dataFile.PRODUCTS.RENTAL);
      });

      await test.step("Set rental dates", async () => {
        switch (tc.input.value) {
          case "valid":
            await cartPage.setRentDates(dates.today, dates.tomorrow);
            break;
          case "same_day":
            await cartPage.setRentDates(dates.today, dates.today);
            break;
          case "start_gt_end":
            await cartPage.setRentDates(dates.tomorrow, dates.today);
            break;
          case "past":
            await cartPage.setRentDates(dates.past, dates.today);
            break;
          case "empty":
            await cartPage.setRentDates("", "");
            break;
          case "invalid_format":
            await cartPage.setRentDates(dataFile.TEST_VALUES.INVALID_DATE, dataFile.TEST_VALUES.INVALID_DATE);
            break;
          case "non_numeric":
            await cartPage.setRentDates(dataFile.TEST_VALUES.NON_NUMERIC_DATE, dataFile.TEST_VALUES.NON_NUMERIC_DATE);
            break;
        }
      });

      await test.step("Submit add to cart", async () => {
        await cartPage.addToCartFromDetail();
      });

      await test.step("Verify result", async () => {
        await homePage.verifyNotificationResult(tc.expected);
        await cartPage.verifyResult(tc.expected);
      });
    });
  }

  for (const tc of dataFile.CASES.DONATION_VALIDATION) {
    test(`${tc.id} - ${tc.description}`, async () => {
      logTitle(`RUN TEST: ${tc.id}`);

      await test.step("Open donation product", async () => {
        await openCategory(dataFile.CATEGORIES.DIGITAL_DOWNLOADS);
        await categoryPage.viewProductDetails(dataFile.PRODUCTS.DONATION);
      });

      await test.step("Set donation price", async () => {
        await cartPage.setCustomerPrice(tc.input.value);
      });

      await test.step("Submit add to cart", async () => {
        await cartPage.addToCartFromDetail();
      });

      await test.step("Verify result", async () => {
        await homePage.verifyNotificationResult(tc.expected);
        await cartPage.verifyResult(tc.expected);
      });
    });
  }

  for (const tc of dataFile.CASES.CART_MANAGEMENT) {
    test(`${tc.id} - ${tc.description}`, async () => {
      logTitle(`RUN TEST: ${tc.id}`);

      await test.step("Add initial product", async () => {
        await openCategory(dataFile.CATEGORIES.BOOKS);
        await categoryPage.clickAddToCartFromList(dataFile.PRODUCTS.BOOK_SIMPLE);
        await homePage.closeNotificationIfVisible();
      });

      // ===== UPDATE QUANTITY =====
      if (tc.input.newQty) {
        await test.step("Update cart quantity", async () => {
          await cartPage.goto(dataFile.URLS.CART);
          await cartPage.updateCartQuantity(tc.input.newQty!);
        });
      }

      // ===== REMOVE PRODUCT =====
      if (tc.expected.cart?.empty) {
        await test.step("Remove product", async () => {
          await cartPage.goto(dataFile.URLS.CART);
          await cartPage.removeFromCart();
        });
      }

      // ===== VERIFY =====
      await test.step("Verify result", async () => {
        await cartPage.verifyResult(tc.expected);
      });
    });
  }
});
