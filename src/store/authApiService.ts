import { loginUser, refreshToken } from './apiQuery/authQuery';
import apiService from './apiService';


export const addTagTypes = ['auth'] as const;

const authApiService = apiService
	.enhanceEndpoints({
		addTagTypes
	})
	.injectEndpoints({
		overrideExisting: true,
		endpoints: (build) => ({
			login: build.mutation<
				Awaited<ReturnType<typeof loginUser>>['data'], 
				{ identifier: string; password: string }
			>({
				queryFn: async ({ identifier, password }) => {
					const { data, error } = await loginUser(identifier, password);
					if (error) {
						return { error: { status: error.code, data: error.message } };
					}
					return { data };
				},
				invalidatesTags: [{ type: 'auth', id: 'USER' }]
			}),

			refreshAuthToken: build.mutation<
				Awaited<ReturnType<typeof refreshToken>>['data'], 
				{ refresh_token: string }
			>({
				queryFn: async ({ refresh_token }) => {
					const { data, error } = await refreshToken(refresh_token);
					if (error) {
						return { error: { status: error.code, data: error.message } };
					}
					return { data };
				},
				//providesTags: [{ type: 'auth', id: 'USER' }]
			}),
		}),
	});

export const { useLoginMutation, useRefreshAuthTokenMutation } = authApiService;
export default authApiService;
