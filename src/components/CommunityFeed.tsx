/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import {
  Heart,
  MessageCircle,
  Share2,
  Image as ImageIcon,
  Send,
  Trash2,
  ExternalLink,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
  Info,
  CheckCircle,
  Copy,
  User as UserIcon,
  Calendar,
  X,
  Flame,
  Clock,
  Camera,
  Edit3,
  ThumbsUp,
  MessageSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FeedPost, FeedComment, CommunityProfile } from '../types';
import {
  createFeedPostInFirestore,
  toggleLikeFeedPostInFirestore,
  subscribePostComments,
  addFeedCommentInFirestore,
  deleteFeedPostFromFirestore,
  deleteFeedCommentFromFirestore,
  getCommunityProfileFromFirestore,
  saveCommunityProfileToFirestore,
} from '../services/firestoreService';

interface CommunityFeedProps {
  currentUser: User | null;
  posts: FeedPost[];
  language?: 'bn' | 'en';
  onBackToStore: () => void;
  onOpenAuth: () => void;
  adminEmail?: string;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  currentUser,
  posts,
  language = 'bn',
  onBackToStore,
  onOpenAuth,
  adminEmail = 'bdhecker34@gmail.com',
}) => {
  // Post Creation States
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [postError, setPostError] = useState('');
  const [postSuccess, setPostSuccess] = useState(false);
  const [showPostimagesGuide, setShowPostimagesGuide] = useState(false);

  // Active Filter: 'latest' | 'photos' | 'popular'
  const [activeFilter, setActiveFilter] = useState<'latest' | 'photos' | 'popular'>('latest');

  // Comment Drawer / Open Comments per post ID
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);

  // Profile Modal (for any visited user)
  const [viewingProfileUserId, setViewingProfileUserId] = useState<string | null>(null);
  const [visitedProfile, setVisitedProfile] = useState<CommunityProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Profile Edit Modal (for current logged-in user)
  const [isEditingOwnProfile, setIsEditingOwnProfile] = useState(false);
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editDisplayName, setEditDisplayName] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Image Lightbox
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Share Notification Toast
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  // Current User's Profile State
  const [myProfile, setMyProfile] = useState<CommunityProfile | null>(null);

  const isAdmin = currentUser?.email?.toLowerCase().trim() === adminEmail.toLowerCase().trim();

  // Load current user's profile
  useEffect(() => {
    if (currentUser?.uid) {
      getCommunityProfileFromFirestore(currentUser.uid).then((prof) => {
        if (prof) {
          setMyProfile(prof);
        } else {
          // Initialize fallback
          setMyProfile({
            userId: currentUser.uid,
            displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
            avatarUrl: currentUser.photoURL || '',
          });
        }
      });
    } else {
      setMyProfile(null);
    }
  }, [currentUser]);

  // Load visited profile when viewingProfileUserId changes
  useEffect(() => {
    if (!viewingProfileUserId) {
      setVisitedProfile(null);
      return;
    }
    setIsLoadingProfile(true);
    getCommunityProfileFromFirestore(viewingProfileUserId)
      .then((prof) => {
        if (prof) {
          setVisitedProfile(prof);
        } else {
          // Try to get info from existing post author
          const found = posts.find((p) => p.authorId === viewingProfileUserId);
          setVisitedProfile({
            userId: viewingProfileUserId,
            displayName: found ? found.authorName : 'Easy Mart Member',
            avatarUrl: found ? found.authorAvatar : '',
          });
        }
      })
      .finally(() => setIsLoadingProfile(false));
  }, [viewingProfileUserId, posts]);

  // Sort & Filter Posts
  const filteredPosts = useMemo(() => {
    let list = [...posts];
    if (activeFilter === 'photos') {
      list = list.filter((p) => Boolean(p.imageUrl && p.imageUrl.trim().length > 0));
    } else if (activeFilter === 'popular') {
      list.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    }
    return list;
  }, [posts, activeFilter]);

  // Validate Postimages.org URL or general image URL
  const validateImageUrl = (url: string) => {
    if (!url) return true;
    const trimmed = url.trim().toLowerCase();
    // Allow postimages domain links or direct image file extensions
    const isPostimages =
      trimmed.includes('postimg.cc') ||
      trimmed.includes('postimages.org') ||
      trimmed.includes('i.postimg.cc');
    const isStandardImage = /\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i.test(trimmed);
    return isPostimages || isStandardImage;
  };

  // Handle Post Creation
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!caption.trim() && !imageUrl.trim()) {
      setPostError(language === 'bn' ? 'দয়া করে কিছু লিখুন অথবা ছবির লিংক দিন।' : 'Please enter a caption or image link.');
      return;
    }

    if (imageUrl.trim() && !validateImageUrl(imageUrl)) {
      setPostError(
        language === 'bn'
          ? 'ছবি শুধুমাত্র https://postimages.org/ থেকে শেয়ার করা যাবে। দয়া করে সঠিক লিংক দিন।'
          : 'Images can only be linked from https://postimages.org/. Please provide a valid link.'
      );
      return;
    }

    setIsSubmittingPost(true);
    setPostError('');

    const authorDisplayName =
      myProfile?.displayName || currentUser.displayName || currentUser.email?.split('@')[0] || 'Community Member';
    const authorAvatar = myProfile?.avatarUrl || currentUser.photoURL || '';

    const res = await createFeedPostInFirestore({
      authorId: currentUser.uid,
      authorName: authorDisplayName,
      authorAvatar: authorAvatar,
      caption: caption.trim(),
      imageUrl: imageUrl.trim() || undefined,
    });

    setIsSubmittingPost(false);

    if (res.success) {
      setCaption('');
      setImageUrl('');
      setPostSuccess(true);
      setTimeout(() => setPostSuccess(false), 3500);
    } else {
      setPostError(res.error || 'Failed to submit post');
    }
  };

  // Handle Likes
  const handleToggleLike = async (post: FeedPost) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const isLiked = post.likes?.includes(currentUser.uid) || false;
    await toggleLikeFeedPostInFirestore(post.id, currentUser.uid, isLiked);
  };

  // Handle Post Share
  const handleSharePost = async (post: FeedPost) => {
    const shareUrl = `${window.location.origin}?post=${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Easy Mart Community - Post by ${post.authorName}`,
          text: post.caption.slice(0, 80) + '...',
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(shareUrl);
    setCopiedPostId(post.id);
    setTimeout(() => setCopiedPostId(null), 2500);
  };

  // Handle Post Deletion (Author or Admin)
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিত যে এই পোস্টটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this post?')) {
      return;
    }
    await deleteFeedPostFromFirestore(postId);
    if (openCommentsPostId === postId) {
      setOpenCommentsPostId(null);
    }
  };

  // Save User Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (editAvatarUrl.trim() && !validateImageUrl(editAvatarUrl)) {
      alert(language === 'bn' ? 'প্রোফাইল ছবি অবশ্যই https://postimages.org/ থেকে লিংক হতে হবে।' : 'Profile avatar must be linked from https://postimages.org/');
      return;
    }

    setIsSavingProfile(true);
    const updated: CommunityProfile = {
      userId: currentUser.uid,
      displayName: editDisplayName.trim() || myProfile?.displayName || 'User',
      avatarUrl: editAvatarUrl.trim(),
      bio: editBio.trim(),
      joinedAt: myProfile?.joinedAt || new Date().toISOString(),
    };

    const ok = await saveCommunityProfileToFirestore(updated);
    setIsSavingProfile(false);

    if (ok) {
      setMyProfile(updated);
      setProfileSuccessMsg(language === 'bn' ? 'প্রোফাইল সফলভাবে আপডেট হয়েছে!' : 'Profile updated successfully!');
      setTimeout(() => {
        setProfileSuccessMsg('');
        setIsEditingOwnProfile(false);
      }, 1500);
    }
  };

  const openEditProfileModal = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    setEditDisplayName(myProfile?.displayName || currentUser.displayName || '');
    setEditAvatarUrl(myProfile?.avatarUrl || '');
    setEditBio(myProfile?.bio || '');
    setIsEditingOwnProfile(true);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans pb-24">
      {/* Facebook-style Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          {/* Back & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStore}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs transition-colors cursor-pointer"
              title={language === 'bn' ? 'শপে ফিরে যান' : 'Back to Store'}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'bn' ? 'মার্কেটপ্লেসে ফিরুন' : 'Back to Shop'}</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-black text-xl shadow-xs">
                f
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight leading-tight text-stone-900 dark:text-white flex items-center gap-1.5">
                  <span>Easy Mart Feed</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-[#1877F2] font-bold">
                    কমিউনিটি
                  </span>
                </h1>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {language === 'bn' ? 'পোস্ট করুন, লাইক ও মতামত দিন' : 'Share stories, photos & connect'}
                </p>
              </div>
            </div>
          </div>

          {/* Right: User Profile or Login */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewingProfileUserId(currentUser.uid)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer border border-stone-200 dark:border-stone-700"
                  title={language === 'bn' ? 'আমার প্রোফাইল দেখুন' : 'View My Profile'}
                >
                  <img
                    src={
                      myProfile?.avatarUrl ||
                      currentUser.photoURL ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                    }
                    alt={currentUser.displayName || 'Avatar'}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-amber-400"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80';
                    }}
                  />
                  <span className="hidden md:inline font-bold text-xs max-w-[120px] truncate">
                    {myProfile?.displayName || currentUser.displayName || 'আমার প্রোফাইল'}
                  </span>
                </button>

                <button
                  onClick={openEditProfileModal}
                  className="p-2 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
                  title={language === 'bn' ? 'ছবি ও প্রোফাইল এডিট' : 'Edit Avatar & Profile'}
                >
                  <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'লগইন / সাইন আপ' : 'Login / Sign Up'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Feed Container */}
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-5 space-y-4">
        {/* Postimages.org Instruction Banner */}
        <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-200 dark:border-blue-900/40 rounded-2xl p-3.5 flex items-start justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs mt-0.5">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xs font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                <span>{language === 'bn' ? 'ফটো আপলোড নিয়মাবলী (পোস্টইমেজ)' : 'Photo Upload via postimages.org'}</span>
                <span className="text-[10px] bg-blue-600 text-white font-black px-1.5 py-0.2 rounded">
                  শুধুমাত্র লিংক
                </span>
              </h2>
              <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                {language === 'bn'
                  ? 'ছবি আপলোড করতে '
                  : 'To share photos, visit '}
                <a
                  href="https://postimages.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 font-bold underline inline-flex items-center gap-0.5"
                >
                  postimages.org <ExternalLink className="w-2.5 h-2.5 inline" />
                </a>
                {language === 'bn'
                  ? ' তে ছবি আপলোড করে полученный "Direct link" এখানে শেয়ার করুন।'
                  : ' to upload your photo, then copy and paste the "Direct link" below.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPostimagesGuide(!showPostimagesGuide)}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0 p-1 cursor-pointer flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === 'bn' ? 'সহায়িকা' : 'Guide'}</span>
          </button>
        </div>

        {/* Expandable Postimages Help Modal/Drawer */}
        <AnimatePresence>
          {showPostimagesGuide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>{language === 'bn' ? '৩টি ধাপে ছবি পোস্ট করুন:' : '3 Easy Steps to Share Photos:'}</span>
                </h3>
                <button
                  onClick={() => setShowPostimagesGuide(false)}
                  className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
                  <div className="font-extrabold text-blue-600 mb-1">ধাপ ১: ভিজিট করুন</div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400">
                    <a
                      href="https://postimages.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-bold underline"
                    >
                      postimages.org
                    </a>{' '}
                    ওয়েবসাইটে যান এবং ছবি সিলেক্ট করুন।
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
                  <div className="font-extrabold text-blue-600 mb-1">ধাপ ২: লিংক কপি করুন</div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400">
                    আপলোড শেষ হলে <strong>"Direct link"</strong> (যেমন: <code className="text-amber-600">i.postimg.cc/...</code>) অপশনটি কপি করুন।
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
                  <div className="font-extrabold text-blue-600 mb-1">ধাপ ৩: পেস্ট করুন</div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400">
                    নিচের পোস্ট বক্সে লিংকটি পেস্ট করলেই সাথে সাথে ছবির প্রিভিউ চলে আসবে!
                  </p>
                </div>
              </div>

              <div className="text-center pt-1">
                <a
                  href="https://postimages.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  <span>postimages.org নতুন ট্যাবে খুলুন</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Facebook-style Create Post Card */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xs border border-stone-200/80 dark:border-stone-800 p-4 space-y-3">
          {currentUser ? (
            <form onSubmit={handleCreatePost} className="space-y-3">
              <div className="flex items-start gap-3">
                <img
                  src={
                    myProfile?.avatarUrl ||
                    currentUser.photoURL ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                  }
                  alt={currentUser.displayName || 'Avatar'}
                  className="w-10 h-10 rounded-full object-cover border border-amber-400 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="flex-1 space-y-2">
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder={
                      language === 'bn'
                        ? `আপনার মনে কী চলছে, ${myProfile?.displayName || currentUser.displayName || 'বন্ধু'}?`
                        : `What's on your mind, ${myProfile?.displayName || currentUser.displayName || 'friend'}?`
                    }
                    rows={3}
                    className="w-full text-sm bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-stone-900 dark:text-white placeholder-stone-400 resize-none"
                  />

                  {/* Image URL input from postimages.org */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <ImageIcon className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                        <input
                          type="url"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://postimages.org/ থেকে ছবির লিংক পেস্ট করুন..."
                          className="w-full text-xs pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-stone-900 dark:text-white placeholder-stone-400"
                        />
                      </div>
                      <a
                        href="https://postimages.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-[#1877F2] dark:text-blue-400 font-bold text-xs flex items-center gap-1 shrink-0 border border-blue-200 dark:border-blue-900/60"
                        title="Upload on postimages.org"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Upload Image</span>
                      </a>
                    </div>
                  </div>

                  {/* Image Live Preview */}
                  {imageUrl.trim() && (
                    <div className="relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 max-h-60 bg-stone-100 dark:bg-stone-800 flex items-center justify-center group">
                      <img
                        src={imageUrl.trim()}
                        alt="Preview"
                        className="max-h-60 w-auto object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).alt = 'Invalid image URL from postimages';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                        title="Remove photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {postError && (
                    <div className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" />
                      <span>{postError}</span>
                    </div>
                  )}

                  {postSuccess && (
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" />
                      <span>{language === 'bn' ? 'পোস্ট সফলভাবে পাবলিশ হয়েছে!' : 'Post published successfully!'}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-stone-400">
                      {language === 'bn' ? '📷 শুধুমাত্র postimages.org লিংক অনুমোদিত' : 'Only postimages.org links allowed'}
                    </span>
                    <button
                      type="submit"
                      disabled={isSubmittingPost || (!caption.trim() && !imageUrl.trim())}
                      className="px-5 py-2 rounded-xl bg-[#1877F2] hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingPost ? 'পাবলিশ হচ্ছে...' : language === 'bn' ? 'পোস্ট করুন' : 'Post'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between gap-3 p-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-500 flex items-center justify-center font-bold">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
                    {language === 'bn' ? 'কমিউনিটিতে যুক্ত হতে সাইন আপ বা লগইন করুন' : 'Sign up or login to share your post'}
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    {language === 'bn' ? 'ছবি ও ক্যাপশন পোস্ট করুন, লাইক ও কমেন্ট দিন' : 'Share photos via postimages.org, like and comment'}
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-xs shrink-0 shadow-xs cursor-pointer"
              >
                {language === 'bn' ? 'লগইন / সাইন আপ' : 'Login / Sign Up'}
              </button>
            </div>
          )}
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 bg-white dark:bg-stone-900 rounded-xl border border-stone-200/80 dark:border-stone-800 text-xs font-bold shadow-2xs">
          <button
            onClick={() => setActiveFilter('latest')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeFilter === 'latest'
                ? 'bg-[#1877F2] text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'সব পোস্ট' : 'All Posts'}</span>
          </button>
          <button
            onClick={() => setActiveFilter('photos')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeFilter === 'photos'
                ? 'bg-[#1877F2] text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ছবিসহ পোস্ট' : 'Photos Only'}</span>
          </button>
          <button
            onClick={() => setActiveFilter('popular')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeFilter === 'popular'
                ? 'bg-[#1877F2] text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'bn' ? 'জনপ্রিয়' : 'Popular'}</span>
          </button>
        </div>

        {/* Feed Posts Stream */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-12 text-center border border-stone-200/80 dark:border-stone-800 space-y-3">
              <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1877F2] flex items-center justify-center mx-auto">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">
                {language === 'bn' ? 'এখনো কোনো পোস্ট নেই' : 'No posts yet'}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {language === 'bn'
                  ? 'প্রথম ব্যক্তি হিসেবে আপনার মতামত অথবা পছন্দের ছবি (postimages.org লিংক দিয়ে) পোস্ট করুন!'
                  : 'Be the first to share a post with your friends in Easy Mart!'}
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const isLiked = currentUser ? post.likes?.includes(currentUser.uid) : false;
              const isAuthor = currentUser?.uid === post.authorId;
              const canDelete = isAuthor || isAdmin;
              const isCommentsOpen = openCommentsPostId === post.id;

              return (
                <article
                  key={post.id}
                  className="bg-white dark:bg-stone-900 rounded-2xl shadow-xs border border-stone-200/80 dark:border-stone-800 overflow-hidden"
                >
                  {/* Post Header: Author info & options */}
                  <div className="p-4 flex items-center justify-between">
                    <div
                      onClick={() => setViewingProfileUserId(post.authorId)}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <img
                        src={
                          post.authorAvatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                        }
                        alt={post.authorName}
                        className="w-10 h-10 rounded-full object-cover border border-amber-400 group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div>
                        <div className="font-extrabold text-xs sm:text-sm text-stone-900 dark:text-stone-100 group-hover:text-[#1877F2] transition-colors flex items-center gap-1.5">
                          <span>{post.authorName}</span>
                          {post.authorId === currentUser?.uid && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-[#1877F2]">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-400 flex items-center gap-1">
                          <span>
                            {new Date(post.createdAt).toLocaleDateString('bn-BD', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>·</span>
                          <span className="text-[10px]">🌐 পাবলিক</span>
                        </div>
                      </div>
                    </div>

                    {/* Author or Admin Actions */}
                    <div className="flex items-center gap-1">
                      {canDelete && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title={language === 'bn' ? 'পোস্ট মুছে ফেলুন' : 'Delete Post'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Post Caption */}
                  {post.caption && (
                    <div className="px-4 pb-3">
                      <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 whitespace-pre-wrap leading-relaxed">
                        {post.caption}
                      </p>
                    </div>
                  )}

                  {/* Post Image (Hosted via postimages.org) */}
                  {post.imageUrl && (
                    <div
                      onClick={() => setLightboxImage(post.imageUrl || null)}
                      className="bg-black/5 dark:bg-black/40 overflow-hidden cursor-pointer max-h-[500px] flex items-center justify-center group relative"
                    >
                      <img
                        src={post.imageUrl}
                        alt="Community post image"
                        className="w-full max-h-[500px] object-cover group-hover:scale-[1.01] transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).alt = 'Image unavailable';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-3 py-1.5 rounded-full bg-black/70 text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>বড় করে দেখুন</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Likes & Comments Count Summary Strip */}
                  <div className="px-4 py-2 border-b border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[9px]">
                        👍
                      </div>
                      <span>{post.likesCount || 0} টি লাইক</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>{post.commentsCount || 0} টি মন্তব্য</span>
                    </div>
                  </div>

                  {/* Interaction Buttons: Like, Comment, Share */}
                  <div className="px-2 py-1 flex items-center justify-between text-xs font-bold text-stone-600 dark:text-stone-300">
                    <button
                      onClick={() => handleToggleLike(post)}
                      className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer ${
                        isLiked ? 'text-[#1877F2] font-black' : ''
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-[#1877F2]' : ''}`} />
                      <span>{isLiked ? (language === 'bn' ? 'লাইকড' : 'Liked') : language === 'bn' ? 'লাইক' : 'Like'}</span>
                    </button>

                    <button
                      onClick={() => setOpenCommentsPostId(isCommentsOpen ? null : post.id)}
                      className="flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{language === 'bn' ? 'মন্তব্য' : 'Comment'}</span>
                    </button>

                    <button
                      onClick={() => handleSharePost(post)}
                      className="flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer relative"
                    >
                      {copiedPostId === post.id ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span className="text-emerald-500">{language === 'bn' ? 'কপি হয়েছে' : 'Copied!'}</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4" />
                          <span>{language === 'bn' ? 'শেয়ার' : 'Share'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Expandable Comments Section */}
                  {isCommentsOpen && (
                    <PostCommentsSection
                      postId={post.id}
                      currentUser={currentUser}
                      myProfile={myProfile}
                      onOpenAuth={onOpenAuth}
                      language={language}
                      isAdmin={isAdmin}
                    />
                  )}
                </article>
              );
            })
          )}
        </div>
      </main>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Full view"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}

      {/* Facebook-style User Profile Modal */}
      {viewingProfileUserId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
            {/* Profile Cover Banner */}
            <div className="h-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 relative">
              <button
                onClick={() => setViewingProfileUserId(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="px-6 pb-6 pt-0 relative -mt-12 text-center space-y-4">
              <div className="relative inline-block">
                <img
                  src={
                    visitedProfile?.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
                  }
                  alt={visitedProfile?.displayName || 'User'}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-stone-900 shadow-md mx-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80';
                  }}
                />
              </div>

              <div>
                <h3 className="text-lg font-black text-stone-900 dark:text-white flex items-center justify-center gap-1.5">
                  <span>{visitedProfile?.displayName || 'Easy Mart Member'}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  {visitedProfile?.bio || (language === 'bn' ? 'ইজি মার্ট কমিউনিটি মেম্বার' : 'Easy Mart Community Member')}
                </p>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 gap-2 py-3 border-y border-stone-100 dark:border-stone-800 text-xs">
                <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-800">
                  <div className="font-black text-stone-900 dark:text-white text-base">
                    {posts.filter((p) => p.authorId === viewingProfileUserId).length}
                  </div>
                  <div className="text-[10px] text-stone-500">{language === 'bn' ? 'মোট পোস্ট' : 'Total Posts'}</div>
                </div>
                <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-800">
                  <div className="font-black text-[#1877F2] text-base">
                    {posts
                      .filter((p) => p.authorId === viewingProfileUserId)
                      .reduce((acc, curr) => acc + (curr.likesCount || 0), 0)}
                  </div>
                  <div className="text-[10px] text-stone-500">{language === 'bn' ? 'লাইক পেয়েছেন' : 'Likes Received'}</div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {currentUser?.uid === viewingProfileUserId && (
                  <button
                    onClick={() => {
                      setViewingProfileUserId(null);
                      openEditProfileModal();
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'প্রোফাইল এডিট' : 'Edit Profile'}</span>
                  </button>
                )}
                <button
                  onClick={() => setViewingProfileUserId(null)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Edit Modal (postimages.org avatar update) */}
      {isEditingOwnProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                  {language === 'bn' ? 'প্রোফাইল ও ছবি পরিবর্তন' : 'Update Profile & Avatar'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditingOwnProfile(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              {/* Display Name */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  {language === 'bn' ? 'ডিসপ্লে নাম' : 'Display Name'}
                </label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  placeholder="আপনার নাম লিখুন..."
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Avatar via postimages.org */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-700 dark:text-stone-300">
                    {language === 'bn' ? 'প্রোফাইল ছবির লিংক (postimages.org)' : 'Profile Photo URL (postimages.org)'}
                  </label>
                  <a
                    href="https://postimages.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-blue-600 font-bold underline flex items-center gap-0.5"
                  >
                    postimages.org <ExternalLink className="w-2.5 h-2.5 inline" />
                  </a>
                </div>
                <input
                  type="url"
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  placeholder="https://postimages.org/ থেকে ডিরেক্ট লিংক..."
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[10px] text-stone-500">
                  {language === 'bn'
                    ? 'postimages.org এ ছবি আপলোড করে "Direct link" কপি করে এখানে দিন।'
                    : 'Upload to postimages.org and paste the direct link here.'}
                </p>
              </div>

              {/* Avatar Preview */}
              {editAvatarUrl.trim() && (
                <div className="flex items-center gap-3 p-2 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                  <img
                    src={editAvatarUrl.trim()}
                    alt="Preview"
                    className="w-12 h-12 rounded-full object-cover border border-blue-500 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="text-[11px] text-stone-600 dark:text-stone-400">
                    {language === 'bn' ? 'ছবির প্রিভিউ (সঠিকভাবে দেখাচ্ছে)' : 'Avatar Preview looks great'}
                  </div>
                </div>
              )}

              {/* Bio */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  {language === 'bn' ? 'সংক্ষিপ্ত বায়ো (Bio)' : 'Bio'}
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder={language === 'bn' ? 'আপনার শখ বা পরিচয়...' : 'Tell the community about yourself...'}
                  rows={2}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {profileSuccessMsg && (
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex-1 py-2.5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{isSavingProfile ? 'সংরক্ষণ হচ্ছে...' : language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Profile'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingOwnProfile(false)}
                  className="py-2.5 px-4 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Comments Section Sub-component
 */
interface PostCommentsSectionProps {
  postId: string;
  currentUser: User | null;
  myProfile: CommunityProfile | null;
  onOpenAuth: () => void;
  language?: 'bn' | 'en';
  isAdmin?: boolean;
}

const PostCommentsSection: React.FC<PostCommentsSectionProps> = ({
  postId,
  currentUser,
  myProfile,
  onOpenAuth,
  language = 'bn',
  isAdmin = false,
}) => {
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsub = subscribePostComments(postId, (list) => {
      setComments(list);
    });
    return () => unsub();
  }, [postId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    const authorName =
      myProfile?.displayName || currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
    const authorAvatar = myProfile?.avatarUrl || currentUser.photoURL || '';

    const res = await addFeedCommentInFirestore({
      postId,
      authorId: currentUser.uid,
      authorName,
      authorAvatar,
      content: newComment.trim(),
    });

    setIsSubmitting(false);
    if (res.success) {
      setNewComment('');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm(language === 'bn' ? 'মন্তব্যটি মুছে ফেলতে চান?' : 'Delete comment?')) return;
    await deleteFeedCommentFromFirestore(commentId, postId);
  };

  return (
    <div className="p-4 bg-stone-50 dark:bg-stone-850/60 border-t border-stone-100 dark:border-stone-800 space-y-3">
      {/* Existing Comments List */}
      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <p className="text-xs text-stone-400 py-1 text-center">
            {language === 'bn' ? 'এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যটি আপনি করুন!' : 'No comments yet. Be the first to comment!'}
          </p>
        ) : (
          comments.map((comm) => {
            const canDelete = currentUser?.uid === comm.authorId || isAdmin;
            return (
              <div key={comm.id} className="flex items-start gap-2.5 group">
                <img
                  src={
                    comm.authorAvatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'
                  }
                  alt={comm.authorName}
                  className="w-7 h-7 rounded-full object-cover shrink-0 border border-stone-200 dark:border-stone-700 mt-0.5"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="flex-1 bg-white dark:bg-stone-900 rounded-2xl px-3 py-2 border border-stone-200/80 dark:border-stone-800 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[11px] text-stone-900 dark:text-stone-100">
                      {comm.authorName}
                    </span>
                    {canDelete && (
                      <button
                        onClick={() => handleDeleteComment(comm.id)}
                        className="text-stone-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-stone-700 dark:text-stone-300 whitespace-pre-wrap leading-relaxed mt-0.5">
                    {comm.content}
                  </p>
                  <span className="text-[9px] text-stone-400 mt-1 block">
                    {new Date(comm.createdAt).toLocaleDateString('bn-BD', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Write Comment Box */}
      {currentUser ? (
        <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1">
          <img
            src={
              myProfile?.avatarUrl ||
              currentUser.photoURL ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'
            }
            alt="My Avatar"
            className="w-7 h-7 rounded-full object-cover shrink-0 border border-amber-400"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80';
            }}
          />
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={language === 'bn' ? 'একটি মন্তব্য লিখুন...' : 'Write a comment...'}
            className="flex-1 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-full px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-stone-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="p-2 rounded-full bg-[#1877F2] hover:bg-blue-600 disabled:opacity-40 text-white transition-colors cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      ) : (
        <div className="text-center py-1">
          <button
            onClick={onOpenAuth}
            className="text-xs font-bold text-[#1877F2] hover:underline"
          >
            {language === 'bn' ? 'মন্তব্য করতে সাইন আপ বা লগইন করুন' : 'Sign up or login to comment'}
          </button>
        </div>
      )}
    </div>
  );
};
