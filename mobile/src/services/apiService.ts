import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import { API_CONFIG, API_HEADERS, HTTP_STATUS } from '../config/api';
import { SecureStorage } from './storageService';
import { ApiError } from '../types';

/**
 * API Service
 *
 * Axios wrapper with interceptors for:
 * - Adding auth tokens to requests
 * - Handling token refresh on 401 errors
 * - Standardized error handling
 * - Request/response logging in dev mode
 */

class ApiService {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        [API_HEADERS.CONTENT_TYPE]: 'application/json',
        [API_HEADERS.ACCEPT]: 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Add auth token to requests
        const accessToken = await SecureStorage.getAccessToken();
        if (accessToken && config.headers) {
          config.headers[API_HEADERS.AUTHORIZATION] = `Bearer ${accessToken}`;
        }

        // Log request in dev mode
        if (__DEV__) {
          console.log('API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            data: config.data,
            params: config.params,
          });
        }

        return config;
      },
      (error) => {
        if (__DEV__) {
          console.error('Request Error:', error);
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Log response in dev mode
        if (__DEV__) {
          console.log('API Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data,
          });
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // Log error in dev mode
        if (__DEV__) {
          console.error('API Error:', {
            status: error.response?.status,
            url: originalRequest?.url,
            data: error.response?.data,
          });
        }

        // Handle 401 Unauthorized - Token refresh
        if (
          error.response?.status === HTTP_STATUS.UNAUTHORIZED &&
          !originalRequest._retry
        ) {
          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return this.axiosInstance(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Attempt to refresh token
            const refreshToken = await SecureStorage.getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await this.axiosInstance.post(
              API_CONFIG.ENDPOINTS.AUTH.REFRESH,
              { refreshToken }
            );

            const { accessToken, refreshToken: newRefreshToken } = response.data;

            // Save new tokens
            await SecureStorage.saveTokens(accessToken, newRefreshToken);

            // Update the original request with new token
            if (originalRequest.headers) {
              originalRequest.headers[API_HEADERS.AUTHORIZATION] = `Bearer ${accessToken}`;
            }

            // Process queued requests
            this.processQueue(null);

            // Retry original request
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            // Token refresh failed - clear tokens and redirect to login
            this.processQueue(refreshError);
            await SecureStorage.clearTokens();

            // Emit event for auth context to handle
            // Note: You'll need to implement an event emitter or use a global state
            // to notify the app that the user needs to log in again

            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Transform error to standardized format
        const apiError: ApiError = {
          message:
            (error.response?.data as any)?.message ||
            error.message ||
            'An unexpected error occurred',
          code: (error.response?.data as any)?.code || 'UNKNOWN_ERROR',
          statusCode: error.response?.status || 500,
          errors: (error.response?.data as any)?.errors,
        };

        return Promise.reject(apiError);
      }
    );
  }

  /**
   * Process queued requests after token refresh
   */
  private processQueue(error: any): void {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve();
      }
    });

    this.failedQueue = [];
  }

  /**
   * GET request
   */
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  /**
   * POST request
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  /**
   * PUT request
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }

  /**
   * Upload file with multipart/form-data
   */
  async uploadFile<T = any>(
    url: string,
    formData: FormData,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, formData, {
      headers: {
        [API_HEADERS.CONTENT_TYPE]: 'multipart/form-data',
      },
      onUploadProgress,
    });
  }

  /**
   * Download file
   */
  async downloadFile(
    url: string,
    onDownloadProgress?: (progressEvent: any) => void
  ): Promise<AxiosResponse<Blob>> {
    return this.axiosInstance.get(url, {
      responseType: 'blob',
      onDownloadProgress,
    });
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests(): void {
    // Implementation depends on your needs
    // You can use axios CancelToken for this
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export the class for testing purposes
export default ApiService;
