import { auth } from "@/lib/auth";
//NEVER COMMIT with actual names
type User = {
  name: string;
  email: string;
  password: string;
  image: string;
}

const seedUsers: User[] = []

for await (const body of seedUsers)
  auth.api.signUpEmail({ body })