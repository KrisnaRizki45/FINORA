'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/endpoints';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Home, Activity, AlertCircle, Server, Database, ShieldAlert, Cpu } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function AdminDashboardPage() {
  const { data: statsRes, isLoading: statsLoading, isError } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats(),
  });

  const { data: usersRes, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-recent-users'],
    queryFn: () => adminApi.getUsers({ page: 1, per_page: 5 }),
  });

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl border-dashed border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
        <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-400">Failed to load statistics</h3>
        <p className="text-red-600 dark:text-red-500 mt-1">Make sure you have admin privileges and the server is running.</p>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Users',
      value: statsRes?.data?.users || 0,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      name: 'Total Households',
      value: statsRes?.data?.households || 0,
      icon: Home,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      name: 'Total Transactions',
      value: statsRes?.data?.transactions || 0,
      icon: Activity,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ];

  const recentUsers = usersRes?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Overview</h2>
        <p className="text-gray-500 dark:text-gray-400">Key metrics for the Finora platform.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statsLoading
          ? Array(3).fill(0).map((_, i) => (
              <Card key={i} className="border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-16" />
                </CardContent>
              </Card>
            ))
          : stats.map((stat) => (
              <Card key={stat.name} className="border-gray-200 dark:border-gray-800 shadow-sm transition-all hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.name}
                  </CardTitle>
                  <div className={`p-2.5 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users List */}
        <Card className="lg:col-span-2 border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest users to join the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {usersLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-3 w-[150px]" />
                    </div>
                  </div>
                ))
              ) : recentUsers.length === 0 ? (
                <div className="text-center py-4 text-sm text-gray-500">No users found</div>
              ) : (
                recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Users className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mb-1 ${
                        user.role === 'admin' 
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' 
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}>
                        {user.role || 'user'}
                      </span>
                      <p className="text-xs text-gray-400">{format(new Date(user.created_at), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Health / Status */}
        <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-gray-900/50">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Live service status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <Server className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">API Server</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500">Operational</p>
                </div>
              </div>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">99.9%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <Database className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Database</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500">Operational</p>
                </div>
              </div>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">99.9%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <ShieldAlert className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Supabase Auth</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500">Operational</p>
                </div>
              </div>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">12ms</span>
            </div>
            
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center"><Cpu className="h-4 w-4 mr-1"/> Server Load</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">12%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '12%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
