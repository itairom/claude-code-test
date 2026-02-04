interface ApiResponse<T> {
  data: T;
  status: number;
}

export const fetchData = async <T>(url: string): Promise<ApiResponse<T>> => {
  const response = await fetch(url);
  const data = await response.json();
  return { data, status: response.status };
};
