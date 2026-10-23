/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  HeartHandshake,
  Sparkles,
  Send,
  CheckCircle,
  Phone,
  User,
  Tag,
  DollarSign,
  FileText,
  Link as LinkIcon,
  MessageCircle,
} from 'lucide-react';
import { CustomerWish } from '../types';
import { User as FirebaseUser } from '../firebase';

interface CustomerWishModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: FirebaseUser | null;
  language?: 'bn' | 'en';
  onSubmitWish: (wish: CustomerWish) => Promise<boolean>;
  whatsappNumber?: string;
}

export const CustomerWishModal: React.FC<CustomerWishModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  language = 'bn',
  onSubmitWish,
  whatsappNumber = '8801900000000',
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('fashion');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [description, setDescription] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-fill customer details from signed-in user
  useEffect(() => {
    if (currentUser) {
      if (currentUser.displayName && !customerName) {
        setCustomerName(currentUser.displayName);
      }
      if (currentUser.email && !customerEmail) {
        setCustomerEmail(currentUser.email);
      }
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage(language === 'bn' ? 'পণ্যের নাম বা উইশের শিরোনাম লিখুন' : 'Please enter product name or wish title');
      return;
    }

    if (!description.trim()) {
      setErrorMessage(language === 'bn' ? 'পণ্যের বর্ণনা বা বিস্তারিত বিবরণ লিখুন' : 'Please provide details or specifications');
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage(language === 'bn' ? 'আপনার নাম লিখুন' : 'Please enter your full name');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage(language === 'bn' ? 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন' : 'Please enter a valid phone number');
      return;
    }

    const newWish: CustomerWish = {
      id: `wish_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      category,
      expectedPrice: expectedPrice.trim() || undefined,
      description: description.trim(),
      referenceUrl: referenceUrl.trim() || undefined,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      status: 'pending',
      userId: currentUser?.uid,
      createdAt: new Date().toISOString(),
    };

    setIsSubmitting(true);
    try {
      const ok = await onSubmitWish(newWish);
      if (ok) {
        setIsSubmitted(true);
      } else {
        setErrorMessage(language === 'bn' ? 'উইশ সাবমিট করতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Failed to submit wish. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error submitting wish');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setTitle('');
    setDescription('');
    setExpectedPrice('');
    setReferenceUrl('');
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden transition-all my-8 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Ribbon */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 text-white border-b border-stone-800">
          <button
            onClick={handleResetAndClose}
            aria-label="Close"
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white hover:bg-stone-800/80 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center shadow-md">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  {language === 'bn' ? 'উইশ বা পণ্যের আবদার জানান' : 'Share Your Wish / Product Request'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-stone-950">
                  {language === 'bn' ? 'গ্রাহক সেবা' : 'Customer Wish'}
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                {language === 'bn'
                  ? 'আপনার কাঙ্ক্ষিত পণ্যের বিবরণ দিন, আমরা দ্রুত স্টকে এনে আপনাকে জানাব।'
                  : 'Tell us what you want to buy, and our team will arrange it for you.'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  {language === 'bn' ? 'আপনার উইশটি সফলভাবে জমা হয়েছে!' : 'Your Wish Has Been Submitted!'}
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 max-w-sm mx-auto">
                  {language === 'bn'
                    ? 'আমাদের প্রকিউরমেন্ট টিম আপনার আবদারটি সরাসরি অ্যাডমিন প্যানেলে পেয়েছে। পণ্যটি সংগ্রহ হওয়া মাত্রই আমরা আপনার নম্বরে যোগাযোগ করব।'
                    : 'Our sourcing team has received your request in the admin console. We will contact you as soon as this item is ready.'}
                </p>
              </div>

              {/* WhatsApp Quick Follow-up option */}
              <div className="pt-2">
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `আসসালামু আলাইকুম! আমি আরাফাত মার্টে "${title}" পণ্যের জন্য একটি উইশ সাবমিট করেছি। অনুগ্রহ করে আপডেট জানাবেন।`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{language === 'bn' ? 'হোয়াটসঅ্যাপে দ্রুত ফলো-আপ নিন' : 'Quick WhatsApp Follow-up'}</span>
                </a>
              </div>

              <div className="pt-3">
                <button
                  onClick={handleResetAndClose}
                  className="px-6 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold cursor-pointer"
                >
                  {language === 'bn' ? 'ঠিক আছে' : 'Close'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Wish Product Title */}
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  {language === 'bn' ? 'পণ্যের নাম / উইশের বিবরণ *' : 'Product Name / Wish Title *'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={language === 'bn' ? 'যেমন: ওয়াটারপ্রুফ ব্লুটুথ স্মার্টওয়াচ' : 'e.g. Waterproof Smartwatch'}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Category & Budget row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                    {language === 'bn' ? 'ক্যাটাগরি' : 'Category'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <Tag className="w-4 h-4" />
                    </div>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="fashion">{language === 'bn' ? 'ফ্যাশন ও পোশাক' : 'Fashion & Apparel'}</option>
                      <option value="gadgets">{language === 'bn' ? 'প্রযুক্তি ও গ্যাজেটস' : 'Tech & Gadgets'}</option>
                      <option value="home-kitchen">{language === 'bn' ? 'হোম ও কিচেন' : 'Home & Kitchen'}</option>
                      <option value="beauty-care">{language === 'bn' ? 'সৌন্দর্য ও যত্ন' : 'Beauty & Wellness'}</option>
                      <option value="other">{language === 'bn' ? 'অন্যান্য পণ্য' : 'Other Products'}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                    {language === 'bn' ? 'প্রত্যাশিত বাজেট (ঐচ্ছিক)' : 'Target Budget (Optional)'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={expectedPrice}
                      onChange={(e) => setExpectedPrice(e.target.value)}
                      placeholder={language === 'bn' ? 'যেমন: ১,৫০০ টাকা' : 'e.g. ৳1,500'}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Description & specifications */}
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  {language === 'bn' ? 'বিস্তারিত বিবরণ ও বৈশিষ্ট্য *' : 'Detailed Specifications *'}
                </label>
                <div className="relative">
                  <div className="absolute top-2.5 left-3 text-stone-400 pointer-events-none">
                    <FileText className="w-4 h-4" />
                  </div>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={
                      language === 'bn'
                        ? 'পণ্যটির রঙ, সাইজ, মডেল বা বিশেষ কোনো বৈশিষ্ট্য থাকলে লিখুন...'
                        : 'Describe color, size, preferred brand or exact specifications...'
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                </div>
              </div>

              {/* Reference Link */}
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                  {language === 'bn' ? 'রেফারেন্স লিংক বা ছবির লিংক (ঐচ্ছিক)' : 'Reference URL or Sample Link (Optional)'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={referenceUrl}
                    onChange={(e) => setReferenceUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-3">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  {language === 'bn' ? 'যোগাযোগের তথ্য (আমরা আপনাকে জানাব)' : 'Contact Info (We will notify you)'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                      {language === 'bn' ? 'আপনার নাম *' : 'Your Name *'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder={language === 'bn' ? 'আপনার নাম' : 'Full Name'}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 mb-1">
                      {language === 'bn' ? 'মোবাইল নম্বর *' : 'Phone Number *'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="01700-000000"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl font-extrabold text-xs text-white bg-gradient-to-r from-stone-900 to-stone-800 hover:from-black hover:to-stone-900 dark:from-amber-500 dark:to-amber-600 dark:hover:from-amber-600 dark:hover:to-amber-700 dark:text-stone-950 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>{language === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...'}</span>
                    </span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{language === 'bn' ? 'উইশ সরাসরি অ্যাডমিনকে পাঠান' : 'Submit Wish to Admin'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
