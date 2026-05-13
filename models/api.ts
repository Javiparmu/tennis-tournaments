export type ApiStatus = "SUCCESS" | "FAILURE";

export type ApiResponse<T> = {
  status: ApiStatus;
  data: T | null;
  message: string | null;
};
