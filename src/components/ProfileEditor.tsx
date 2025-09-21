import React, { useState } from 'react';
import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useFirestoreAuthContext } from '../contexts/FirestoreAuthContext';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface ProfileForm {
  name: string;
  username: string;
  bio?: string;
  location?: string;
  website?: string;
  avatarFile?: File | null;
}

interface ProfileEditorProps {
  initial?: Partial<ProfileForm>;
  onSaved?: () => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ initial, onSaved }) => {
  const { privyUser, updateProfile } = useFirestoreAuthContext();
  const [form, setForm] = useState<ProfileForm>({
    name: initial?.name || '',
    username: initial?.username || '',
    bio: initial?.bio || '',
    location: initial?.location || '',
    website: initial?.website || '',
    avatarFile: null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm((f) => ({ ...f, avatarFile: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privyUser?.id) return;
    setSaving(true);
    setError(null);

    try {
      let avatarUrl: string | undefined = undefined;

      if (form.avatarFile) {
        // Upload to Storage at avatars/{userId}
        const fileRef = ref(storage, `avatars/${encodeURIComponent(privyUser.id)}`);
        await uploadBytes(fileRef, form.avatarFile);
        avatarUrl = await getDownloadURL(fileRef);
      }

      const payload: any = {
        name: form.name.trim(),
        username: form.username.trim(),
      };
      if (form.bio && form.bio.trim()) payload.bio = form.bio.trim();
      if (form.location && form.location.trim()) payload.location = form.location.trim();
      if (form.website && form.website.trim()) payload.website = form.website.trim();
      if (avatarUrl) payload.avatar = avatarUrl;

      const ok = await updateProfile(payload);
      if (!ok) throw new Error('Failed to save profile');
      onSaved?.();
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2 text-sm rounded bg-destructive/10 text-destructive">{error}</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm block mb-1">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-border rounded px-3 py-2 bg-background"
            />
          </div>
          <div>
            <label className="text-sm block mb-1">Username</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full border border-border rounded px-3 py-2 bg-background"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm block mb-1">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              className="w-full border border-border rounded px-3 py-2 bg-background"
            />
          </div>
          <div>
            <label className="text-sm block mb-1">Location</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full border border-border rounded px-3 py-2 bg-background"
            />
          </div>
          <div>
            <label className="text-sm block mb-1">Website</label>
            <input
              name="website"
              value={form.website}
              onChange={handleChange}
              className="w-full border border-border rounded px-3 py-2 bg-background"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm block mb-1">Profile Photo</label>
            <input type="file" accept="image/*" onChange={handleFile} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
