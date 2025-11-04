import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
} from '@tanstack/react-query';
import { apiService } from '../services/apiService';
import { AxiosResponse } from 'axios';
import { ApiError } from '../types';

/**
 * useApi Hook
 *
 * Custom hooks for making API calls with React Query
 * Provides automatic caching, refetching, and error handling
 */

/**
 * Generic API GET hook using React Query
 *
 * @param queryKey - Unique key for the query
 * @param url - API endpoint URL
 * @param options - React Query options
 *
 * Usage:
 * ```typescript
 * const { data, isLoading, error } = useApiQuery(
 *   ['transactions'],
 *   '/transactions'
 * );
 * ```
 */
export function useApiQuery<TData = any>(
  queryKey: QueryKey,
  url: string,
  options?: Omit<UseQueryOptions<TData, ApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData, ApiError>({
    queryKey,
    queryFn: async () => {
      const response = await apiService.get<TData>(url);
      return response.data;
    },
    ...options,
  });
}

/**
 * Generic API POST mutation hook
 *
 * @param url - API endpoint URL
 * @param options - React Query mutation options
 *
 * Usage:
 * ```typescript
 * const { mutate, isLoading } = useApiPost('/transactions');
 * mutate({ amount: 100, description: 'Lunch' });
 * ```
 */
export function useApiPost<TData = any, TVariables = any>(
  url: string,
  options?: UseMutationOptions<AxiosResponse<TData>, ApiError, TVariables>
) {
  const queryClient = useQueryClient();

  return useMutation<AxiosResponse<TData>, ApiError, TVariables>({
    mutationFn: async (data: TVariables) => {
      return apiService.post<TData>(url, data);
    },
    onSuccess: (data, variables, context) => {
      // Invalidate relevant queries on success
      // You can customize this based on your needs
      queryClient.invalidateQueries();
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

/**
 * Generic API PUT mutation hook
 *
 * @param url - API endpoint URL or function that returns URL based on variables
 * @param options - React Query mutation options
 *
 * Usage:
 * ```typescript
 * const { mutate } = useApiPut((id) => `/transactions/${id}`);
 * mutate({ id: '123', amount: 200 });
 * ```
 */
export function useApiPut<TData = any, TVariables = any>(
  url: string | ((variables: TVariables) => string),
  options?: UseMutationOptions<AxiosResponse<TData>, ApiError, TVariables>
) {
  const queryClient = useQueryClient();

  return useMutation<AxiosResponse<TData>, ApiError, TVariables>({
    mutationFn: async (data: TVariables) => {
      const endpoint = typeof url === 'function' ? url(data) : url;
      return apiService.put<TData>(endpoint, data);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries();
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

/**
 * Generic API PATCH mutation hook
 *
 * @param url - API endpoint URL or function that returns URL based on variables
 * @param options - React Query mutation options
 *
 * Usage:
 * ```typescript
 * const { mutate } = useApiPatch((id) => `/transactions/${id}`);
 * mutate({ id: '123', description: 'Updated' });
 * ```
 */
export function useApiPatch<TData = any, TVariables = any>(
  url: string | ((variables: TVariables) => string),
  options?: UseMutationOptions<AxiosResponse<TData>, ApiError, TVariables>
) {
  const queryClient = useQueryClient();

  return useMutation<AxiosResponse<TData>, ApiError, TVariables>({
    mutationFn: async (data: TVariables) => {
      const endpoint = typeof url === 'function' ? url(data) : url;
      return apiService.patch<TData>(endpoint, data);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries();
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

/**
 * Generic API DELETE mutation hook
 *
 * @param url - API endpoint URL or function that returns URL based on variables
 * @param options - React Query mutation options
 *
 * Usage:
 * ```typescript
 * const { mutate } = useApiDelete((id) => `/transactions/${id}`);
 * mutate('123');
 * ```
 */
export function useApiDelete<TData = any, TVariables = any>(
  url: string | ((variables: TVariables) => string),
  options?: UseMutationOptions<AxiosResponse<TData>, ApiError, TVariables>
) {
  const queryClient = useQueryClient();

  return useMutation<AxiosResponse<TData>, ApiError, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const endpoint = typeof url === 'function' ? url(variables) : url;
      return apiService.delete<TData>(endpoint);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries();
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

/**
 * Hook for uploading files
 *
 * @param url - API endpoint URL for upload
 * @param options - React Query mutation options
 *
 * Usage:
 * ```typescript
 * const { mutate, progress } = useFileUpload('/upload/receipt');
 * mutate(formData);
 * ```
 */
export function useFileUpload<TData = any>(
  url: string,
  options?: UseMutationOptions<AxiosResponse<TData>, ApiError, FormData>
) {
  const queryClient = useQueryClient();

  return useMutation<AxiosResponse<TData>, ApiError, FormData>({
    mutationFn: async (formData: FormData) => {
      return apiService.uploadFile<TData>(url, formData);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries();
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

/**
 * Hook for pagination queries
 *
 * @param queryKey - Base query key
 * @param url - API endpoint URL
 * @param page - Current page number
 * @param limit - Items per page
 * @param options - React Query options
 *
 * Usage:
 * ```typescript
 * const { data, isLoading } = usePaginatedQuery(
 *   ['transactions'],
 *   '/transactions',
 *   1,
 *   20
 * );
 * ```
 */
export function usePaginatedQuery<TData = any>(
  queryKey: QueryKey,
  url: string,
  page: number,
  limit: number,
  options?: Omit<UseQueryOptions<TData, ApiError>, 'queryKey' | 'queryFn'>
) {
  const fullQueryKey = [...(Array.isArray(queryKey) ? queryKey : [queryKey]), page, limit];

  return useQuery<TData, ApiError>({
    queryKey: fullQueryKey,
    queryFn: async () => {
      const response = await apiService.get<TData>(url, {
        params: { page, limit },
      });
      return response.data;
    },
    keepPreviousData: true,
    ...options,
  });
}

/**
 * Hook for infinite scroll queries
 *
 * @param queryKey - Base query key
 * @param url - API endpoint URL
 * @param limit - Items per page
 * @param options - React Query infinite query options
 *
 * Usage:
 * ```typescript
 * const {
 *   data,
 *   fetchNextPage,
 *   hasNextPage,
 *   isFetchingNextPage
 * } = useInfiniteQuery(['transactions'], '/transactions', 20);
 * ```
 */
export function useInfiniteApiQuery<TData = any>(
  queryKey: QueryKey,
  url: string,
  limit: number,
  options?: any
) {
  return useQuery<TData, ApiError>({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiService.get<TData>(url, {
        params: { page: pageParam, limit },
      });
      return response.data;
    },
    getNextPageParam: (lastPage: any) => {
      // Adjust this based on your API's pagination response structure
      if (lastPage.pagination && lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    ...options,
  });
}

/**
 * Hook to invalidate specific queries
 *
 * Usage:
 * ```typescript
 * const invalidate = useInvalidateQueries();
 * invalidate(['transactions']); // Invalidates all transaction queries
 * ```
 */
export function useInvalidateQueries() {
  const queryClient = useQueryClient();

  return (queryKey: QueryKey) => {
    queryClient.invalidateQueries(queryKey);
  };
}

/**
 * Hook to manually update query data in cache
 *
 * Usage:
 * ```typescript
 * const updateCache = useUpdateQueryData();
 * updateCache(['transaction', '123'], newTransactionData);
 * ```
 */
export function useUpdateQueryData() {
  const queryClient = useQueryClient();

  return <TData = any>(queryKey: QueryKey, data: TData) => {
    queryClient.setQueryData(queryKey, data);
  };
}

/**
 * Hook to prefetch queries
 *
 * Usage:
 * ```typescript
 * const prefetch = usePrefetchQuery();
 * prefetch(['transactions'], '/transactions');
 * ```
 */
export function usePrefetchQuery() {
  const queryClient = useQueryClient();

  return async <TData = any>(queryKey: QueryKey, url: string) => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn: async () => {
        const response = await apiService.get<TData>(url);
        return response.data;
      },
    });
  };
}

// Export all hooks as default
export default {
  useApiQuery,
  useApiPost,
  useApiPut,
  useApiPatch,
  useApiDelete,
  useFileUpload,
  usePaginatedQuery,
  useInfiniteApiQuery,
  useInvalidateQueries,
  useUpdateQueryData,
  usePrefetchQuery,
};
