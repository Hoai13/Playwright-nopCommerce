export type ReviewFlow =
  | "viewWithoutLogin"
  | "submitReview"
  | "guestVoteHelpfulness"
  | "voteOwnReview"
  | "voteOtherReview";

export interface ReviewPayload {
  title?: string;
  text?: string;
  rating?: number;
}

export interface ReviewExpect {
  success?: boolean;
  containsTitle?: string;
  errorKey?: string;
  resultOrErrorVisible?: boolean;
}

export interface ReviewCase {
  id: string;
  flow: ReviewFlow;
  requiresLogin?: boolean;
  review?: ReviewPayload;
  expect?: ReviewExpect;
  seedReview?: ReviewPayload;
}

export interface ReviewDataFile {
  URLS: { HOME: string; REGISTER: string };
  PRODUCT: { CATEGORY: string; SUB_CATEGORY: string; NAME: string };
  REGISTER_USER: {
    firstName: string;
    lastName: string;
    password: string;
    confirmPassword: string;
    emailPrefix: string;
    successMessage: string;
  };
  MESSAGES: Record<string, string>;
  VALUES: {
    LONG_TITLE_201: string;
    MAX_TITLE_200: string;
    MIN_TITLE: string;
  };
  CASES: ReviewCase[];
  RATING_CASES: number[];
  RATING_TEMPLATE: { titlePrefix: string; text: string };
}