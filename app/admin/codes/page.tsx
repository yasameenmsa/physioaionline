'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Copy, CheckCircle2, XCircle, Plus, Trash2 } from 'lucide-react';

interface Voucher {
  _id: string;
  code: string;
  type: 'trial' | 'premium';
  durationDays: number | null;
  maxUses: number;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export default function AdminCodesPage() {
  const [codes, setCodes] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    type: 'trial' as 'trial' | 'premium',
    durationDays: 7,
    maxUses: 1,
    count: 1,
  });

  async function fetchCodes() {
    setLoading(true);
    const res = await fetch('/api/admin/codes');
    const json = await res.json();
    if (json.data) setCodes(json.data);
    setLoading(false);
  }

  useEffect(() => { fetchCodes(); }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setMessage('');

    const res = await fetch('/api/admin/codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setMessage(json.message || json.error || '');
    setGenerating(false);
    if (json.success) fetchCodes();
  }

  async function copyCode(code: string, id: string) {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Voucher Codes</h1>
        <p className="text-muted-foreground">Generate and manage premium/trial codes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generate Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <Label>Type</Label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as 'trial' | 'premium' })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="trial">Trial</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              {form.type === 'trial' && (
                <div>
                  <Label>Duration (days)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.durationDays}
                    onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })}
                  />
                </div>
              )}
              <div>
                <Label>Max uses</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.maxUses}
                  onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Count</Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={form.count}
                  onChange={(e) => setForm({ ...form, count: Number(e.target.value) })}
                />
              </div>
            </div>

            {message && (
              <p className="text-sm text-green-600">{message}</p>
            )}

            <Button type="submit" disabled={generating}>
              {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Generate
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Codes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : codes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No codes generated yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">Code</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Uses</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Created</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((v) => (
                    <tr key={v._id} className="border-b last:border-0">
                      <td className="py-2 font-mono font-bold">{v.code}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          v.type === 'premium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {v.type === 'premium' ? 'Premium' : `Trial (${v.durationDays}d)`}
                        </span>
                      </td>
                      <td className="py-2">{v.usedCount}/{v.maxUses}</td>
                      <td className="py-2">
                        {v.active ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600">
                            <XCircle className="h-3.5 w-3.5" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {new Date(v.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => copyCode(v.code, v._id)}
                            title="Copy code"
                          >
                            {copiedId === v._id ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
