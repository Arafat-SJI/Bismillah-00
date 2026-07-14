import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PageLayout } from '@/components/layout/PageLayout';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormValues = z.infer<typeof schema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const { data: res, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;
      toast.success('Logged in');
      // redirect to intended destination
      const dest = location.state?.from ?? '/dashboard';
      navigate(dest, { replace: true });
    } catch (err: any) {
      toast.error(err?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <PageLayout.Content>
        <div className="max-w-md mx-auto mt-20">
          <h1 className="text-2xl font-semibold mb-4">Login</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password')} />
            </div>

            <div className="flex items-center justify-between">
              <Button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
              <Link to="/signup" className="text-sm text-blue-600">Create an account</Link>
            </div>

            {formState.errors && <div className="text-sm text-red-600">{Object.values(formState.errors).map((e) => e.message).join(', ')}</div>}
          </form>
        </div>
      </PageLayout.Content>
    </PageLayout>
  );
};
