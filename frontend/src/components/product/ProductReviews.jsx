import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle2, ThumbsUp, Flag, ChevronDown, User, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

// Mock Review Data (Backend Ready)
const MOCK_REVIEWS = [
  {
    reviewId: 'rev-1',
    productId: '1',
    userId: 'u-101',
    userName: 'John Smith',
    userAvatar: null,
    verifiedPurchase: true,
    rating: 5,
    title: 'Amazing quality',
    review: 'Very comfortable and premium. The materials used are exceptional, and it exceeded my expectations in every way. Highly recommended!',
    helpfulCount: 24,
    createdAt: '2026-08-01T10:30:00Z'
  },
  {
    reviewId: 'rev-2',
    productId: '1',
    userId: 'u-102',
    userName: 'Emily Davis',
    userAvatar: null,
    verifiedPurchase: true,
    rating: 4,
    title: 'Great but slightly heavy',
    review: 'I love the design and build quality, but it feels a bit heavier than I anticipated. Still a fantastic product overall.',
    helpfulCount: 8,
    createdAt: '2026-08-05T14:15:00Z'
  }
];

// Review Form Validation Schema
const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  title: z.string().min(1, "Review title is required").max(100, "Title is too long"),
  review: z.string().min(10, "Please describe your experience (min 10 characters)").max(1000, "Review is too long")
});

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [sortBy, setSortBy] = useState('Most Recent');
  const [isHoveringStar, setIsHoveringStar] = useState(0);
  
  // Mock Auth/Purchase State (Will be replaced by Auth/Order Service)
  const isLoggedIn = true;
  const hasPurchased = true;

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, title: '', review: '' }
  });

  const watchRating = watch('rating');
  const watchReviewText = watch('review');

  const onSubmit = async (data) => {
    try {
      // Mock API Call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newReview = {
        reviewId: `rev-${Math.random()}`,
        productId,
        userId: 'u-me',
        userName: 'Current User', // Mock current user
        userAvatar: null,
        verifiedPurchase: true,
        rating: data.rating,
        title: data.title,
        review: data.review,
        helpfulCount: 0,
        createdAt: new Date().toISOString()
      };
      
      setReviews([newReview, ...reviews]);
      reset();
      toast.success("Review submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit review");
    }
  };

  // Calculate Stats
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) : 0;
  
  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => r.rating === stars).length;
    return { stars, percentage: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0 };
  });

  return (
    <div className="py-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* --- LEFT: RATINGS SUMMARY & FORM --- */}
        <div className="w-full lg:w-1/3 space-y-8">
          
          {/* Summary Card */}
          <Card glass className="p-6">
            <h3 className="text-xl font-bold text-white mb-6">Customer Reviews</h3>
            
            <div className="flex items-center gap-4 mb-8">
              <h4 className="text-6xl font-extrabold text-white">{averageRating}</h4>
              <div className="flex flex-col">
                <div className="flex text-cyan-400 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.round(averageRating) ? 'fill-cyan-400' : 'text-white/20'}`} />
                  ))}
                </div>
                <span className="text-sm text-white/50">{totalReviews} Reviews</span>
              </div>
            </div>

            <div className="space-y-3">
              {ratingDistribution.map((dist, i) => (
                <div key={dist.stars} className="flex items-center gap-4 text-sm">
                  <div className="w-16 flex items-center text-white/80 font-medium">
                    {dist.stars} <Star className="w-3 h-3 ml-1 fill-white/80" />
                  </div>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${dist.percentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
                      className="h-full bg-cyan-400 rounded-full"
                    />
                  </div>
                  <div className="w-10 text-right text-white/50 text-xs">{dist.percentage}%</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Review Submission Area */}
          <Card glass={false} className="p-6 bg-[#121b22] border-white/5">
            <h3 className="text-lg font-bold text-white mb-4">Write a Review</h3>
            
            {!isLoggedIn ? (
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center space-y-3">
                <AlertCircle className="w-6 h-6 text-cyan-400 mx-auto" />
                <p className="text-sm text-white/70">Please log in to write a review.</p>
                <Button size="sm" variant="outline">Sign In</Button>
              </div>
            ) : !hasPurchased ? (
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-6 h-6 text-white/40 mx-auto mb-2" />
                <p className="text-sm text-white font-medium">Only verified purchasers can write a review.</p>
                <p className="text-xs text-white/50">Purchase this product to share your experience.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                
                {/* Interactive Star Rating */}
                <div>
                  <label className="text-sm font-semibold text-white/80 block mb-2">Overall Rating *</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <motion.button
                        key={star}
                        type="button"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onMouseEnter={() => setIsHoveringStar(star)}
                        onMouseLeave={() => setIsHoveringStar(0)}
                        onClick={() => setValue('rating', star, { shouldValidate: true })}
                        className="focus:outline-none"
                      >
                        <Star className={`w-8 h-8 transition-colors ${
                          star <= (isHoveringStar || watchRating) 
                            ? 'text-cyan-400 fill-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]' 
                            : 'text-white/20'
                        }`} />
                      </motion.button>
                    ))}
                  </div>
                  {errors.rating && <p className="text-red-400 text-xs mt-2 font-medium">❌ {errors.rating.message}</p>}
                </div>

                <Input 
                  label="Review Title *" 
                  placeholder="Summarize your experience" 
                  {...register('title')} 
                  error={errors.title ? `❌ ${errors.title.message}` : null}
                />

                <div>
                  <label className="text-sm font-semibold text-white/80 block mb-1.5">Review Description *</label>
                  <textarea 
                    {...register('review')}
                    rows={4}
                    className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 placeholder:text-white/30 resize-none ${errors.review ? 'border-red-500/50' : 'border-white/10'}`}
                    placeholder="What did you like or dislike? What should other shoppers know?"
                  />
                  <div className="flex justify-between mt-2 text-xs">
                    {errors.review ? (
                      <span className="text-red-400 font-medium">❌ {errors.review.message}</span>
                    ) : (
                      <span className="text-white/40">Be detailed and helpful.</span>
                    )}
                    <span className={watchReviewText?.length > 1000 ? 'text-red-400' : 'text-white/40'}>
                      {watchReviewText?.length || 0}/1000
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="ghost" className="flex-1" onClick={() => reset()}>Cancel</Button>
                  <Button type="submit" variant="gradient" className="flex-1" isLoading={isSubmitting}>Submit Review</Button>
                </div>
              </form>
            )}
          </Card>
        </div>

        {/* --- RIGHT: REVIEWS FEED --- */}
        <div className="w-full lg:w-2/3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-xl font-bold text-white">Showing {totalReviews} Reviews</h3>
            
            <div className="relative">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 rounded-full border border-white/10 bg-white/5 pl-4 pr-10 text-sm text-white appearance-none focus:outline-none focus:border-cyan-400"
              >
                <option className="bg-[#121b22]">Most Recent</option>
                <option className="bg-[#121b22]">Highest Rating</option>
                <option className="bg-[#121b22]">Lowest Rating</option>
                <option className="bg-[#121b22]">Most Helpful</option>
              </select>
              <ChevronDown className="w-4 h-4 text-white/40 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-6">
            <AnimatePresence>
              {reviews.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl"
                >
                  <Star className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">No reviews yet. Be the first to share your experience!</p>
                </motion.div>
              ) : (
                reviews.map((review, idx) => (
                  <motion.div
                    key={review.reviewId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card glass={false} className="p-6 bg-[#121b22] border-white/5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                            {review.userAvatar ? <img src={review.userAvatar} className="w-full h-full rounded-full object-cover" /> : <User className="w-6 h-6" />}
                          </div>
                          <div>
                            <h5 className="font-bold text-white text-base">{review.userName}</h5>
                            <div className="flex items-center gap-3 mt-1">
                              {review.verifiedPurchase && (
                                <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded-full border border-teal-400/20">
                                  <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                                </span>
                              )}
                              <span className="text-xs text-white/40">
                                {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-cyan-400 fill-cyan-400' : 'text-white/10'}`} />
                        ))}
                      </div>

                      <h6 className="font-bold text-white text-lg mb-2">{review.title}</h6>
                      <p className="text-white/70 text-sm leading-relaxed mb-6 whitespace-pre-wrap">{review.review}</p>

                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <button className="flex items-center gap-2 text-white/50 hover:text-cyan-400 transition-colors border border-white/10 hover:border-cyan-400/50 bg-white/5 px-3 py-1.5 rounded-full">
                          <ThumbsUp className="w-4 h-4" /> Helpful ({review.helpfulCount})
                        </button>
                        <button className="flex items-center gap-2 text-white/40 hover:text-red-400 transition-colors">
                          <Flag className="w-4 h-4" /> Report
                        </button>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
