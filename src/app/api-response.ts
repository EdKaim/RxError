export interface ApiResponse<T> {
  success: boolean;
  result?: T;
  error?: Error;
}
