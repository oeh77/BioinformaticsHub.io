import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";

// Helper to get providers with DB fallback (integrated into main config)
export const { handlers, signIn, signOut, auth } = NextAuth(async () => {
  // If env vars are missing, try to fetch from DB
  let googleId = process.env.GOOGLE_CLIENT_ID;
  let googleSecret = process.env.GOOGLE_CLIENT_SECRET;
  let githubId = process.env.GITHUB_CLIENT_ID;
  let githubSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!googleId || !googleSecret || !githubId || !githubSecret) {
    try {
      const settings = await prisma.settings.findMany({
        where: { key: { in: ["googleClientId", "googleClientSecret", "githubClientId", "githubClientSecret"] } }
      });
      const getSetting = (key: string) => settings.find(s => s.key === key)?.value;
      
      if (!googleId) googleId = getSetting("googleClientId");
      if (!googleSecret) googleSecret = getSetting("googleClientSecret");
      if (!githubId) githubId = getSetting("githubClientId");
      if (!githubSecret) githubSecret = getSetting("githubClientSecret");
    } catch (e) {
      // Fallback or ignore if DB fails (e.g. during build)
      console.warn("Failed to fetch auth settings from DB", e);
    }
  }
  

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adapter: PrismaAdapter(prisma) as any,
    session: {
      strategy: "jwt",
    },
    pages: {
      signIn: "/login",
      error: "/login",
    },
    providers: [
      Google({
        clientId: googleId,
        clientSecret: googleSecret,
        allowDangerousEmailAccountLinking: true,
      }),
      GitHub({
        clientId: githubId,
        clientSecret: githubSecret,
        allowDangerousEmailAccountLinking: true,
      }),
      Credentials({
        name: "credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }
  
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });
  
          if (!user || !user.password) {
            throw new Error("Invalid email or password");
          }
  
          const isPasswordValid = await compare(
            credentials.password as string,
            user.password
          );
  
          if (!isPasswordValid) {
            throw new Error("Invalid email or password");
          }
  
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id as string;
          token.role = (user as { role?: string }).role || "USER";
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.id as string;
          session.user.role = token.role as string;
        }
        return session;
      },
    },
  };
});
// Helper function to hash passwords
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

// Helper function to verify passwords
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}
