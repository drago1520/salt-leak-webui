'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { loginSchema, type LoginFormValues } from '@/lib/login-schema';
import { cn } from '@/lib/utils';
import { authClient } from '@/lib/auth-client';
import { redirect } from 'next/navigation';

export function LoginForm({ className, ...props }: React.ComponentProps<'form'>) {
  const f = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'demo@drago.com',
      password: 'definitely a secure password',
    },
  });

  return (
    <Form {...f}>
      <form
        className={cn('flex flex-col gap-6', className)}
        onSubmit={f.handleSubmit(async v => {
          const res = await authClient.signIn.email({ email: v.email, password: v.password });
          if (res.error) f.setError('email', { message: res.error?.message });
          else redirect('/');
        })}
        {...props}
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Login to your account</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Enter your email below to login to your account
            </p>
          </div>
          <FormField
            control={f.control}
            name="email"
            render={({ field }) => (
              <FormItem data-invalid={!!f.formState.errors.email}>
                <FormLabel htmlFor="email">Email</FormLabel>
                <FormControl>
                  <Input id="email" type="email" placeholder="m@example.com" className="bg-background" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={f.control}
            name="password"
            render={({ field }) => (
              <FormItem data-invalid={!!f.formState.errors.password}>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  {/* <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
                    Forgot your password?
                  </a> */}
                </div>
                <FormControl>
                  <Input
                    id="password"
                    type="password"
                    placeholder="definitely secure password"
                    className="bg-background"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Field>
            <Button type="submit" disabled={f.formState.isSubmitting}>
              {f.formState.isSubmitting && <LoaderCircleIcon className="size-4 animate-spin" />}
              {f.formState.isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </Field>
          <FieldSeparator>Or continue with</FieldSeparator>
          <Field>
            <Button variant={'outline'} type="button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                  fill="currentColor"
                />
              </svg>
              Login with GitHub
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </Form>
  );
}
