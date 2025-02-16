import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BaseQueryFn, FetchArgs, FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query';
import { API_BASE_URL, globalHeaders } from '@/utils/apiFetchLoon';
import { getSession, useSession } from 'next-auth/react';

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, object, FetchBaseQueryMeta> = async (
	args,
	api,
	extraOptions
) => {
	const session = await getSession();
	const result = await fetchBaseQuery({
		baseUrl: API_BASE_URL,
		prepareHeaders: (headers) => {
			// Object.entries(globalHeaders).forEach(([key, value]) => {
			// 	headers.set(key, value);
			// });
			if (session?.accessToken) {
				headers.set('Authorization', `Bearer ${session.accessToken}`);
			}
			 headers.set('Access-Control-Allow-Origin', '*')
			return headers;
		}
	})(args, api, extraOptions);

	// Example of handling specific error codes
	if (result.error && result.error.status === 401) {
		// Logic to handle 401 errors (e.g., refresh token)
	}
	

	return result;
};

export const apiServiceLoon = createApi({
	baseQuery,
	endpoints: () => ({}),
	reducerPath: 'apiServiceLoon'
});

export default apiServiceLoon;
