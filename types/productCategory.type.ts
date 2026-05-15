export type ProductCategoryAction = 
  | "detail" 
  | "wishlist" 
  | "compare";

export interface ProductCategoryInput {
  category: string;
  subCategory?: string;
  product?: string;
}

export interface ProductCategoryExpected {
  title?: string;
  breadcrumb?: string;
  subCategories?: string[];
  urlContains?: string;
  notification?: 
    | "ADD_WISHLIST_SUCCESS" 
    | "ADD_COMPARE_SUCCESS";
}

export interface ProductCategoryCase {
  id: string;
  description: string;
  action?: ProductCategoryAction;
  input: ProductCategoryInput;
  expected: ProductCategoryExpected;
  tags?: string[];
}

export interface ProductCategoryDataFile {
  URLS: {
    HOME: string;
  };
  MESSAGES: {
    [key: string]: string;
    ADD_WISHLIST_SUCCESS: string;
    ADD_COMPARE_SUCCESS: string;
    NO_PRODUCTS: string;
  };
  PRODUCTS: {
    NOTEBOOK: string;
    CONFIGURABLE: string;
    SIMPLE: string;
  };
  CASES: ProductCategoryCase[];
}