import Link from 'next/link';
import { BookOpen, HelpCircle, BarChart3, FileEdit, Bookmark } from 'lucide-react';
import { auth } from '@/lib/auth';

const quickLinks = [
  { href: '/articles', label: 'Knowledge Base', description: 'Browse physiotherapy articles and resources', icon: BookOpen },
  { href: '/dashboard/practice', label: 'Practice', description: 'Test your knowledge with exam questions', icon: HelpCircle },
  { href: '/dashboard/progress', label: 'Progress', description: 'Track your learning progress', icon: BarChart3 },
  { href: '/dashboard/contributions', label: 'My Articles', description: 'Manage your submitted articles', icon: FileEdit },
  { href: '/dashboard/bookmarks', label: 'Bookmarks', description: 'View your saved articles', icon: Bookmark },
];

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold">Getting Started</h2>
        <p className="text-muted-foreground mt-1">
          Welcome to PhysioAI.online{ session?.user?.name ? `, ${session.user.name}` : '' }
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-lg border p-6 hover:border-primary hover:shadow-sm transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-md bg-primary/10 p-2">
                <link.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium group-hover:text-primary transition-colors">
                  {link.label}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {link.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
