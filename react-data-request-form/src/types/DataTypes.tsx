export interface Row {
  [columnName: string]: number | string | null | boolean;
}

export interface DataFrame extends Array<Row> {}

export interface Dictionary<T> {
  [Key: string]: T;
}

export interface ListItem {
  [key: string]: string | null;
}

export interface List extends Array<ListItem> {}

export interface OrderingItem {
  [key: number]: string;
}

export interface OrderingList extends Array<OrderingItem> {}

export interface FetchDataResponse {
  data: DataFrame;
}

export interface DataSummaries {
  data: DataFrame;
  imagingDataBySite: DataFrame;
  columnsSummary: DataFrame;
  recordsBySite: DataFrame;
}

export interface AuthorsOptions {
  dataByAuthor: DataFrame;
  dataBySite: DataFrame;
}

export interface FormattedAuthorsRequest {
  groupBy: string;
  nameFormatOption: number;
  sites: string[] | null;
  authors: number[] | null;
  firstAuthors: number[] | null;
  lastAuthors: number[] | null;
}

export interface FormattedAuthorsResponse {
  formattedAuthors: string;
}

export interface pdfData {
  visit: "1" | "2";
  sections: Array<Section>;
}

export interface Section {
  title: string | null;
  type: "table" | "section";
  description: string | null;
  subsections: Array<Subsection> | null;
}

export interface Subsection {
  title: string | null;
  type: "list" | "table";
  description: string | null;
  value: DataFrame | List | null;
  ordering: OrderingList | null;
}

export interface QCDataResponse {
  blueprint: pdfData;
  data: Dictionary<string | number>;
  errors: Dictionary<string | number>;
}

export interface SelectedOptions {
  allSelected: boolean;
  selectedCount: number;
  selectedRows: Row[];
}
