import { test } from "@playwright/test";
import { HomePage } from "../../pages/HomePage";
import { SearchPage } from "../../pages/SearchPage";
import searchData from "../data/search.data.json";

import {SearchData, SearchDataFile} from "../../types/search.type";

import { resolveSpecialTokens } from "../../helpers/dataHelper";
import { logTitle } from "../../helpers/Logger";

const dataFile = searchData as unknown as SearchDataFile;

test.describe("Search Data Driven", () => {
  //test.describe.configure({ mode: "serial" });

  let homePage: HomePage;
  let searchPage: SearchPage;

  test.beforeAll(() => {
    logTitle("===== START SEARCH TEST =====");
  });

  test.afterAll(() => {
    logTitle("===== END SEARCH TEST =====");
  });

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    searchPage = new SearchPage(page);
  });

  test.afterEach(async ({ page }) => {
    await page.reload({ waitUntil: "domcontentloaded" });
  });

  for (const tc of dataFile.CASES) {
    test(`${tc.id} - ${tc.description}`, async ({ page }) => {
      logTitle(`RUN TEST: ${tc.id} - ${tc.description}`);

      // ===== BUILD DATA =====
      const mergedData: SearchData = {
        ...dataFile.BASE,
        ...tc.override,
      };

      const data = resolveSpecialTokens(mergedData);

      // ===== NAVIGATION =====
      await test.step("Navigate", async () => {
        if (tc.flow === "searchByEnter") {
          await homePage.goto(dataFile.URLS.HOME);
        } else {
          await searchPage.goto(dataFile.URLS.SEARCH);
        }
      });

      // ===== ACTION =====
      await test.step("Action", async () => {
        switch (tc.flow) {
          case "basicSearch":
            await homePage.search(data.keyword || "", false);
            break;
          case "searchByEnter":
            await homePage.search(data.keyword || "", true);
            break;

            case "toggleAdvanced":
              await searchPage.toggleAdvanced(data.advanced || false);
              break;
          default:
            await searchPage.executeSearch(data);
            break
        }
      });

      // ===== VERIFY =====
      await test.step("Verify", async () => {
        await searchPage.assertByStatus(tc.expected, dataFile.MESSAGES);
      });
    });
  }
});