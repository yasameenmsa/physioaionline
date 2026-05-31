'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Camera, Loader2, Save, Mail } from 'lucide-react';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');


  useEffect(() => {
    if (status === 'unauthenticated') redirect('/login');
    if (status !== 'authenticated') return;

    fetch('/api/user/profile')
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          setName(json.data.name || '');
          setBio(json.data.bio || '');
          setImage(json.data.image || '');
        }
        setLoading(false);
      });
  }, [status]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) setImage(data.data.url);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, bio, image: image || undefined }),
    });
    const json = await res.json();
    if (json.data) {
      setMessage('Profile saved');
      update();
    } else {
      setMessage(json.error || 'Failed to save');
    }
    setSaving(false);
  }

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-muted rounded" /><div className="h-64 bg-muted rounded" /></div>;
  }

  const user = session?.user;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Profile</h2>
        <p className="text-sm text-muted-foreground">Manage your public profile information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile Photo</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-muted overflow-hidden flex items-center justify-center border-2 border-border">
              {image ? (
                <img src={image} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
              ) : (
                <span className="text-2xl font-bold text-muted-foreground">
                  {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-primary p-1.5 text-primary-foreground shadow hover:bg-primary/90 transition-colors">
              <Camera className="h-3.5 w-3.5" />
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
            </label>
            {uploading && <Loader2 className="absolute inset-0 m-auto h-6 w-6 animate-spin text-primary" />}
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{user?.name || 'No name set'}</p>
            <p>{user?.email}</p>
            <p className="capitalize">Tier: {user?.tier}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Contact{' '}
            <a href="mailto:yasmeenawawdehm@gmail.com" className="text-primary hover:underline font-medium">
              yasmeenawawdehm@gmail.com
            </a>{' '}
            to get a subscription and unlock all features.
          </p>
          <a
            href="/pricing"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
          >
            <Mail className="h-4 w-4" />
            View pricing plans
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Display Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Tell us about yourself..."
            />
            <p className="text-xs text-muted-foreground mt-1">{bio.length}/500</p>
          </div>

          {message && (
            <p className={`text-sm ${message === 'Profile saved' ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}

          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
