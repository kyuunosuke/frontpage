// Simplified version just for the example
// In a real app, you would use the full implementation from shadcn/ui

export function toast({
  title,
  description,
  variant,
}: {
  title: string;
  description: string;
  variant?: string;
}) {
  console.log(`Toast: ${title} - ${description}`);
  // In a real implementation, this would show a toast notification
}
