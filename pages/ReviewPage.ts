import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import UIHelpers from "../helpers/UIHelpers";
import { logStep } from "../helpers/Logger";

export class ReviewPage extends BasePage {
  readonly addReviewButton = this.page.getByText("Add your review");
  readonly reviewTitleInput = this.page.locator("#AddProductReview_Title"); 
  readonly reviewTextInput = this.page.locator("#AddProductReview_ReviewText");
  readonly ratingInputs = this.page.locator('input[name="AddProductReview.Rating"]');
  readonly submitReviewButton = this.page.locator("button[name='add-review']");
  readonly resultMessage = this.page.locator(".result");
  readonly errorSummary = this.page.locator(".validation-summary-errors");
  readonly reviewList = this.page.locator(".product-review-list");
  readonly voteYesButtons = this.page.locator(".vote .vote-yes");
  readonly voteNoButtons = this.page.locator(".vote .vote-no");
  readonly loginLink = this.page.locator(".ico-login");

  constructor(page: Page) {
    super(page);
  }

  async scrollToReviewSection() {
    await UIHelpers.waitForVisible(this.addReviewButton, "Add Review Button");
    await this.addReviewButton.scrollIntoViewIfNeeded();
  }

  async openReviewForm() {
    logStep("Open review form");
    await this.scrollToReviewSection();
    await this.clickElement(this.addReviewButton, "Add your review button");
  }

  async fillReview(data: { title?: string; text?: string; rating?: number }) {
    if (data.title !== undefined) {
      await this.inputText(this.reviewTitleInput, data.title, "Review title");
    }
    if (data.text !== undefined) {
      await this.inputText(this.reviewTextInput, data.text, "Review text");
    }
    if (data.rating && data.rating >= 1 && data.rating <= 5) {
    await this.clickElement(
      this.ratingInputs.nth(data.rating - 1),
      `Rating ${data.rating}`
    );
  }
  }

  async submitReview() {
    logStep("Submit review");
    await this.clickElement(this.submitReviewButton, "Submit review button");
    await this.waitForPageLoad();
  }

  async expectSuccess(message: string) {
    await UIHelpers.waitForVisible(this.resultMessage, "Result Message");
    await expect(this.resultMessage).toHaveText(message);
  }

  async expectError(message: string) {
    await UIHelpers.waitForVisible(this.errorSummary, "Error Summary");
    await expect(this.errorSummary).toContainText(message);
  }

  async expectReviewVisible(title?: string, text?: string) {
    await UIHelpers.waitForVisible(this.reviewList, "Review List");
    if (title) await expect(this.reviewList).toContainText(title);
    if (text) await expect(this.reviewList).toContainText(text);
  }

  async expectReviewListVisible() {
    await UIHelpers.waitForVisible(this.reviewList, "Review List");
  }

  async expectLoginLinkVisible() {
    await UIHelpers.waitForVisible(this.loginLink, "Login Link");
  }

  async expectVoteButtonsVisible() {
    await UIHelpers.waitForVisible(this.voteYesButtons.first(), "Vote Yes Button");
    await UIHelpers.waitForVisible(this.voteNoButtons.first(), "Vote No Button");
  }

  async expectResultOrErrorVisible() {
    await expect(this.resultMessage.or(this.errorSummary)).toBeVisible();
  }

  async clickLoginIfVisible() {
    if (await this.loginLink.isVisible().catch(() => false)) {
      await this.clickElement(this.loginLink, "Login Link");
    }
  }

  async voteReview(reviewIndex: number, helpful: boolean) {
    const button = helpful ? this.voteYesButtons.nth(reviewIndex) : this.voteNoButtons.nth(reviewIndex);
    await this.clickElement(button, `Vote ${helpful ? "Yes" : "No"} for review #${reviewIndex + 1}`);
  }
}