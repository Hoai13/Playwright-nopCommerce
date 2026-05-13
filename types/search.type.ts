// search.type.ts
export interface SearchDataFile {
  URLS: {
    HOME: string;
    SEARCH: string;
  };
  MESSAGES: Record<string, string>;
  BASE: SearchData;
  CASES: SearchTestCase[];
}

export type SearchStatus =
  | "warning"
  | "success"
  | "empty"
  | "ui";

export interface SearchExpected {
  status: SearchStatus;
  messageKey?: string;
  advancedVisible?: boolean;
}

export interface SearchData {
  keyword?: string;
  useEnter?: boolean;
  advanced?: boolean;
  categoryLabel?: string;
  manufacturerLabel?: string;
  includeSub?: boolean;
  inDescription?: boolean;
  inTags?: boolean;
}

export interface SearchTestCase {
  id: string;
  description: string;
  flow: string
  override?: Partial<SearchData>;
  expected: SearchExpected;
  tags?: string[];
}