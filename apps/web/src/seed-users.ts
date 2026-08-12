import { auth } from "@/lib/auth";

type User = {
  name: string;
  email: string;
  password: string;
  image?: string | undefined;
  callbackURL?: string | undefined;
  rememberMe?: boolean | undefined;
}

const password = 'securepassword123',
  seedUsers: User[] = [
    { email: 'thomas.steenberg@copenhagen-atomics.com', name: 'Thomas Steenberg', password },
    { email: 'thomas.jam@copenhagen-atomics.com', name: 'Thomas Jam', password },
    { email: 'peter.szabom@copenhagen-atomics.com', name: "Peter Szabom", password },
    { email: 'aslak.stubsgaard@copenhagen-atomics.com', name: 'Aslak Stubsgaard', password },
    { email: 'mads.lousdal@copenhagen-atomics.com', name: 'Mads Lousdal', password },
    { email: 'lars.with@copenhagen-atomics.com', name: 'Lars With', password },
    { email: 'anders.jensen@copenhagen-atomics.com', name: 'Anders Jensen', password },
    { email: 'bertram.agerholm@copenhagen-atomics.com', name: 'Bertram Agerholm', password }
  ] //TODO: add to bitwarden for fast access on demo

for await (const body of seedUsers)
  auth.api.signUpEmail({ body })