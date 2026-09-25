'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';

export default function AboutPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 py-24">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-500 mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
        <h1 className="text-4xl font-bold tracking-tight mb-8">About Finora</h1>
        <div className="prose prose-emerald dark:prose-invert max-w-none">
          <p>
            Finora is a comprehensive personal and household finance application designed to help you track expenses, manage budgets, and monitor your total wealth in one place.
          </p>
          <p>
            Our mission is to bring transparency and ease to personal and shared finances, empowering individuals and couples to build a secure financial future together without the hassle of manual spreadsheets.
          </p>
        </div>
      </div>
    </div>
  );
}
