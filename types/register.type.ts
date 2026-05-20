export interface RegisterFormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export interface RegisterExpected {
  success: boolean;
  field?: keyof RegisterFormData;
  message?: string;
  summaryMessage?: string;
}

export interface RegisterTestCase {
  id: string;
  description: string;
  override?: Partial<RegisterFormData>;
  expected: RegisterExpected;
  tags?: string[];
}

export type ExtendedRegisterCase = RegisterTestCase & {
  flow?: "duplicateEmail" | "passwordMaskingOnly";
};

export type RegisterDataFile = {
  URL: string;
  MESSAGES: {
    REGISTER_SUCCESS: string;
  };
  BASE_VALID: RegisterFormData;
  BUSINESS_FLOW: {
    DUPLICATE_EMAIL: {
      summaryMessage: string;
    };
  };
  UI_ASSERTIONS: {
    PASSWORD_MASKING: {
      passwordType: string;
      confirmPasswordType: string;
    };
  };
  CASES: ExtendedRegisterCase[];
};