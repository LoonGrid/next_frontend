import NextAuth from 'next-auth';
import { User } from '@auth/user';
import { createStorage } from 'unstorage';
import memoryDriver from 'unstorage/drivers/memory';
import vercelKVDriver from 'unstorage/drivers/vercel-kv';
import { UnstorageAdapter } from '@auth/unstorage-adapter';
import type { NextAuthConfig } from 'next-auth';
import type { Provider } from 'next-auth/providers';
import Credentials from 'next-auth/providers/credentials';
import Facebook from 'next-auth/providers/facebook';
import Google from 'next-auth/providers/google';
import { authGetDbUserByEmail, authCreateDbUser, authGetMe } from './authApi';
import { FetchApiError, setGlobalHeaders } from '@/utils/apiFetch';
import { loginUser } from '@/store/apiQuery/authQuery';
import { setGlobalHeadersLoon } from '@/utils/apiFetchLoon';

const storage = createStorage({
	driver: process.env.VERCEL
		? vercelKVDriver({
			url: process.env.AUTH_KV_REST_API_URL,
			token: process.env.AUTH_KV_REST_API_TOKEN,
			env: false
		})
		: memoryDriver()
});

export const providers: Provider[] = [
	Credentials({
		async authorize(formInput) {

			/**
			 * !! This is just for demonstration purposes
			 * You can create your own validation logic here
			 * !! Do not use this in production
			 */

			/**
			 * Sign in
			 */
			const { data, error } = await loginUser(formInput.email, formInput.password);
			console.log("loginUser response:", data, "error:", error);
			if (error) {
				return null
			}
			const { access_token, refresh_token } = data.payload;
			setGlobalHeaders({ Authorization: `Bearer ${access_token}` });

			if (formInput.formType === 'signin') {
				if (formInput.password === '' || formInput.email !== 'akkrumesh@gmail.com') {
					return null;
				}
			}

			/**
			 * Sign up
			 */
			if (formInput.formType === 'signup') {
				if (formInput.password === '' || formInput.email === '') {
					return null;
				}
			}

			/**
			 * Response Success with email
			 */
			return {
				email: formInput?.email as string,
				accessToken: access_token,
				refreshToken: refresh_token
			};
		}
	}),
	Google,
	Facebook
];

const config = {
	theme: { logo: '/assets/images/logo/logo.svg' },
	adapter: UnstorageAdapter(storage),
	pages: {
		signIn: '/sign-in'
	},
	providers,
	basePath: '/auth',
	trustHost: true,
	callbacks: {
		authorized() {
			/** Checkout information to how to use middleware for authorization
			 * https://next-auth.js.org/configuration/nextjs#middleware
			 */
			return true;
		},
		jwt({ token, trigger, account, user }) {

			if (trigger === 'update') {
				token.name = user.name;
			}

			if (account?.provider === 'credentials') {
				const { accessToken, refreshToken } = user as any
				return { ...token, accessToken, refreshToken };
			}



			if (account?.provider === 'keycloak') {
				return { ...token, accessToken: account.access_token };
			}

			return token;
		},
		async session({ session, token }) {
			// console.log('token :', token);
			// console.log('session :', session);


			if (token.accessToken && typeof token.accessToken === 'string') {
				session.accessToken = token.accessToken;
				setGlobalHeadersLoon({ Authorization: `Bearer ${token.accessToken}` });
			}

			if (session) {
				try {
					/**
					 * Get the session user from database
					 */
					const response = await authGetMe();
					const data = await response.json()
					console.log('data :', data);

					const userDbData = {
						id: data.payload.id,
						role: 'admin',
						displayName: data.payload.username,
						photoURL: '/assets/images/avatars/brian-hughes.jpg',
						email: data.payload.email,
						settings: { layout: {}, theme: {} },
						shortcuts: ['apps.calendar', 'apps.mailbox', 'apps.contacts']
					} as User;

					session.db = userDbData;


					const temp = {
						id: data.payload.id,
						role: 'admin',
						displayName: data.payload.username,
						photoURL: '/assets/images/avatars/brian-hughes.jpg',
						email: data.payload.email,
						settings: { layout: {}, theme: {} },
						shortcuts: ['apps.calendar', 'apps.mailbox', 'apps.contacts']
					}

					// const response = await authGetDbUserByEmail(session.user.email);

					// const userDbData = (await response.json()) as User;
					// console.log('userDbData :', userDbData);

					session.db = userDbData;

					return session;

					return session;
				} catch (error) {
					const errorStatus = (error as FetchApiError).status;

					/** If user not found, create a new user */
					if (errorStatus === 404) {
						const newUserResponse = await authCreateDbUser({
							email: session.user.email,
							role: ['admin'],
							displayName: session.user.name,
							photoURL: session.user.image
						});

						const newUser = (await newUserResponse.json()) as User;

						console.error('Error fetching user data:', error);

						session.db = newUser;

						return session;
					}

					throw error;
				}
			}

			return null;
		}
	},
	experimental: {
		enableWebAuthn: true
	},
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60 // 30 days
	},
	debug: process.env.NODE_ENV !== 'production'
} satisfies NextAuthConfig;

export type AuthJsProvider = {
	id: string;
	name: string;
	style?: {
		text?: string;
		bg?: string;
	};
};

export const authJsProviderMap: AuthJsProvider[] = providers
	.map((provider) => {
		const providerData = typeof provider === 'function' ? provider() : provider;

		return {
			id: providerData.id,
			name: providerData.name,
			style: {
				text: (providerData as { style?: { text: string } }).style?.text,
				bg: (providerData as { style?: { bg: string } }).style?.bg
			}
		};
	})
	.filter((provider) => provider.id !== 'credentials');

export const { handlers, auth, signIn, signOut } = NextAuth(config);
