'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';

export default function PrivacyPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 py-24">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-500 mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>
        <h1 className="text-4xl font-bold tracking-tight mb-8">Privacy Policy</h1>
        <div className="prose prose-emerald dark:prose-invert max-w-none">
          <p>Last updated: September 2026</p>
          <p>
            At Finora, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal and financial information.
          </p>
          <h2>Data Collection</h2>
          <p>We collect information you provide directly to us when you create an account, such as your name and email address. We also collect the financial data you input to provide our core services.</p>
          <h2>Data Usage</h2>
          <p>Your data is used strictly to provide and improve the Finora service. We do not sell your personal or financial data to third parties.</p>
          <h2>Data Security</h2>
          <p>We implement appropriate technical and organizational security measures to protect your data, leveraging enterprise-grade cloud infrastructure.</p>
          <p><em>Disclaimer: Finora is a software product and does not provide banking or regulated financial advisory services.</em></p>
        </div>
      </div>
    </div>
  );
}
