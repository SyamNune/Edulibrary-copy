import { User, Book, Review, Role, DB, LoginLog } from '../types';

const DB_KEY = 'edu_resource_db_v4'; // Increment version to ensure clean state without fake reviews

const createSeedData = (): DB => {
  const books: Book[] = [
    {
      id: 'b-1',
      title: 'Introduction to Algorithms',
      author: 'Thomas H. Cormen',
      category: 'Computer Science',
      description: 'Comprehensive guide to algorithms for students and professionals.',
      pdfUrl: '#',
      uploadedAt: new Date().toISOString()
    },
    {
      id: 'b-2',
      title: 'Organic Chemistry',
      author: 'Paula Yurkanis Bruice',
      category: 'Science',
      description: 'Essential principles of organic chemistry.',
      pdfUrl: '#',
      uploadedAt: new Date().toISOString()
    },
    {
      id: 'b-3',
      title: 'Macroeconomics',
      author: 'N. Gregory Mankiw',
      category: 'Economics',
      description: 'Principles of macroeconomics covering fiscal policy.',
      pdfUrl: '#',
      uploadedAt: new Date().toISOString()
    }
  ];

  const users: User[] = [];
  const reviews: Review[] = [];
  const loginLogs: LoginLog[] = [];

  // Generate 15 users for admin demo purposes
  for (let i = 1; i <= 15; i++) {
    const userId = `u-${i}`;
    const username = `student${i}`;
    const lastLogin = new Date(Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000)).toISOString();
    
    users.push({
      id: userId,
      username: username,
      role: Role.USER,
      lastLogin: lastLogin
    });

    // Generate a historical login log for this user
    loginLogs.push({
      id: `log-${Date.now()}-${i}`,
      username: username,
      role: Role.USER,
      timestamp: lastLogin
    });
  }

  // NOTE: We do not generate fake reviews anymore to ensure data integrity and prevent "fake" entries from appearing.
  // The reviews array starts empty.

  return { users, books, reviews, loginLogs };
};

// Initial Seed Data
const seedData = createSeedData();

const getDB = (): DB => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    localStorage.setItem(DB_KEY, JSON.stringify(seedData));
    return seedData;
  }
  try {
    const parsed = JSON.parse(data);
    
    // Validate structure to prevent crash, but try to preserve what we can
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid DB structure');
    }

    // Ensure all arrays exist even if empty (migration safety)
    if (!parsed.users) parsed.users = seedData.users;
    if (!parsed.books) parsed.books = seedData.books;
    if (!parsed.reviews) parsed.reviews = [];
    if (!parsed.loginLogs) parsed.loginLogs = [];

    return parsed;
  } catch (e) {
    console.error("Database corrupted, resetting to seed data.", e);
    // In a real app, we might try to backup the corrupted string before overwriting
    localStorage.setItem(DB_KEY, JSON.stringify(seedData));
    return seedData;
  }
};

const saveDB = (db: DB): boolean => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return true;
  } catch (e) {
    console.error("Storage full or error saving DB", e);
    // Attempt to clear some logs if space is tight? 
    // For now, just alert.
    return false;
  }
};

export const api = {
  // Books
  getBooks: async (): Promise<Book[]> => {
    return new Promise((resolve) => {
      const db = getDB();
      setTimeout(() => resolve(db.books || []), 300);
    });
  },
  addBook: async (book: Omit<Book, 'id' | 'uploadedAt'>): Promise<Book> => {
    return new Promise((resolve, reject) => {
      const db = getDB();
      if (!db.books) db.books = [];
      
      const newBook: Book = {
        ...book,
        id: `b-${Date.now()}`,
        uploadedAt: new Date().toISOString()
      };
      db.books.push(newBook);
      
      if (saveDB(db)) {
        setTimeout(() => resolve(newBook), 300);
      } else {
        reject(new Error("Failed to save book. Storage limit likely reached."));
      }
    });
  },

  // Users
  getUsers: async (): Promise<User[]> => {
    return new Promise((resolve) => {
      const db = getDB();
      setTimeout(() => resolve(db.users || []), 300);
    });
  },
  
  registerUser: async (username: string): Promise<User | null> => {
    return new Promise((resolve, reject) => {
      const db = getDB();
      if (!db.users) db.users = [];
      
      if (db.users.find(u => u.username === username)) {
        reject(new Error('Username already exists'));
        return;
      }
      const newUser: User = {
        id: `u-${Date.now()}`,
        username,
        role: Role.USER,
        lastLogin: undefined // Hasn't logged in yet
      };
      db.users.push(newUser);
      
      if (saveDB(db)) {
        setTimeout(() => resolve(newUser), 300);
      } else {
        reject(new Error("Failed to register user. Storage issue."));
      }
    });
  },

  // Record Login (Updates user status AND adds to history log)
  recordLogin: async (username: string, role: Role) => {
    return new Promise<void>((resolve) => {
      const db = getDB();
      if (!db.users) db.users = [];
      
      const now = new Date().toISOString();

      // 1. Update User Record
      const userIndex = db.users.findIndex(u => u.username === username);
      if (userIndex !== -1) {
        db.users[userIndex].lastLogin = now;
      }

      // 2. Add to History Log
      if (!db.loginLogs) db.loginLogs = [];
      db.loginLogs.push({
        id: `log-${Date.now()}`,
        username,
        role,
        timestamp: now
      });

      saveDB(db); 
      setTimeout(resolve, 200);
    });
  },

  getLoginLogs: async (): Promise<LoginLog[]> => {
    return new Promise((resolve) => {
      const db = getDB();
      const logs = db.loginLogs || [];
      setTimeout(() => resolve(logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())), 300);
    });
  },

  // Reviews
  getReviews: async (): Promise<Review[]> => {
    return new Promise((resolve) => {
      const db = getDB();
      // Safe access and sort
      const reviews = (db.reviews || []).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setTimeout(() => resolve(reviews), 300);
    });
  },
  
  addReview: async (review: Omit<Review, 'id' | 'timestamp'>): Promise<Review> => {
    return new Promise((resolve, reject) => {
      const db = getDB();
      if (!db.reviews) db.reviews = [];
      
      // Prevent Duplicate Entries
      // Check if the same user submitted the same comment for the same book
      const isDuplicate = db.reviews.some(r => 
        r.userId === review.userId && 
        r.bookId === review.bookId && 
        r.comment.trim() === review.comment.trim()
      );

      if (isDuplicate) {
        reject(new Error("You have already submitted this feedback."));
        return;
      }
      
      const newReview: Review = {
        ...review,
        id: `r-${Date.now()}`,
        timestamp: new Date().toISOString()
      };
      
      // Add to beginning of array
      db.reviews.unshift(newReview); 
      
      if (saveDB(db)) {
        setTimeout(() => resolve(newReview), 300);
      } else {
        reject(new Error("Failed to save review. Storage limit reached."));
      }
    });
  }
};
