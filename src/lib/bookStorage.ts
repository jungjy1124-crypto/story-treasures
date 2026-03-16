import { supabase } from "@/integrations/supabase/client";

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
    quotes_ko: string[];
    quotes_en: string[];
    body_ko: string;
    body_en: string;
    // Legacy single-quote fields (for backward compat)
    quote_ko?: string;
    quote_en?: string;
  }[];
  created_at: string;
}

// Map DB row to StoredBook
function rowToBook(row: any): StoredBook {
  return {
    id: row.id,
    title_ko: row.title_ko || "",
    title_en: row.title_en || "",
    author: row.author || "",
    year: row.year || 0,
    pages: row.pages || 0,
    cover_theme: row.cover_theme || "theme-dark",
    rating: Number(row.rating) || 0,
    intro_ko: row.intro_ko || "",
    intro_en: row.intro_en || "",
    closing_ko: row.closing_ko || "",
    closing_en: row.closing_en || "",
    question_ko: row.question_ko || "",
    question_en: row.question_en || "",
    tags_ko: row.tags_ko || [],
    tags_en: row.tags_en || [],
    chapters: Array.isArray(row.chapters) ? row.chapters : [],
    created_at: row.created_at || new Date().toISOString(),
  };
}

export async function getBooks(): Promise<StoredBook[]> {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to fetch books:", error);
    return [];
  }
  return (data || []).map(rowToBook);
}

export async function getBookById(id: string): Promise<StoredBook | undefined> {
  const { data, error } = await supabase
    .from("books")
    .select(`
      id, title_ko, title_en, author, year, pages, cover_theme,
      rating, intro_ko, intro_en, closing_ko, closing_en,
      question_ko, question_en, tags_ko, tags_en,
      chapters, key_passages, created_at
    `)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) {
    console.error("Failed to fetch book:", error);
    return undefined;
  }
  return rowToBook(data);
}

export async function saveBook(book: StoredBook): Promise<{ success: boolean; error?: string }> {
  // Check if book exists
  const { data: existing } = await supabase
    .from("books")
    .select("id")
    .eq("id", book.id)
    .maybeSingle();

  const dbData = {
    title_ko: book.title_ko,
    title_en: book.title_en || null,
    author: book.author || null,
    year: book.year || null,
    pages: book.pages || null,
    cover_theme: book.cover_theme || null,
    rating: book.rating || null,
    intro_ko: book.intro_ko || null,
    intro_en: book.intro_en || null,
    closing_ko: book.closing_ko || null,
    closing_en: book.closing_en || null,
    question_ko: book.question_ko || null,
    question_en: book.question_en || null,
    tags_ko: book.tags_ko || [],
    tags_en: book.tags_en || [],
    chapters: book.chapters as any,
  };

  if (existing) {
    const { error } = await supabase
      .from("books")
      .update(dbData)
      .eq("id", book.id);
    if (error) {
      console.error("Failed to update book:", error);
      return { success: false, error: error.message };
    }
  } else {
    const { error } = await supabase
      .from("books")
      .insert({ id: book.id, ...dbData });
    if (error) {
      console.error("Failed to insert book:", error);
      return { success: false, error: error.message };
    }
  }
  return { success: true };
}

export async function deleteBook(id: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("books")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("Failed to delete book:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}
