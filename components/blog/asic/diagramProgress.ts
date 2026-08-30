// Finished-state scroll holds are not part of animation completion.
export function getDiagramProgress(progress: number, completeAt: number = 1): number {
  return Math.min(1, Math.max(0, progress / completeAt));
}
