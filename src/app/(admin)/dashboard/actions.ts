'use server';

export async function getRandomQuote() {
  try {
    const res = await fetch('https://dummyjson.com/quotes/random', { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}
