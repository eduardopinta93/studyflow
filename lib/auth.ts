import NextAuth, { type DefaultSession, type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import AzureAD from 'next-auth/providers/azure-ad';
import { randomBytes } from 'node:crypto';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/password';

declare module 'next-auth' {
  interface Session {
    user: { id: string; avatarUrl?: string | null } & DefaultSession['user'];
  }
}

declare module 'next-auth' {
  interface User {
    id: string;
  }
}

const providers: NextAuthConfig['providers'] = [
  Credentials({
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      const email =
        typeof credentials?.email === 'string' ? credentials.email.trim().toLowerCase() : '';
      const password = typeof credentials?.password === 'string' ? credentials.password : '';
      if (!email || !password) return null;

      const user = await db.user.findUnique({ where: { email } });
      if (!user) return null;

      const valid = await verifyPassword(password, user.password);
      if (!valid) return null;

      return { id: user.id, name: user.name, email: user.email };
    },
  }),
];

// OAuth providers are only registered when their credentials are configured
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) providers.push(Google);
if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) providers.push(GitHub);
if (process.env.AUTH_AZURE_AD_ID && process.env.AUTH_AZURE_AD_SECRET) providers.push(AzureAD);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: { signIn: '/auth/login' },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'credentials') {
        if (!user.email) return false;
        const existing = await db.user.findUnique({ where: { email: user.email } });
        if (existing) {
          user.id = existing.id;
        } else {
          const created = await db.user.create({
            data: {
              name: user.name ?? user.email,
              email: user.email,
              password: randomBytes(32).toString('hex'),
            },
          });
          user.id = created.id;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      const id = typeof token.id === 'string' ? token.id : token.sub;
      if (session.user && id) {
        session.user.id = id;
        const user = await db.user.findUnique({ where: { id }, select: { avatarUrl: true } });
        session.user.avatarUrl = user?.avatarUrl ?? null;
      }
      return session;
    },
  },
});

export async function getSessionUserId(): Promise<string | null> {
  const session = await auth();
  const id = session?.user?.id;
  return id ?? null;
}
