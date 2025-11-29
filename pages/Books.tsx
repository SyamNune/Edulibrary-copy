import React, { useEffect, useState } from 'react';
import { api } from '../services/localStorageService';
import { getBookInsight } from '../services/geminiService';
import { Book } from '../types';
import { Search, Download, Sparkles, X, BookOpen } from 'lucide-react';

const Books: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [aiInsight, setAiInsight] = useState('');
  const [insightLoading, setInsightLoading] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      const data = await api.getBooks();
      setBooks(data);
      setFilteredBooks(data);
      setLoading(false);
    };
    fetchBooks();
  }, []);

  useEffect(() => {
    const results = books.filter(book => 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBooks(results);
  }, [searchTerm, books]);

  const handleAskAI = async (book: Book) => {
    setSelectedBook(book);
    setInsightLoading(true);
    setAiInsight('');
    
    const insight = await getBookInsight(book.title, book.author);
    setAiInsight(insight);
    setInsightLoading(false);
  };

  const closeAIModal = () => {
    setSelectedBook(null);
    setAiInsight('');
  };

  const handleDownload = (book: Book) => {
    if (book.pdfUrl && book.pdfUrl !== '#' && book.pdfUrl.startsWith('data:')) {
       // Create a temporary link to download the file
       const link = document.createElement('a');
       link.href = book.pdfUrl;
       link.download = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
    } else {
       alert("No readable PDF file available for this book (This might be mock data).");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Library Collection</h1>
          <p className="text-slate-500">Browse and download educational resources.</p>
        </div>
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
            placeholder="Search by title, author, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <div key={book.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="h-48 bg-slate-100 rounded-t-xl flex items-center justify-center border-b border-slate-100">
                 <BookOpen className="h-16 w-16 text-slate-300" />
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <div className="mb-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    {book.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{book.title}</h3>
                <p className="text-sm text-slate-600 mb-4">by {book.author}</p>
                <p className="text-sm text-slate-500 mb-6 line-clamp-2 flex-grow">{book.description}</p>
                
                <div className="flex gap-2 mt-auto">
                  <button 
                    onClick={() => handleDownload(book)}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button 
                    onClick={() => handleAskAI(book)}
                    className="flex items-center justify-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg text-sm font-medium transition"
                    title="Get AI Summary"
                  >
                    <Sparkles className="w-4 h-4" /> AI
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
          <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-slate-500 text-lg">No books found matching your search.</p>
        </div>
      )}

      {/* AI Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex justify-between items-start">
              <div className="text-white">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  AI Insight
                </h3>
                <p className="text-indigo-100 text-sm mt-1">Analyzing "{selectedBook.title}"</p>
              </div>
              <button onClick={closeAIModal} className="text-white/80 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {insightLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-full"></div>
                  <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                  <p className="text-center text-sm text-slate-400 mt-4">Consulting Gemini...</p>
                </div>
              ) : (
                <div className="prose prose-sm prose-slate text-slate-700 leading-relaxed">
                   <div dangerouslySetInnerHTML={{ __html: aiInsight.replace(/\n/g, '<br />') }} />
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
              <button 
                onClick={closeAIModal}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;