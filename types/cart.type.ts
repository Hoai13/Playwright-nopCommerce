export type TestStatus =
  | "success"
  | "error"
  | "warning"
  | "empty";

export type BaseCase = {
  id: string;
  description: string;
  tags?: string[];
};

export type ExpectedResult = {
  status?: TestStatus;

  notification?: string;

  messageKey?: string;

  urlContains?: string;

  priceChanged?: boolean;

  containsConfiguration?: boolean;

  subtotalUpdated?: boolean;

  cart?: {
    quantity?: number;

    itemCount?: number;

    empty?: boolean;
  };

  miniCart?: {
    visible?: boolean;

    hidden?: boolean;

    empty?: boolean;

    contains?: string;

    quantity?: number;

    countGreaterThanZero?: boolean;
  };

  cartQuantity?: string;

  cartItemCount?: number;

  cartEmpty?: boolean;

  miniCartCountGreaterThanZero?: boolean;
};

export type ProductInput = {
  product: string;

  category?: string;
};

export type QuantityInput = {
  value?: string;

  firstQty?: string;

  secondQty?: string;
};

export type AddToCartCase = BaseCase & {
  input: ProductInput & {
    repeat?: number;

    configuration?: {
      ram?: string;

      hdd?: string;
    };

    configurations?: {
      ram?: string;

      hdd?: string;
    }[];
  };

  expected: ExpectedResult;
};

export type QuantityValidationCase = BaseCase & {
  input: QuantityInput;

  expected: ExpectedResult;
};

export type RentalValidationCase = BaseCase & {
  input: {
    value: string;
  };

  expected: ExpectedResult;
};

export type DonationValidationCase = BaseCase & {
  input: {
    value: string;
  };

  expected: ExpectedResult;
};

export type CartManagementCase = BaseCase & {
  input: {
    oldQty?: string;

    newQty?: string;

    product?: string;
  };

  expected: ExpectedResult;
};

export type CartDataFile = {
  URLS: {
    HOME: string;

    CART: string;
  };

  PRODUCTS: Record<string, string>;

  CATEGORIES: Record<string, string[]>;

  MESSAGES: Record<string, string>;

  TEST_VALUES: {
    DUPLICATE_EXPECTED_QTY: string;

    INVALID_DATE: string;

    NON_NUMERIC_DATE: string;

    MOUSE_OUT_X: number;

    MOUSE_OUT_Y: number;
  };

  CASES: {
    ADD_TO_CART: AddToCartCase[];

    QUANTITY_VALIDATION: QuantityValidationCase[];

    RENTAL_VALIDATION: RentalValidationCase[];

    DONATION_VALIDATION: DonationValidationCase[];

    CART_MANAGEMENT: CartManagementCase[];
  };
};

// export type BoundaryCase = { id: string; value: string; success: boolean; errorKey?: string };

// export type CartBasicFlow =
// 	| "addSimple"
// 	| "guestAddSimple"
// 	| "requiredOptionsRedirect"
// 	| "duplicateIncreaseQty";

// export type CartMiniCartFlow =
// 	| "hoverVisible"
// 	| "hideOnMouseOut"
// 	| "contentMatchesCart"
// 	| "syncAfterUpdate"
// 	| "counterAfterAdd"
// 	| "syncAfterRemove"
// 	| "emptyState";

// export type MiniCartCase = {
// 	id: string;
// 	flow: CartMiniCartFlow;
// 	updatedQty?: string;
// 	miniCartExpected?: string;
// 	before?: string;
// 	after?: string;
// };

// export type CartDataFile = {
// 	PRODUCTS: Record<string, string>;
// 	CATEGORIES: Record<string, string[]>;
// 	URLS: { HOME: string; CART: string };
// 	MESSAGES: Record<string, string>;
// 	TEST_VALUES: {
// 		DUPLICATE_EXPECTED_QTY: string;
// 		INVALID_DATE: string;
// 		NON_NUMERIC_DATE: string;
// 		MOUSE_OUT_X: number;
// 		MOUSE_OUT_Y: number;
// 	};
// 	CASES: {
// 		BASIC: Array<{ id: string; flow: CartBasicFlow }>;
// 		QUANTITY: BoundaryCase[];
// 		TOTAL_LIMIT: { id: string; firstQty: string; secondQty: string; errorKey: string };
// 		RENTAL: BoundaryCase[];
// 		DONATION: BoundaryCase[];
// 		MINI_CART: MiniCartCase[];
// 	};
// };