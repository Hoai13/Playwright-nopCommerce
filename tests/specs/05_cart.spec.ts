import { test, expect } from "@playwright/test";
import { HomePage } from "../../pages/HomePage";
import { CartPage } from "../../pages/CartPage";
import { CategoryPage } from "../../pages/CategoryPage";
import cartData from "../data/cart.data.json";

import { addDays } from "../../helpers/commonHelper";
import { logTitle } from "../../helpers/Logger";

import type {
  CartDataFile,
  ExpectedResult,
} from "../../types/cart.type";

const dataFile = cartData as CartDataFile;

const msg = (key: string) => dataFile.MESSAGES[key];

const openCategory = async (
  homePage: HomePage,
  categoryPath: string[]
) => {
  await homePage.navigateToCategory(
    categoryPath[0],
    categoryPath[1]
  );
};

/*
 * ======================================================
 * VALIDATION HELPERS
 * ======================================================
 */

const validateExpected = async ({
  expected,
  homePage,
  cartPage,
}: {
  expected: ExpectedResult;
  homePage: HomePage;
  cartPage: CartPage;
}) => {
  /*
   * =========================
   * NOTIFICATION
   * =========================
   */
  // if (expected.notification) {
  //   await homePage.verifyNotification(
  //     expected.status ?? "success",
  //     msg(expected.notification)
  //   );
  // }

  if (expected.messageKey) {
    await homePage.verifyNotification(
      expected.status ?? "error",
      msg(expected.messageKey)
    );
  }

  /*
   * =========================
   * URL
   * =========================
   */
  if (expected.urlContains) {
    await cartPage.waitForUrlContains(
      msg(expected.urlContains)
    );
  }

  /*
   * =========================
   * CART
   * =========================
   */
  if (expected.cartQuantity) {
    await expect(cartPage.cartQtyInput).toHaveValue(
      expected.cartQuantity,
      { timeout: 10000 }
    );
  }

  if (expected.cartItemCount !== undefined) {
    await cartPage.expectCartItemCount(
      expected.cartItemCount
    );
  }

  if (expected.cartEmpty) {
    await cartPage.expectCartEmpty();
  }

  /*
   * =========================
   * MINI CART
   * =========================
   */
  if (expected.miniCart?.visible) {
    await homePage.verifyMiniCartVisible();
  }

  if (expected.miniCart?.hidden) {
    await homePage.verifyMiniCartHidden();
  }

  if (expected.miniCart?.empty) {
    await homePage.verifyMiniCartEmpty(
      msg("EMPTY_MINI_CART")
    );
  }

  if (expected.miniCart?.contains) {
    await homePage.verifyMiniCartContains(
      expected.miniCart.contains
    );
  }

  if (expected.miniCartCountGreaterThanZero) {
    await homePage.verifyMiniCartCountNotZero();
  }
};

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

  /*
   * ======================================================
   * ADD TO CART
   * ======================================================
   */

  for (const tc of dataFile.CASES.ADD_TO_CART) {
    test(`${tc.id} - ${tc.description}`, async () => {
      logTitle(`RUN TEST: ${tc.id}`);

      await test.step("Open category", async () => {
        await openCategory(
          homePage,
          dataFile.CATEGORIES[tc.input.category!]
        );
      });

      /*
       * ======================================
       * CONFIGURABLE PRODUCT
       * ======================================
       */
      if (tc.input.configuration) {
        await test.step("Open configurable product detail", async () => {
          await categoryPage.viewProductDetails(
            dataFile.PRODUCTS[tc.input.product]
          );
        });

        await test.step("Configure product", async () => {
          await cartPage.configureDesktopProduct(
            tc.input.configuration!
          );
        });

        await test.step("Add configurable product", async () => {
          await cartPage.addToCartFromDetail();
        });
      }

      /*
       * ======================================
       * NORMAL PRODUCT
       * ======================================
       */
      else {
        await test.step("Add product to cart", async () => {
          const repeat = tc.input.repeat ?? 1;

          for (let i = 0; i < repeat; i++) {
            await categoryPage.clickAddToCartFromList(
              dataFile.PRODUCTS[tc.input.product]
            );

            if (tc.expected.notification) {
              await homePage.verifyNotification(tc.expected.status ?? "success", msg(tc.expected.notification));
              await homePage.closeNotificationIfVisible();
            }
          }
        });
      }

      /*
       * ======================================
       * OPEN MINI CART
       * ======================================
       */
      if (
        tc.expected.miniCart ||
        tc.expected.miniCartCountGreaterThanZero
      ) {
        await test.step("Open mini cart", async () => {
          await homePage.openMiniCart();
        });
      }

      /*
       * ======================================
       * OPEN CART PAGE
       * ======================================
       */
      if (
        tc.expected.cartQuantity ||
        tc.expected.cartItemCount ||
        tc.expected.cartEmpty
      ) {
        await test.step("Open cart page", async () => {
          await cartPage.goto(dataFile.URLS.CART);
        });
      }

      await test.step("Validate expected result", async () => {
        await validateExpected({
          expected: tc.expected,
          homePage,
          cartPage,
        });
      });
    });
  }

  /*
   * ======================================================
   * QUANTITY VALIDATION
   * ======================================================
   */

  for (const tc of dataFile.CASES.QUANTITY_VALIDATION) {
    test(`${tc.id} - ${tc.description}`, async ({ page }) => {
      logTitle(`RUN TEST: ${tc.id}`);

      await test.step("Open product detail", async () => {
        await openCategory(
          homePage,
          dataFile.CATEGORIES.NOTEBOOKS
        );

        await categoryPage.viewProductDetails(
          dataFile.PRODUCTS.NOTEBOOK
        );
      });

      /*
       * ======================================
       * SPECIAL CASE: TOTAL LIMIT
       * ======================================
       */
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
      }

      /*
       * ======================================
       * NORMAL QUANTITY CASE
       * ======================================
       */
      else {
        await test.step("Set quantity", async () => {
          await cartPage.setQuantity(
            tc.input.value ?? ""
          );
        });

        await test.step("Submit add to cart", async () => {
          await cartPage.addToCartFromDetail();
        });
      }

      await test.step("Validate expected result", async () => {
        await validateExpected({
          expected: tc.expected,
          homePage,
          cartPage,
        });
      });
    });
  }

  /*
   * ======================================================
   * RENTAL VALIDATION
   * ======================================================
   */

  for (const tc of dataFile.CASES.RENTAL_VALIDATION) {
    test(`${tc.id} - ${tc.description}`, async () => {
      logTitle(`RUN TEST: ${tc.id}`);

      const today = addDays(0);
      const tomorrow = addDays(1);
      const past = addDays(-1);

      await test.step("Open rental product", async () => {
        await openCategory(
          homePage,
          dataFile.CATEGORIES.JEWELRY
        );

        await categoryPage.viewProductDetails(
          dataFile.PRODUCTS.RENTAL
        );
      });

      await test.step("Set rental dates", async () => {
        const value = tc.input.value;

        if (value === "valid") {
          await cartPage.setRentDates(
            today,
            tomorrow
          );
        }

        if (value === "same_day") {
          await cartPage.setRentDates(
            today,
            today
          );
        }

        if (value === "start_gt_end") {
          await cartPage.setRentDates(
            tomorrow,
            today
          );
        }

        if (value === "past") {
          await cartPage.setRentDates(
            past,
            today
          );
        }

        if (value === "empty") {
          await cartPage.setRentDates("", "");
        }

        if (value === "invalid_format") {
          await cartPage.setRentDates(
            dataFile.TEST_VALUES.INVALID_DATE,
            dataFile.TEST_VALUES.INVALID_DATE
          );
        }

        if (value === "non_numeric") {
          await cartPage.setRentDates(
            dataFile.TEST_VALUES.NON_NUMERIC_DATE,
            dataFile.TEST_VALUES.NON_NUMERIC_DATE
          );
        }
      });

      await test.step("Submit add to cart", async () => {
        await cartPage.addToCartFromDetail();
      });

      await test.step("Validate expected result", async () => {
        await validateExpected({
          expected: tc.expected,
          homePage,
          cartPage,
        });
      });
    });
  }

  /*
   * ======================================================
   * DONATION VALIDATION
   * ======================================================
   */

  for (const tc of dataFile.CASES.DONATION_VALIDATION) {
    test(`${tc.id} - ${tc.description}`, async () => {
      logTitle(`RUN TEST: ${tc.id}`);

      await test.step("Open donation product", async () => {
        await openCategory(
          homePage,
          dataFile.CATEGORIES.DIGITAL_DOWNLOADS
        );

        await categoryPage.viewProductDetails(
          dataFile.PRODUCTS.DONATION
        );
      });

      await test.step("Set donation price", async () => {
        await cartPage.setCustomerPrice(
          tc.input.value
        );
      });

      await test.step("Submit add to cart", async () => {
        await cartPage.addToCartFromDetail();
      });

      await test.step("Validate expected result", async () => {
        await validateExpected({
          expected: tc.expected,
          homePage,
          cartPage,
        });
      });
    });
  }

  /*
   * ======================================================
   * CART MANAGEMENT
   * ======================================================
   */

  for (const tc of dataFile.CASES.CART_MANAGEMENT) {
    test(`${tc.id} - ${tc.description}`, async () => {
      logTitle(`RUN TEST: ${tc.id}`);

      await test.step("Add product to cart", async () => {
        await openCategory(
          homePage,
          dataFile.CATEGORIES.BOOKS
        );

        await categoryPage.clickAddToCartFromList(
          dataFile.PRODUCTS.BOOK_SIMPLE
        );

        await homePage.closeNotificationIfVisible();
      });

      /*
       * ======================================
       * UPDATE QUANTITY
       * ======================================
       */
      if (tc.input.newQty) {
        await test.step("Update cart quantity", async () => {
          await cartPage.goto(dataFile.URLS.CART);

          await cartPage.updateCartQuantity(
            tc.input.newQty!
          );
        });
      }

      /*
       * ======================================
       * REMOVE PRODUCT
       * ======================================
       */
      if (tc.expected.cartEmpty) {
        await test.step("Remove product", async () => {
          await cartPage.goto(dataFile.URLS.CART);

          await cartPage.removeFromCart();
        });
      }

      await test.step("Validate expected result", async () => {
        await validateExpected({
          expected: tc.expected,
          homePage,
          cartPage,
        });
      });
    });
  }
});

// import { test, expect } from "@playwright/test";
// import { HomePage } from "../../pages/HomePage";
// import { CartPage } from "../../pages/CartPage";
// import { CategoryPage } from "../../pages/CategoryPage";
// import cartData from "../data/cart.data.json";
// import { addDays } from "../../helpers/commonHelper";
// import { logTitle } from "../../helpers/Logger";
// import { waitPastCloudflareIfAny } from "../../helpers/assertions";
// import type { CartDataFile } from "../../types/cart.type";

// const dataFile = cartData as CartDataFile;
// const msg = (key: string) => dataFile.MESSAGES[key];

// const openCategory = async (homePage: HomePage, categoryPath: string[]) => {
//   await homePage.navigateToCategory(categoryPath[0], categoryPath[1]);
// };


// const validateExpected = async ({ expected, homePage, cartPage }: { expected: any; homePage: HomePage; cartPage: CartPage; }) => {
//   // =========================
//   // VERIFY NOTIFICATION
//   // =========================
//   if (expected.messageKey) {
//     await homePage.verifyNotification("error", msg(expected.messageKey));
//   }

//   // =========================
//   // MINI CART
//   // =========================
//   if (expected.miniCart) {
//     await homePage.openMiniCart();

//     if (expected.miniCart.visible) await homePage.verifyMiniCartVisible();
//     if (expected.miniCart.hidden) await homePage.verifyMiniCartHidden();
//     if (expected.miniCart.empty) {
//       await homePage.verifyMiniCartEmpty(msg("EMPTY_MINI_CART"));
//     }
//     if (expected.miniCart.contains) {
//       await homePage.verifyMiniCartContains(dataFile.PRODUCTS[expected.miniCart.contains]);
//     }
//     if (expected.miniCart.countGreaterThanZero) {
//       await homePage.verifyMiniCartCountNotZero();
//     }
//   }

//   // =========================
//   // NAVIGATION
//   // =========================
//   if (expected.navigation?.urlContains) {
//     await cartPage.waitForUrlContains(msg(expected.navigation.urlContains));
//   }

//   // =========================
//   // CART PAGE
//   // =========================
//   if (expected.cart?.quantity !== undefined) {
//     await expect(cartPage.cartQtyInput).toHaveValue(expected.cart.quantity.toString(), { timeout: 10000 });
//   }

//   if (expected.cart?.itemCount !== undefined) {
//     await cartPage.expectCartItemCount(expected.cart.itemCount);
//   }

//   if (expected.cart?.empty) {
//     await cartPage.expectCartEmpty();
//   }
// };

// test.describe("Shopping Cart", () => {
//   let homePage: HomePage;
//   let cartPage: CartPage;
//   let categoryPage: CategoryPage;

//   test.beforeAll(() => {
//     logTitle("===== START CART TEST =====");
//   });

//   test.afterAll(() => {
//     logTitle("===== END CART TEST =====");
//   });

//   test.beforeEach(async ({ page }) => {
//     homePage = new HomePage(page);
//     cartPage = new CartPage(page);
//     categoryPage = new CategoryPage(page);

//     await homePage.goto(dataFile.URLS.HOME);
//     // await waitPastCloudflareIfAny(page);
//   });

//   /*
//    * =====================================
//    * ADD TO CART
//    * =====================================
//    */
//   for (const tc of dataFile.CASES.ADD_TO_CART) {
//     test(`${tc.id} - ${tc.description}`, async () => {
//       logTitle(`RUN TEST: ${tc.id}`);

//       await test.step("Open category", async () => {
//         await openCategory(homePage, dataFile.CATEGORIES[tc.input.category!]);
//       });

//       await test.step("Add product to cart", async () => {
//         const repeat = tc.input.repeat ?? 1;
//         for (let i = 0; i < repeat; i++) {
//           await categoryPage.clickAddToCartFromList(dataFile.PRODUCTS[tc.input.product]);

//           if (tc.expected.notification) {
//             await homePage.verifyNotification(tc.expected.status ?? "success", msg(tc.expected.notification));
//             await homePage.closeNotificationIfVisible();
//           }
//         }
//       });

//       await test.step("Open mini cart if needed", async () => {
//         if (tc.expected.miniCart) await homePage.openMiniCart();
//       });

//       await test.step("Open cart page if needed", async () => {
//         if (tc.expected.cart) await cartPage.goto(dataFile.URLS.CART);
//       });

//       await test.step("Validate expected result", async () => {
//         await validateExpected({ expected: tc.expected, homePage, cartPage });
//       });
//     });
//   }

//   /*
//    * =====================================
//    * QUANTITY VALIDATION
//    * =====================================
//    */
//   for (const tc of dataFile.CASES.QUANTITY_VALIDATION) {
//     test(`${tc.id} - ${tc.description}`, async ({ page }) => {
//       logTitle(`RUN TEST: ${tc.id}`);

//       await test.step("Open product detail", async () => {
//         await openCategory(homePage, dataFile.CATEGORIES.NOTEBOOKS);
//         await categoryPage.viewProductDetails(dataFile.PRODUCTS.NOTEBOOK);
//       });

//       await test.step("Set quantity", async () => {
//         if (tc.input.value !== undefined) {
//           await cartPage.setQuantity(tc.input.value);
//         }
//       });

//       await test.step("Submit add to cart", async () => {
//         await cartPage.addToCartFromDetail();
//       });

//       // Special case: Total limit with two additions
//       if (tc.input.firstQty && tc.input.secondQty) {
//         await test.step("Add first quantity", async () => {
//           await cartPage.setQuantity(tc.input.firstQty);
//           await cartPage.addToCartFromDetail();
//           await homePage.verifyNotification("success", msg("ADD_SUCCESS"));
//         });

//         await test.step("Reload page", async () => {
//           await page.reload();
//         });

//         await test.step("Add second quantity", async () => {
//           await cartPage.setQuantity(tc.input.secondQty);
//           await cartPage.addToCartFromDetail();
//         });
//       }

//       await test.step("Validate expected result", async () => {
//         await validateExpected({ expected: tc.expected, homePage, cartPage });
//       });
//     });
//   }

//   /*
//    * =====================================
//    * RENTAL VALIDATION
//    * =====================================
//    */
//   for (const tc of dataFile.CASES.RENTAL_VALIDATION) {
//     test(`${tc.id} - ${tc.description}`, async () => {
//       logTitle(`RUN TEST: ${tc.id}`);

//       const today = addDays(0);
//       const tomorrow = addDays(1);
//       const past = addDays(-1);

//       await test.step("Open rental product", async () => {
//         await openCategory(homePage, dataFile.CATEGORIES.JEWELRY);
//         await categoryPage.viewProductDetails(dataFile.PRODUCTS.RENTAL);
//       });

//       await test.step("Set rental dates", async () => {
//         const value = tc.input.value;
//         if (value === "valid") await cartPage.setRentDates(today, tomorrow);
//         if (value === "same_day") await cartPage.setRentDates(today, today);
//         if (value === "start_gt_end") await cartPage.setRentDates(tomorrow, today);
//         if (value === "past") await cartPage.setRentDates(past, today);
//         if (value === "empty") await cartPage.setRentDates("", "");
//         if (value === "invalid_format") {
//           await cartPage.setRentDates(dataFile.TEST_VALUES.INVALID_DATE, dataFile.TEST_VALUES.INVALID_DATE);
//         }
//         if (value === "non_numeric") {
//           await cartPage.setRentDates(dataFile.TEST_VALUES.NON_NUMERIC_DATE, dataFile.TEST_VALUES.NON_NUMERIC_DATE);
//         }
//       });

//       await test.step("Submit add to cart", async () => {
//         await cartPage.addToCartFromDetail();
//       });

//       await test.step("Validate expected result", async () => {
//         await validateExpected({ expected: tc.expected, homePage, cartPage });
//       });
//     });
//   }

//   /*
//    * =====================================
//    * DONATION VALIDATION
//    * =====================================
//    */
//   for (const tc of dataFile.CASES.DONATION_VALIDATION) {
//     test(`${tc.id} - ${tc.description}`, async () => {
//       logTitle(`RUN TEST: ${tc.id}`);

//       await test.step("Open donation product", async () => {
//         await openCategory(homePage, dataFile.CATEGORIES.DIGITAL_DOWNLOADS);
//         await categoryPage.viewProductDetails(dataFile.PRODUCTS.DONATION);
//       });

//       await test.step("Set donation price", async () => {
//         await cartPage.setCustomerPrice(tc.input.value);
//       });

//       await test.step("Submit add to cart", async () => {
//         await cartPage.addToCartFromDetail();
//       });

//       await test.step("Validate expected result", async () => {
//         await validateExpected({ expected: tc.expected, homePage, cartPage });
//       });
//     });
//   }

//   /*
//    * =====================================
//    * MINI CART
//    * =====================================
//    */
//   for (const tc of dataFile.CASES.MINI_CART) {
//     test(`${tc.id} - ${tc.description}`, async () => {
//       logTitle(`RUN TEST: ${tc.id}`);

//       if (tc.id !== "SC-039") {
//         await test.step("Add product", async () => {
//           await openCategory(homePage, dataFile.CATEGORIES.BOOKS);
//           await categoryPage.clickAddToCartFromList(dataFile.PRODUCTS.BOOK_SIMPLE);

//           if (tc.expected.notification) {
//             await homePage.verifyNotification(tc.expected.status ?? "success", msg(tc.expected.notification));
//             await homePage.closeNotificationIfVisible();
//           }
//         });
//       }

//       await test.step("Open mini cart", async () => {
//         await homePage.openMiniCart();
//       });

//       if (tc.expected.miniCart?.hidden) {
//         await test.step("Hover out", async () => {
//           await homePage.hoverOut(dataFile.TEST_VALUES.MOUSE_OUT_X, dataFile.TEST_VALUES.MOUSE_OUT_Y);
//         });
//       }

//       if (tc.input.updatedQty) {
//         await test.step("Update cart quantity", async () => {
//           await cartPage.goto(dataFile.URLS.CART);
//           await cartPage.updateCartQuantity(tc.input.updatedQty);
//           await expect(cartPage.cartQtyInput).toHaveValue(tc.input.updatedQty);
//         });
//         await homePage.openMiniCart();
//       }

//       if (tc.input.before) {
//         await test.step("Verify initial count", async () => {
//           await homePage.verifyMiniCartCount(tc.input.before!);
//         });
//       }

//       if (tc.input.after) {
//         await test.step("Verify updated count", async () => {
//           await homePage.verifyMiniCartCount(tc.input.after!);
//         });
//       }

//       if (tc.expected.miniCart?.empty && tc.id === "SC-038") {
//         await test.step("Remove product", async () => {
//           await cartPage.goto(dataFile.URLS.CART);
//           await cartPage.removeFromCart();
//           await cartPage.expectCartEmpty();
//           await homePage.goto(dataFile.URLS.HOME);
//           await homePage.openMiniCart();
//         });
//       }

//       await test.step("Validate expected result", async () => {
//         await validateExpected({ expected: tc.expected, homePage, cartPage });
//       });
//     });
//   }
// });


// // import { test, expect} from "@playwright/test";
// // import { HomePage } from "../../pages/HomePage";
// // import { CartPage } from "../../pages/CartPage";
// // import { CategoryPage } from "../../pages/CategoryPage";
// // import cartData from "../data/cart.data.json";
// // import { addDays } from "../../helpers/commonHelper";
// // import { logTitle } from "../../helpers/Logger";
// // import { CartDataFile } from "../../types/cart.type";
// // import { waitPastCloudflareIfAny } from "../../helpers/assertions";

// // const dataFile = cartData as CartDataFile;
// // const msg = (key: string) => dataFile.MESSAGES[key];

// // const openCategory = async (homePage: HomePage, categoryPath: string[]) => {
// // 	await homePage.navigateToCategory(categoryPath[0], categoryPath[1]);
// // };

// // test.describe("Shopping Cart", () => {
// // 	//test.describe.configure({ mode: "serial" });
// // 	let homePage: HomePage;
// // 	let cartPage: CartPage;
// // 	let categoryPage: CategoryPage;

// // 	test.beforeAll(() => {
// // 		logTitle("===== START CART TEST =====");
// // 	});

// // 	test.afterAll(() => {
// // 		logTitle("===== END CART TEST =====");
// // 	});

// // 	test.beforeEach(async ({ page }) => {
// // 		homePage = new HomePage(page);
// // 		cartPage = new CartPage(page);
// // 		categoryPage = new CategoryPage(page);

// // 		await homePage.goto(dataFile.URLS.HOME);
// // 		//await waitPastCloudflareIfAny(page);
// // 	});

// // 	for (const tc of dataFile.CASES.BASIC) {
// // 		test(`${tc.id} - ${tc.flow}`, async ({ page }) => {
// // 			logTitle(`RUN TEST: ${tc.id}`);

// // 			if (tc.flow === "addSimple") {
// // 				await test.step("Open category", async () => {
// // 					await openCategory(homePage, dataFile.CATEGORIES.BOOKS);
// // 				});

// // 				await test.step("Add to cart from list", async () => {
// // 					await categoryPage.clickAddToCartFromList(dataFile.PRODUCTS.BOOK_SIMPLE);
// // 				});

// // 				await test.step("Verify success", async () => {
// // 					await homePage.verifyNotification("success", msg("ADD_SUCCESS"));
// // 					await homePage.verifyMiniCartCountNotZero();
// // 				});
// // 				return;
// // 			}

// // 			if (tc.flow === "guestAddSimple") {
// // 				await test.step("Open category", async () => {
// // 					await openCategory(homePage, dataFile.CATEGORIES.BOOKS);
// // 				});

// // 				await test.step("Add to cart from list", async () => {
// // 					await categoryPage.clickAddToCartFromList(dataFile.PRODUCTS.BOOK_SIMPLE);
// // 				});

// // 				await test.step("Verify mini cart contains product", async () => {
// // 					await homePage.openMiniCart();
// // 					await homePage.verifyMiniCartContains(dataFile.PRODUCTS.BOOK_SIMPLE);
// // 				});
// // 				return;
// // 			}

// // 			if (tc.flow === "requiredOptionsRedirect") {
// // 				await test.step("Open category", async () => {
// // 					await openCategory(homePage, dataFile.CATEGORIES.DESKTOPS);
// // 				});

// // 				await test.step("Add configurable product", async () => {
// // 					await categoryPage.clickAddToCartFromList(dataFile.PRODUCTS.DESKTOP_CONFIGURABLE);
// // 				});

// // 				await test.step("Verify redirected to product detail", async () => {
// // 					await cartPage.waitForUrlContains(msg("REQUIRED_OPTION_URL"));
// // 				});
// // 				return;
// // 			}

// // 			if (tc.flow === "duplicateIncreaseQty") {
// // 				await test.step("Add product twice", async () => {
// // 					await openCategory(homePage, dataFile.CATEGORIES.BOOKS);
// // 					await categoryPage.clickAddToCartFromList(dataFile.PRODUCTS.BOOK_SIMPLE);
// // 					await homePage.verifyNotification("success", dataFile.MESSAGES.ADD_SUCCESS);
// // 					await homePage.closeNotificationIfVisible();

// // 					await page.waitForTimeout(500);

// // 					await categoryPage.clickAddToCartFromList(dataFile.PRODUCTS.BOOK_SIMPLE);
// // 					await homePage.verifyNotification("success", dataFile.MESSAGES.ADD_SUCCESS);
// // 					await homePage.closeNotificationIfVisible();
// // 				});

// // 				await test.step("Verify grouped quantity in cart", async () => {
// // 					await cartPage.goto(dataFile.URLS.CART);
// // 					await expect(cartPage.cartQtyInput).toHaveValue("2", { timeout: 10000 });
// //     				await cartPage.expectCartItemCount(1);
// // 				});
// // 			}
// // 		});
// // 	}

// // 	for (const tc of dataFile.CASES.QUANTITY) {
// // 		test(`${tc.id} - Quantity validation: ${tc.value || "empty"}`, async () => {
// // 			await test.step("Open category & product", async () => {
// // 				await openCategory(homePage, dataFile.CATEGORIES.NOTEBOOKS);
// // 				await categoryPage.viewProductDetails(dataFile.PRODUCTS.NOTEBOOK);
// // 			});

// // 			await test.step("Set quantity & submit", async () => {
// // 				await cartPage.setQuantity(tc.value);
// // 				await cartPage.addToCartFromDetail();
// // 			});

// // 			await test.step("Verify result", async () => {
// // 				if (tc.success) {
// // 					await homePage.verifyNotification("success", msg("ADD_SUCCESS"));
// // 				} else {
// // 					await homePage.verifyNotification("error", msg(tc.errorKey || ""));
// // 				}
// // 			});
// // 		});
// // 	}

// // 	test(`${dataFile.CASES.TOTAL_LIMIT.id} - Enforce total quantity limit`, async ({ page }) => {
// // 		await test.step("Open category & product", async () => {
// // 			await openCategory(homePage, dataFile.CATEGORIES.NOTEBOOKS);
// // 			await categoryPage.viewProductDetails(dataFile.PRODUCTS.NOTEBOOK);
// // 		});

// // 		await test.step("Add first quantity", async () => {
// // 			await cartPage.setQuantity(dataFile.CASES.TOTAL_LIMIT.firstQty);
// // 			await cartPage.addToCartFromDetail();
// // 			await homePage.verifyNotification("success", msg("ADD_SUCCESS"));
// // 		});

// // 		await test.step("Add second quantity", async () => {
// // 			await page.reload();
// // 			await cartPage.setQuantity(dataFile.CASES.TOTAL_LIMIT.secondQty);
// // 			await cartPage.addToCartFromDetail();
// // 		});

// // 		await test.step("Verify max quantity error", async () => {
// // 			await homePage.verifyNotification("error", msg(dataFile.CASES.TOTAL_LIMIT.errorKey));
// // 		});
// // 	});

// // 	for (const tc of dataFile.CASES.RENTAL) {
// // 		test(`${tc.id} - Rental date validation: ${tc.value}`, async () => {
// // 			const today = addDays(0);
// // 			const tomorrow = addDays(1);
// // 			const past = addDays(-1);

// // 			await test.step("Open rental product", async () => {
// // 				await openCategory(homePage, dataFile.CATEGORIES.JEWELRY);
// // 				await categoryPage.viewProductDetails(dataFile.PRODUCTS.RENTAL);
// // 			});

// // 			await test.step("Set rental dates", async () => {
// // 				if (tc.value === "valid") await cartPage.setRentDates(today, tomorrow);
// // 				if (tc.value === "same_day") await cartPage.setRentDates(today, today);
// // 				if (tc.value === "start_gt_end") await cartPage.setRentDates(tomorrow, today);
// // 				if (tc.value === "past") await cartPage.setRentDates(past, today);
// // 				if (tc.value === "empty") await cartPage.setRentDates("", "");
// // 				if (tc.value === "invalid_format") {
// // 					await cartPage.setRentDates(dataFile.TEST_VALUES.INVALID_DATE, dataFile.TEST_VALUES.INVALID_DATE);
// // 				}
// // 				if (tc.value === "non_numeric") {
// // 					await cartPage.setRentDates(dataFile.TEST_VALUES.NON_NUMERIC_DATE, dataFile.TEST_VALUES.NON_NUMERIC_DATE);
// // 				}
// // 			});

// // 			await test.step("Submit", async () => {
// // 				await cartPage.addToCartFromDetail();
// // 			});

// // 			await test.step("Verify result", async () => {
// // 				if (tc.success) {
// // 					await homePage.verifyNotification("success", msg("ADD_SUCCESS"));
// // 				} else {
// // 					await homePage.verifyNotification("error", msg(tc.errorKey || ""));
// // 				}
// // 			});
// // 		});
// // 	}

// // 	for (const tc of dataFile.CASES.DONATION) {
// // 		test(`${tc.id} - Donation price validation: ${tc.value || "empty"}`, async () => {
// // 			await test.step("Open donation product", async () => {
// // 				await openCategory(homePage, dataFile.CATEGORIES.DIGITAL_DOWNLOADS);
// // 				await categoryPage.viewProductDetails(dataFile.PRODUCTS.DONATION);
// // 			});

// // 			await test.step("Set price & submit", async () => {
// // 				await cartPage.setCustomerPrice(tc.value);
// // 				await cartPage.addToCartFromDetail();
// // 			});

// // 			await test.step("Verify result", async () => {
// // 				if (tc.success) {
// // 					await homePage.verifyNotification("success", msg("ADD_SUCCESS"));
// // 				} else {
// // 					await homePage.verifyNotification("error", msg(tc.errorKey || ""));
// // 				}
// // 			});
// // 		});
// // 	}

// // 	for (const tc of dataFile.CASES.MINI_CART) {
// // 		test(`${tc.id} - ${tc.flow}`, async () => {
// // 			if (tc.flow === "hoverVisible") {
// // 				await test.step("Add product", async () => {
// // 					await openCategory(homePage, dataFile.CATEGORIES.BOOKS);
// // 					await categoryPage.clickAddToCartFromList(dataFile.PRODUCTS.BOOK_SIMPLE);
// // 				});

// // 				await test.step("Verify mini cart visible", async () => {
// // 					await homePage.openMiniCart();
// // 					await homePage.verifyMiniCartVisible();
// // 				});
// // 				return;
// // 			}

// // 			if (tc.flow === "hideOnMouseOut") {
// // 				await test.step("Add product", async () => {
// // 					await openCategory(homePage, dataFile.CATEGORIES.BOOKS);
// // 					await categoryPage.clickAddToCartFromList(dataFile.PRODUCTS.BOOK_SIMPLE);
// // 				});

// // 				await test.step("Open mini cart", async () => {
// // 					await homePage.openMiniCart();
// // 				});

// // 				await test.step("Mouse out and verify hidden", async () => {
// // 					await homePage.hoverOut(dataFile.TEST_VALUES.MOUSE_OUT_X, dataFile.TEST_VALUES.MOUSE_OUT_Y);
// // 					await homePage.verifyMiniCartHidden();
// // 				});
// // 				return;
// // 			}

// // 			if (tc.flow === "contentMatchesCart") {
// // 				await test.step("Add product", async () => {
// // 					await openCategory(homePage, dataFile.CATEGORIES.BOOKS);
// // 					await categoryPage.clickAddToCartFromList(dataFile.PRODUCTS.BOOK_SIMPLE);
// // 				});

// // 				await test.step("Verify mini cart contains product", async () => {
// // 					await homePage.openMiniCart();
// // 					await homePage.verifyMiniCartContains(dataFile.PRODUCTS.BOOK_SIMPLE);
// // 				});

// // 				await test.step("Verify cart contains product", async () => {
// // 					await cartPage.goto(dataFile.URLS.CART);
// // 					await cartPage.expectCartContainsProduct(dataFile.PRODUCTS.BOOK_SIMPLE);
// // 				});
// // 				return;
// // 			}

// // 			if (tc.flow === "syncAfterUpdate") {
// // 				await test.step("Add product", async () => {
// // 					await openCategory(homePage, dataFile.CATEGORIES.BOOKS);
// // 					await categoryPage.clickAddToCartFromList(dataFile.PRODUCTS.BOOK_SIMPLE);

// // 					await homePage.verifyNotification("success", dataFile.MESSAGES.ADD_SUCCESS);
// // 					await homePage.closeNotificationIfVisible();
// //   				});

// // 				await test.step("Update cart quantity", async () => {
// // 					await cartPage.goto(dataFile.URLS.CART);
// // 					const qty = tc.updatedQty || "1";
// // 					await cartPage.updateCartQuantity(qty);

// // 					await cartPage.page.mouse.click(0, 0);

// // 					await expect(cartPage.cartQtyInput).toHaveValue(qty, { timeout: 10000,});
// // 				});

// // 				await test.step("Verify mini cart synced", async () => {
// // 					const qty = tc.updatedQty || "1";
					
// // 					await homePage.openMiniCart();
// // 					await homePage.verifyMiniCartContains(tc.miniCartExpected || `${qty} item(s)`);
// // 				});
// // 				return;
// // 			}

// // 			if (tc.flow === "counterAfterAdd") {
// // 				await test.step("Verify initial counter", async () => {
// // 					await homePage.verifyMiniCartCount(tc.before || "");
// // 				});

// // 				await test.step("Add product", async () => {
// // 					await openCategory(homePage, dataFile.CATEGORIES.BOOKS);
// // 					await categoryPage.clickAddToCartFromList(dataFile.PRODUCTS.BOOK_SIMPLE);
// // 				});

// // 				await test.step("Verify counter updated", async () => {
// // 					await homePage.verifyMiniCartCount(tc.after || "");
// // 				});
// // 				return;
// // 			}

// // 			if (tc.flow === "syncAfterRemove") {
// // 				await test.step("Add product", async () => {
// // 					await openCategory(homePage, dataFile.CATEGORIES.BOOKS);
// // 					await categoryPage.clickAddToCartFromList(dataFile.PRODUCTS.BOOK_SIMPLE);

// // 					await homePage.verifyNotification("success", dataFile.MESSAGES.ADD_SUCCESS);
// // 					await homePage.closeNotificationIfVisible();
// // 				});

// // 				await test.step("Remove from cart", async () => {
// // 					await cartPage.goto(dataFile.URLS.CART);
// // 					await cartPage.removeFromCart();
// // 					await cartPage.expectCartEmpty();
// // 				});

// // 				await test.step("Verify empty mini cart", async () => {
// // 					await homePage.goto(dataFile.URLS.HOME);
// // 					await homePage.openMiniCart();
// // 					await homePage.verifyMiniCartEmpty(msg("EMPTY_MINI_CART"));
// // 				});
// // 				return;
// // 			}

// // 			if (tc.flow === "emptyState") {
// // 				await test.step("Open mini cart", async () => {
// // 					await homePage.openMiniCart();
// // 					await homePage.verifyMiniCartEmpty(msg("EMPTY_MINI_CART"));
// // 				});
// // 			}
// // 		});
// // 	}
// // });
