export type ChatLine = {
  id: string;
  from: "lawyer" | "client";
  text: string;
};

const threads = new Map<string, ChatLine[]>();

export function openThread(lawyerId: string, openingText: string): ChatLine[] {
  const current = threads.get(lawyerId);
  if (current) return current.map((line) => ({ ...line }));
  const seed: ChatLine[] = openingText
    ? [{ id: `${lawyerId}-1`, from: "lawyer", text: openingText }]
    : [];
  threads.set(lawyerId, seed);
  return seed.map((line) => ({ ...line }));
}

export function appendClientMessage(lawyerId: string, text: string): ChatLine[] {
  const current = threads.get(lawyerId) ?? [];
  const next: ChatLine[] = [
    ...current,
    { id: `${lawyerId}-${current.length + 1}`, from: "client", text },
  ];
  threads.set(lawyerId, next);
  return next.map((line) => ({ ...line }));
}
