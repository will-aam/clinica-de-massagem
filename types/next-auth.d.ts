import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    organizationId: string;
    organizationName: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      organizationId: string;
      organizationName: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    organizationId: string;
    organizationName: string;
  }
}
