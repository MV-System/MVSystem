export interface Pagination extends DatePaging{
    pageIndex: number;
    pageSize: number;
}
export interface DatePaging{
    fechaInicio?: string;
    fechaFinal?: string;
  }
  