import React, { useState, useEffect } from 'react';
import { api } from '../services/localStorageService';
import { useAuth } from '../context/AuthContext';
import { Review, Book } from '../types';
import { Star, MessageSquare, RefreshCw, AlertCircle } from 'lucide-react';

const Feedback: React.FC = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  
  // Form State
  const [selectedBookId, setSelectedBookId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [r, b] = await Promise.all([api.getReviews(), api.getBooks()]);
      setReviews(r);
      setBooks(b);
    } catch (err) {
      console.error("Failed to load feedback data");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setSubmitting(true);

    try {
      const newReview = await api.addReview({
        bookId: selectedBookId,
        userId: user.id,
        username: user.username,
        rating,
        comment
      });

      // Prepend the new review so it appears at the top
      setReviews(prev => [newReview, ...(prev || [])]);
      
      setComment('');
      setSelectedBookId('');
      setRating(5);
    } catch (err: any) {
      // Handle specific error messages from the service
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Community Feedback</h1>
        <p className="text-slate-500 mt-2">Share your thoughts on the materials and see what others are saying.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Feedback Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-24">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Leave a Review
            </h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Resource</label>
                <select 
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">-- Choose a book --</option>
                  {books.map(b => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                  <option value="general">General Platform Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-1 transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-slate-300'}`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What did you think?"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex justify-center items-center shadow-md shadow-blue-500/20"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Recent Reviews ({reviews.length})</h2>
            <button 
              onClick={loadData}
              className="text-slate-500 hover:text-blue-600 transition p-2 rounded-full hover:bg-blue-50"
              title="Refresh Reviews"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          
          {reviews.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
              <MessageSquare className="mx-auto h-12 w-12 text-slate-200 mb-3" />
              <p className="text-slate-500 font-medium">No reviews yet.</p>
              <p className="text-slate-400 text-sm">Be the first to share your experience!</p>
            </div>
          )}
          
          <div className="space-y-4">
            {reviews.map((review) => {
              // Defensive check for corrupted data
              if (!review) return null;

              const book = books.find(b => b.id === review.bookId);
              return (
                <div key={review.id || Math.random()} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center font-bold text-sm shadow-inner">
                        {review.username ? review.username.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{review.username || 'Anonymous'}</p>
                        <p className="text-xs text-slate-500">
                          {review.timestamp ? new Date(review.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                    <div className="flex text-yellow-400 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-100">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-slate-300'}`} />
                      ))}
                    </div>
                  </div>
                  
                  {book ? (
                    <div className="mb-3 inline-block">
                       <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                         Book: {book.title}
                       </span>
                    </div>
                  ) : review.bookId === 'general' && (
                    <div className="mb-3 inline-block">
                       <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                         Platform Feedback
                       </span>
                    </div>
                  )}
                  
                  <p className="text-slate-700 text-sm leading-relaxed">{review.comment}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
