export type ProductCategoryFlow =
  | "categoryBasic"
  | "categoryNoProduct"
  | "hoverSubMenu"
  | "navigateSubCategory"
  | "breadcrumbDisplay"
  | "breadcrumbToHome"
  | "breadcrumbToParent"
  | "viewModeDefault"
  | "viewModeGrid"
  | "viewModeList"
  | "viewModeToggle"
  | "viewModePersist"
  | "productDetail"
  | "addToCart"
  | "requireOptionCart"
  | "addToWishlist"
  | "requireOptionWishlist"
  | "addToCompare"
  | "filterSingle"
  | "filterMultiple"
  | "paginationFirst"
  | "paginationNext"
  | "paginationLast"
  | "paginationPrevious"
  | "pageSizeChange"
  | "pageSizeReset"
  | "paginationInvalidLow"
  | "paginationInvalidHigh"
  | "paginationInvalidFormat";

export interface ProductCategoryFilter {
  type: "manufacturer" | "spec" | "price";
  label: string;
}

export interface ProductCategoryExpected {
  title?: string;
  breadcrumb?: string;
  subCategories?: string[];
  urlRegex?: string;
  message?: string;
  viewMode?: "grid" | "list";
  currentPage?: number;
  productsPerPage?: number;
}

export interface ProductCategoryTestCase {
  id: string;
  description: string;
  flow: ProductCategoryFlow;

  category?: string;
  subCategory?: string;
  breadcrumbClick?: string;
  productName?: string;
  url?: string;
  invalidQuery?: string;

  filters?: ProductCategoryFilter[];
  sortLabel?: string;
  pageSize?: string;
  targetPage?: number;
  invalidPageNumber?: string;

  expected?: ProductCategoryExpected;
  tags?: string[];
}

export interface ProductCategoryDataFile {
  URLS: {
    HOME: string;
  };
  MESSAGES: {
    HOME_BREADCRUMB: string;
    HOME_URL_REGEX: string;
    NO_PRODUCTS: string;
  };
  PRODUCTS: {
    NOTEBOOK: string;
    CONFIGURABLE: string;
    SIMPLE: string;
  };
  CASES: ProductCategoryTestCase[];
}