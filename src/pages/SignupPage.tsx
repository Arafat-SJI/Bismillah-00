import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PageLayout } from '@/components/layout/PageLayout';
import { upsertProfile } from '@/lib/api/taskService';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
});

type FormValues = z.infer<typeof schema>;

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      // supabase creates auth.user; create profile row
      const userId = data.user?.id;
      if (userId) {
        await upsertProfile({ id: userId, name: values.name, email: values.email });
      }

      toast.success('Account created. You may need to confirm via email depending on your Supabase settings.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.message ?? 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <PageLayout.Content>
        <div className="max-w-md mx-auto mt-20">
          <h1 className="text-2xl font-semibold mb-4">Create account</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register('name')} />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password')} />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Sign up'}</Button>
            </div>

            {formState.errors && <div className="text-sm text-red-600">{Object.values(formState.errors).map((e) => e.message).join(', ')}</div>}
          </form>

          <div className="mt-4 text-sm">
            Already have an account? <Link to="/login" className="text-blue-600">Login</Link>
          </div>
        </div>
      </PageLayout.Content>
    </PageLayout>
  );
};
