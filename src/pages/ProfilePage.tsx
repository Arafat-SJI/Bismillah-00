import React, { useEffect, useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useProfile, useUpsertProfile } from '@/hooks/useTasks';
import { toast } from 'sonner';

export const ProfilePage: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const upsert = useUpsertProfile();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    })();
  }, []);

  const profileQuery = useProfile(userId);

  useEffect(() => {
    if (profileQuery.data) {
      setName(profileQuery.data.name ?? '');
      setAvatarUrl(profileQuery.data.avatar_url ?? null);
    }
  }, [profileQuery.data]);

  const onSave = async () => {
    if (!userId) return;
    try {
      await upsert.mutateAsync({ id: userId, name, avatar_url: avatarUrl });
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to update profile');
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert small image to base64 and store in avatar_url column.
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarUrl(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <PageLayout>
      <PageLayout.Header>
        <h2 className="text-xl font-semibold">Profile</h2>
      </PageLayout.Header>

      <PageLayout.Content>
        <div className="max-w-md space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <Label>Profile Picture</Label>
            <div className="flex items-center gap-4">
              {avatarUrl ? <img src={avatarUrl} alt="avatar" className="w-20 h-20 rounded-full object-cover" /> : <div className="w-20 h-20 rounded-full bg-gray-200" />}
              <div>
                <input type="file" accept="image/*" onChange={onFileChange} />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={onSave} disabled={upsert.isLoading}>{upsert.isLoading ? 'Saving...' : 'Save'}</Button>
          </div>

          {profileQuery.isLoading && <div>Loading profile...</div>}
          {profileQuery.isError && <div className="text-red-600">Failed to load profile</div>}
        </div>
      </PageLayout.Content>
    </PageLayout>
  );
};
