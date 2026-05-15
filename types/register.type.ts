export type Gender = "Male" | "Female";

export interface RegisterFormData {
  gender?: Gender;
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  newsletter?: boolean;
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