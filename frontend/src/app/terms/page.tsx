'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';

export default function TermsPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 py-24">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-500 mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
        <h1 className="text-4xl font-bold tracking-tight mb-8">Terms of Service</h1>
        <div className="prose prose-emerald dark:prose-invert max-w-none">
          <p>Last updated: September 2026</p>
          <p>
            By using Finora, you agree to these Terms of Service. Finora is a personal and household finance tracking application.
          </p>
          <h2>1. Use of Service</h2>
          <p>You agree to provide accurate information when creating an account and not to misuse the Finora platform. You are responsible for maintaining the confidentiality of your account credentials.</p>
          <h2>2. Disclaimer of Financial Advice</h2>
          <p>Finora is a software product and does not provide banking, brokerage, lending, or regulated financial advisory services. All financial decisions are solely your responsibility.</p>
          <h2>3. Termination</h2>
          <p>We reserve the right to terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including breach of these Terms.</p>
        </div>
      </div>
    </div>
  );
}
