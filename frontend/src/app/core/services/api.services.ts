import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book, Member, Borrowing, BorrowRequest, PagedResponse, DashboardStats } from '../models/models';
import { environment } from '../../../environments/environment';

// ─── Book Service ────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class BookService {
  private url = `${environment.apiUrl}/books`;
  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 10, sortBy = 'title', sortDir = 'asc'): Observable<PagedResponse<Book>> {
    const params = new HttpParams()
      .set('page', page).set('size', size).set('sortBy', sortBy).set('sortDir', sortDir);
    return this.http.get<PagedResponse<Book>>(this.url, { params });
  }

  search(search: string, genre?: string, status?: string, page = 0, size = 10): Observable<PagedResponse<Book>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    if (genre)  params = params.set('genre', genre);
    if (status) params = params.set('status', status);
    return this.http.get<PagedResponse<Book>>(`${this.url}/search`, { params });
  }

  getById(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.url}/${id}`);
  }

  create(book: Book): Observable<Book> {
    return this.http.post<Book>(this.url, book);
  }

  update(id: number, book: Book): Observable<Book> {
    return this.http.put<Book>(`${this.url}/${id}`, book);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  discontinue(id: number): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/discontinue`, {});
  }
}

// ─── Member Service ──────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class MemberService {
  private url = `${environment.apiUrl}/members`;
  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 10): Observable<PagedResponse<Member>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PagedResponse<Member>>(this.url, { params });
  }

  search(search: string, status?: string, membershipType?: string, page = 0, size = 10): Observable<PagedResponse<Member>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    if (membershipType) params = params.set('membershipType', membershipType);
    return this.http.get<PagedResponse<Member>>(`${this.url}/search`, { params });
  }

  getById(id: number): Observable<Member> {
    return this.http.get<Member>(`${this.url}/${id}`);
  }

  create(member: Member): Observable<Member> {
    return this.http.post<Member>(this.url, member);
  }

  update(id: number, member: Member): Observable<Member> {
    return this.http.put<Member>(`${this.url}/${id}`, member);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  suspend(id: number): Observable<Member> {
    return this.http.patch<Member>(`${this.url}/${id}/suspend`, {});
  }

  activate(id: number): Observable<Member> {
    return this.http.patch<Member>(`${this.url}/${id}/activate`, {});
  }
}

// ─── Borrowing Service ───────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class BorrowingService {
  private url = `${environment.apiUrl}/borrowings`;
  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 10): Observable<PagedResponse<Borrowing>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PagedResponse<Borrowing>>(this.url, { params });
  }

  getOverdue(page = 0, size = 10): Observable<PagedResponse<Borrowing>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PagedResponse<Borrowing>>(`${this.url}/overdue`, { params });
  }

  getByMember(memberId: number, page = 0, size = 10): Observable<PagedResponse<Borrowing>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PagedResponse<Borrowing>>(`${this.url}/member/${memberId}`, { params });
  }

  borrow(request: BorrowRequest): Observable<Borrowing> {
    return this.http.post<Borrowing>(`${this.url}/borrow`, request);
  }

  returnBook(id: number, notes?: string): Observable<Borrowing> {
    return this.http.put<Borrowing>(`${this.url}/${id}/return`, { notes });
  }

  renew(id: number): Observable<Borrowing> {
    return this.http.put<Borrowing>(`${this.url}/${id}/renew`, {});
  }
}

// ─── Dashboard Service ───────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${environment.apiUrl}/dashboard/stats`);
  }
}

// ─── Loading Service ─────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class LoadingService {
  loading = signal(false);
  set(val: boolean) { this.loading.set(val); }
}

import { signal } from '@angular/core';
