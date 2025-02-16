import { apiServiceLoon as api } from '@/store/apiServiceLoon';
import { PartialDeep } from 'type-fest';
import ProductModel from './products/models/ProductModel';

export const addTagTypes = ['businesses_type'] as const;

const BusinessProfileApi = api
	.enhanceEndpoints({
		addTagTypes
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getBusinessProfiles: build.query<any, any>({
				query: () => ({ url: `/businesses/profiles` }),
				providesTags: ['businesses_type']
			})
		}),
		overrideExisting: false
	});

export default BusinessProfileApi;


export const {
	useGetBusinessProfilesQuery
} = BusinessProfileApi;


