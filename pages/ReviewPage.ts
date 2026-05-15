import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ReviewPage extends BasePage {

  readonly addReviewLink = this.page.locator('a', { hasText: 'Add your review' });
  readonly reviewTitleInput = this.page.locator("#AddProductReview_Title");
  readonly reviewTextInput = this.page.locator("#AddProductReview_ReviewText");
  readonly ratingInput = (val: number) => this.page.locator(`#addproductrating_${val}`);
  readonly submitButton = this.page.locator("button[name='add-review']");
  
  readonly successMessage = this.page.locator(".result");
  readonly errorMessage = this.page.locator(".message-error, .validation-summary-errors, .field-validation-error");  readonly titleError = this.page.locator('[data-valmsg-for="AddProductReview.Title"]');
  readonly textError = this.page.locator('[data-valmsg-for="AddProductReview.ReviewText"]');
  readonly reviewList = this.page.locator(".product-review-list");

  readonly voteYesButton = this.page.locator(".vote-yes").first();

  async openReviewForm() {
    await this.addReviewLink.scrollIntoViewIfNeeded();
    await this.addReviewLink.click();
  }

  async fillReview(data: { title?: string; text?: string; rating?: number }) {
    if (data.title !== undefined) await this.reviewTitleInput.fill(data.title);
    if (data.text !== undefined) await this.reviewTextInput.fill(data.text);
    if (data.rating) await this.ratingInput(data.rating).check();
  }

  async voteFirstReview() {
    await this.voteYesButton.click();
  }
}