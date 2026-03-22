// ──────────────────────────────────────────────
// auth.model.ts
// ──────────────────────────────────────────────
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

// ──────────────────────────────────────────────
// book.model.ts
// ──────────────────────────────────────────────
export interface Book {
  id?: number;
  isbn: string;
  title: string;
  author: string;
  publisher?: string;
  publishDate?: string;
  genre?: string;
  description?: string;
  totalCopies: number;
  availableCopies?: number;
  coverImageUrl?: string;
  price?: number;
  pages?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ──────────────────────────────────────────────
// member.model.ts
// ──────────────────────────────────────────────
export interface Member {
  id?: number;
  membershipNumber?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  membershipStartDate?: string;
  membershipExpiryDate?: string;
  membershipType: string;
  status?: string;
  maxBorrowLimit?: number;
  createdAt?: string;
}

// ──────────────────────────────────────────────
// borrowing.model.ts
// ──────────────────────────────────────────────
export interface Borrowing {
  id?: number;
  memberId: number;
  memberName?: string;
  membershipNumber?: string;
  bookId: number;
  bookTitle?: string;
  bookIsbn?: string;
  borrowDate?: string;
  dueDate?: string;
  returnDate?: string;
  status?: string;
  fineAmount?: number;
  finePaid?: boolean;
  renewalCount?: number;
  notes?: string;
  overdue?: boolean;
  createdAt?: string;
}

export interface BorrowRequest {
  memberId: number;
  bookId: number;
}

// ──────────────────────────────────────────────
// paged-response.model.ts
// ──────────────────────────────────────────────
export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

// ──────────────────────────────────────────────
// dashboard.model.ts
// ──────────────────────────────────────────────
export interface DashboardStats {
  totalBooks: number;
  availableBooks: number;
  booksWithNoCopies: number;
  totalMembers: number;
  activeMembers: number;
  expiredMemberships: number;
  activeBorrowings: number;
  overdueBorrowings: number;
}
