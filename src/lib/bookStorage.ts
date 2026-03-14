const STORAGE_KEY = "chaekgado_books";

export interface StoredBook {
  id: string;
  title_ko: string;
  title_en: string;
  author: string;
  year: number;
  pages: number;
  cover_theme: string;
  rating: number;
  intro_ko: string;
  intro_en: string;
  closing_ko: string;
  closing_en: string;
  question_ko: string;
  question_en: string;
  tags_ko: string[];
  tags_en: string[];
  chapters: {
    number: number;
    title_ko: string;
    title_en: string;
    quote_ko: string;
    quote_en: string;
    body_ko: string;
    body_en: string;
  }[];
  created_at: string;
}

export function getBooks(): StoredBook[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getBookById(id: string): StoredBook | undefined {
  return getBooks().find((b) => b.id === id);
}

export function saveBook(book: StoredBook): void {
  const books = getBooks();
  const idx = books.findIndex((b) => b.id === book.id);
  if (idx >= 0) {
    books[idx] = book;
  } else {
    books.push(book);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

export function deleteBook(id: string): void {
  const books = getBooks().filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}
