'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/endpoints'; // Assuming budget API is exposed or will be created in api client
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Target, PiggyBank, Calendar, Trophy } from 'lucide-react';
import type { Goal } from '@/types'; // Need to define this type
import { AddGoalModal } from '@/components/goals/add-goal-modal';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function GoalsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: response, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => fetch('/api/v1/goals', { headers: { Authorization: `Bearer ${localStorage.getItem('finora_token')}` } }).then(res => res.json()),
  });

  const goals = response?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in-fade">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="flex flex-col">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex flex-col">
                  <Skeleton className="h-6 w-32 mb-1" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </CardHeader>
              <CardContent className="pt-2">
                <div className="mb-4">
                  <Skeleton className="h-8 w-48" />
                </div>
                <Skeleton className="h-2 w-full mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in-fade">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Savings Goals</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Set targets and achieve your shared dreams together.</p>
        </div>
        <Button className="shadow-md bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Goal
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {goals.length === 0 ? (
          <div className="col-span-full p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
            <Target className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No active goals</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1 mb-4">Start by creating a goal like "Emergency Fund" or "Vacation".</p>
            <Button variant="outline" onClick={() => setIsAddModalOpen(true)}>Create your first goal</Button>
          </div>
        ) : (
          goals.map((goal: any) => {
            const progress = (goal.current_amount / goal.target_amount) * 100;
            const isCompleted = progress >= 100;
            const percentage = Math.min(100, Math.round(progress));

            return (
              <Card key={goal.id} className={`hover-lift transition-all flex flex-col bg-white dark:bg-gray-900 ${isCompleted ? 'border-emerald-200 dark:border-emerald-800/50 shadow-emerald-100/50 dark:shadow-none bg-emerald-50/30 dark:bg-emerald-900/10' : 'border-gray-200 dark:border-gray-800 shadow-sm'}`}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex flex-col">
                    <CardTitle className="text-xl flex items-center gap-2 dark:text-white">
                      {isCompleted && <Trophy className="h-5 w-5 text-emerald-500" />}
                      {goal.name}
                    </CardTitle>
                    {goal.target_date && (
                      <CardDescription className="flex items-center gap-1 mt-1 text-xs dark:text-gray-400">
                        <Calendar className="h-3 w-3" /> Target: {new Date(goal.target_date).toLocaleDateString()}
                      </CardDescription>
                    )}
                  </div>
                  <div className={`p-2 rounded-lg ${isCompleted ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'}`}>
                    <PiggyBank className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent className="pb-6 flex-1">
                  <div className="mt-4">
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(goal.current_amount)}</p>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">of {formatCurrency(goal.target_amount)}</p>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-3 relative">
                      <div 
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-emerald-500' : 'bg-emerald-400'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-xs font-bold ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {percentage}% Achieved
                      </span>
                      {!isCompleted && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatCurrency(goal.target_amount - goal.current_amount)} to go
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
                <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 rounded-b-xl">
                  <Button variant={isCompleted ? "outline" : "default"} className={`w-full ${isCompleted ? 'text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700' : 'bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200'}`}>
                    {isCompleted ? 'View Details' : 'Add Funds'}
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <AddGoalModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
