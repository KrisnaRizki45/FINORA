'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, ShieldCheck, PieChart, Users, Sparkles, TrendingUp, 
  Wallet, Banknote, Landmark, Target, HeartHandshake, CheckCircle2, 
  Menu, X, Globe, ChevronDown, Plus, Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import { useLanguage } from '@/lib/i18n/language-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Components that could be extracted, but kept inline for simplicity in landing page
const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 dark:border-gray-800 py-4">
      <button 
        className="flex w-full items-center justify-between text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold text-gray-900 dark:text-white">{question}</span>
        {isOpen ? <Minus className="h-5 w-5 text-gray-500" /> : <Plus className="h-5 w-5 text-gray-500" />}
      </button>
      <div className={`mt-2 pr-12 text-gray-600 dark:text-gray-400 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="pb-4">{answer}</p>
      </div>
    </div>
  );
};

export default function LandingPage() {
  const { isAuthenticated, hasHousehold, isLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (hasHousehold) {
        router.push('/dashboard');
      } else {
        router.push('/setup-household');
      }
    }
  }, [isAuthenticated, hasHousehold, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  const features = [
    { icon: Banknote, title: t('landing.features.f1_title' as any), desc: t('landing.features.f1_desc' as any) },
    { icon: Wallet, title: t('landing.features.f2_title' as any), desc: t('landing.features.f2_desc' as any) },
    { icon: TrendingUp, title: t('landing.features.f3_title' as any), desc: t('landing.features.f3_desc' as any) },
    { icon: Landmark, title: t('landing.features.f4_title' as any), desc: t('landing.features.f4_desc' as any) },
    { icon: PieChart, title: t('landing.features.f5_title' as any), desc: t('landing.features.f5_desc' as any) },
    { icon: Target, title: t('landing.features.f6_title' as any), desc: t('landing.features.f6_desc' as any) },
    { icon: Sparkles, title: t('landing.features.f7_title' as any), desc: t('landing.features.f7_desc' as any) },
    { icon: CheckCircle2, title: t('landing.features.f8_title' as any), desc: t('landing.features.f8_desc' as any) },
    { icon: Users, title: t('landing.features.f9_title' as any), desc: t('landing.features.f9_desc' as any) },
    { icon: ShieldCheck, title: t('landing.features.f10_title' as any), desc: t('landing.features.f10_desc' as any) },
  ];

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white dark:bg-gray-950 selection:bg-emerald-200 dark:selection:bg-emerald-900 transition-colors duration-300 font-sans text-gray-900 dark:text-gray-100">
      
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-10]">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-100/50 dark:bg-emerald-900/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-teal-50/50 dark:bg-teal-900/10 blur-[100px]" />
      </div>

      {/* Header & Navigation */}
      <header className="sticky top-0 z-50 w-full glass shadow-sm dark:shadow-gray-900/20 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 shadow-lg shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <span className="text-lg font-bold text-white">F</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Finora</span>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 mr-4 border-r border-gray-200 dark:border-gray-800 pr-6">
              <Globe className="h-4 w-4 text-gray-500" />
              <button onClick={() => setLanguage('id')} className={`text-sm font-medium ${language === 'id' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>ID</button>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <button onClick={() => setLanguage('en')} className={`text-sm font-medium ${language === 'en' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>EN</button>
            </div>
            <Link href="/login">
              <Button variant="ghost" className="font-semibold hover:bg-emerald-50 dark:hover:bg-gray-900">
                {t('landing.nav.login' as any)}
              </Button>
            </Link>
            <Link href="/register">
              <Button className="font-semibold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white transition-all">
                {t('landing.nav.get_started' as any)}
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-gray-600 dark:text-gray-400" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden glass border-t border-gray-100 dark:border-gray-800 px-6 py-4 flex flex-col gap-4">
            <div className="flex justify-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
              <button onClick={() => setLanguage('id')} className={`px-4 py-2 rounded-full ${language === 'id' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' : 'text-gray-600'}`}>ID</button>
              <button onClick={() => setLanguage('en')} className={`px-4 py-2 rounded-full ${language === 'en' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' : 'text-gray-600'}`}>EN</button>
            </div>
            <Link href="/login" className="w-full text-center py-2 font-medium">
              {t('landing.nav.login' as any)}
            </Link>
            <Link href="/register">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                {t('landing.nav.get_started' as any)}
              </Button>
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Section 1: Hero */}
        <section className="relative px-6 pt-24 pb-16 md:pt-32 md:pb-24 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center rounded-full border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 text-sm font-medium text-emerald-800 dark:text-emerald-400 mb-8 backdrop-blur-sm">
              <Sparkles className="mr-2 h-4 w-4" />
              {t('landing.hero.badge' as any)}
            </div>
            <h1 className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-500 dark:from-white dark:via-gray-200 dark:to-gray-500 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-7xl pb-2 leading-tight">
              {t('landing.hero.title_part1' as any)} <br className="hidden sm:block" /> {t('landing.hero.title_part2' as any)}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400 sm:text-xl">
              {t('landing.hero.subtitle' as any)}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full text-base h-14 px-8 shadow-xl shadow-emerald-600/20 bg-emerald-600 hover:bg-emerald-700 text-white hover:-translate-y-1 transition-all duration-300">
                  {t('landing.hero.cta' as any)} <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Section 7: Dashboard Preview */}
        <section className="mx-auto max-w-6xl px-6 pb-24 lg:px-8">
          <div className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl p-2 sm:p-4 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-10 bg-gray-100 dark:bg-gray-950 flex items-center px-4 gap-2 rounded-t-xl border-b border-gray-200 dark:border-gray-800">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="pt-12 pb-4 px-4 sm:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-500">{t('landing.dashboard_preview.total_balance' as any)}</p>
                <p className="text-3xl font-bold mt-2">Rp 45,000,000</p>
                <div className="mt-4 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-3/4"></div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-500">{t('landing.dashboard_preview.total_portfolio' as any)}</p>
                <p className="text-3xl font-bold mt-2">Rp 120,500,000</p>
                <div className="mt-4 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-1/2"></div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-500">{t('landing.dashboard_preview.monthly_cashflow' as any)}</p>
                <p className="text-3xl font-bold mt-2 text-emerald-600">+Rp 5,200,000</p>
                <div className="mt-4 flex items-end gap-2 h-8">
                   <div className="w-4 h-4 bg-emerald-500 rounded-t-sm" />
                   <div className="w-4 h-6 bg-emerald-500 rounded-t-sm" />
                   <div className="w-4 h-3 bg-red-400 rounded-t-sm" />
                   <div className="w-4 h-8 bg-emerald-500 rounded-t-sm" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Problem */}
        <section className="bg-gray-50 dark:bg-gray-900/50 py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('landing.problem.title' as any)}</h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{t('landing.problem.subtitle' as any)}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              {[
                { title: t('landing.problem.p1_title' as any), desc: t('landing.problem.p1_desc' as any), icon: Banknote },
                { title: t('landing.problem.p2_title' as any), desc: t('landing.problem.p2_desc' as any), icon: Wallet },
                { title: t('landing.problem.p3_title' as any), desc: t('landing.problem.p3_desc' as any), icon: PieChart },
                { title: t('landing.problem.p4_title' as any), desc: t('landing.problem.p4_desc' as any), icon: HeartHandshake }
              ].map((item, i) => (
                <div key={i} className="bg-white dark:bg-gray-950 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                    <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <h3 className="font-semibold text-sm sm:text-lg leading-tight">{item.title}</h3>
                  <p className="mt-1.5 sm:mt-2 text-gray-600 dark:text-gray-400 text-[11px] sm:text-sm leading-snug">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Solution */}
        <section className="py-24 relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('landing.solution.title' as any)}</h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 mb-8">{t('landing.solution.subtitle' as any)}</p>
                <div className="space-y-6">
                  {[
                    { title: t('landing.solution.s1_title' as any), desc: t('landing.solution.s1_desc' as any), icon: PieChart },
                    { title: t('landing.solution.s2_title' as any), desc: t('landing.solution.s2_desc' as any), icon: TrendingUp },
                    { title: t('landing.solution.s3_title' as any), desc: t('landing.solution.s3_desc' as any), icon: Users }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 mt-1 h-10 w-10 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative hidden lg:block">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-3xl transform rotate-3 scale-105" />
                <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <div className="font-semibold">{t('landing.features.f10_title' as any)}</div>
                    <div className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">Secure</div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 w-full" />
                    <div className="h-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 w-5/6" />
                    <div className="h-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Features */}
        <section className="bg-gray-50 dark:bg-gray-900/50 py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('landing.features.title' as any)}</h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{t('landing.features.subtitle' as any)}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              {features.map((f, i) => (
                <div key={i} className="bg-white dark:bg-gray-950 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center hover:shadow-md transition-shadow flex flex-col items-center">
                  <div className="mx-auto h-10 w-10 sm:h-12 sm:w-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                    <f.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm mb-1.5 sm:mb-2">{f.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs leading-tight sm:leading-normal">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 5: Why Use This App */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('landing.why.title' as any)}</h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 mb-8">{t('landing.why.subtitle' as any)}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <div key={num} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {t(`landing.why.w${num}` as any)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: How It Works */}
        <section className="bg-emerald-600 text-white py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">{t('landing.how.title' as any)}</h2>
            <p className="text-emerald-100 text-lg mb-16">{t('landing.how.subtitle' as any)}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="relative">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold mb-6">
                    {step}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{t(`landing.how.step${step}_title` as any)}</h3>
                  <p className="text-emerald-100">{t(`landing.how.step${step}_desc` as any)}</p>
                  
                  {/* Connector Line (Desktop only) */}
                  {step < 4 && (
                    <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-white/20" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 8: Household / Couple Finance */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-6">
              <HeartHandshake className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('landing.household.title' as any)}</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 mb-16">{t('landing.household.subtitle' as any)}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {[1, 2, 3].map((num) => (
                <div key={num} className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <h3 className="font-semibold text-xl mb-3">{t(`landing.household.h${num}_title` as any)}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t(`landing.household.h${num}_desc` as any)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 9: Financial Insights / News */}
        <section className="bg-gray-50 dark:bg-gray-900/50 py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-center">{t('landing.insights.title' as any)}</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 text-center mb-16">{t('landing.insights.subtitle' as any)}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { num: 1, img: '/article1.jpg', link: 'https://www.btn.co.id/id/About/Gallery/Article/Article/Listing/2024/12/23/cara-mengatur-keuangan-agar-tidak-boros' },
                { num: 2, img: '/article2.jpeg', link: 'https://www.chubb.com/id-id/articles/personal/7-cara-mengatur-cash-flow-pribadi-wajib-tahu.html' },
                { num: 3, img: '/article3.png', link: 'https://www.banksinarmas.com/id/artikel/menabung-vs-investasi' }
              ].map((item) => (
                <div key={item.num} className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col">
                  <div className="h-48 w-full relative bg-gray-200 dark:bg-gray-800">
                    <Image src={item.img} alt={t(`landing.insights.i${item.num}_title` as any)} fill className="object-cover" />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg mb-2">{t(`landing.insights.i${item.num}_title` as any)}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-1">{t(`landing.insights.i${item.num}_desc` as any)}</p>
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-medium text-sm hover:underline">{t('landing.insights.read_more' as any)} &rarr;</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 10: FAQ */}
        <section className="py-24">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('landing.faq.title' as any)}</h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{t('landing.faq.subtitle' as any)}</p>
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <FAQItem 
                  key={num} 
                  question={t(`landing.faq.q${num}` as any)} 
                  answer={t(`landing.faq.a${num}` as any)} 
                />
              ))}
            </div>
          </div>
        </section>

        {/* Section 11: Final CTA */}
        <section className="relative px-6 py-24 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-emerald-600/5 dark:bg-emerald-600/10" />
          <div className="mx-auto max-w-4xl text-center relative z-10 bg-white dark:bg-gray-900 border border-emerald-100 dark:border-emerald-900/50 shadow-xl rounded-3xl p-12 md:p-20">
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl mb-6">{t('landing.cta.title' as any)}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-10">{t('landing.cta.subtitle' as any)}</p>
            <Link href="/register">
              <Button size="lg" className="h-14 px-10 shadow-lg shadow-emerald-600/20 bg-emerald-600 hover:bg-emerald-700 text-white text-lg transition-transform hover:-translate-y-1">
                {t('landing.cta.button' as any)}
              </Button>
            </Link>
          </div>
        </section>
      </main>
      
      {/* Section 12: Footer */}
      <footer className="bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 pt-16 pb-8">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold">F</div>
                <span className="text-xl font-bold">Finora</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 max-w-xs text-sm leading-relaxed mb-6">
                {t('landing.hero.subtitle' as any)}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">{t('landing.footer.product' as any)}</h4>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/#features" className="hover:text-emerald-600">{t('landing.footer.features' as any)}</Link></li>
                <li><Link href="/" className="hover:text-emerald-600">{t('landing.footer.pricing' as any)}</Link></li>
                <li><Link href="/login" className="hover:text-emerald-600">{t('landing.nav.login' as any)}</Link></li>
                <li><Link href="/register" className="hover:text-emerald-600">{t('landing.nav.get_started' as any)}</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">{t('landing.footer.company' as any)}</h4>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/about" className="hover:text-emerald-600">{t('landing.footer.about' as any)}</Link></li>
                <li><Link href="/contact" className="hover:text-emerald-600">{t('landing.footer.contact' as any)}</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">{t('landing.footer.legal' as any)}</h4>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/privacy" className="hover:text-emerald-600">{t('landing.footer.privacy' as any)}</Link></li>
                <li><Link href="/terms" className="hover:text-emerald-600">{t('landing.footer.terms' as any)}</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-200 dark:border-gray-800 text-center md:text-left text-sm text-gray-400 flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} Finora. {t('landing.footer.rights' as any)}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
