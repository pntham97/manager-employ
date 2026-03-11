export function getProgressColor(progress: number): { bar: string; text: string } {
    if (progress <= 0) return { bar: 'bg-slate-400', text: 'text-slate-400' };
    if (progress <= 25) return { bar: 'bg-red-500', text: 'text-red-500' };
    if (progress <= 50) return { bar: 'bg-amber-500', text: 'text-amber-500' };
    if (progress <= 75) return { bar: 'bg-blue-500', text: 'text-blue-500' };
    if (progress < 100) return { bar: 'bg-teal-500', text: 'text-teal-500' };
    return { bar: 'bg-green-500', text: 'text-green-500' };
}
