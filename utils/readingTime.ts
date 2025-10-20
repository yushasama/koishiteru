import fs from 'fs';
import path from 'path';

const WPM = 45; // Words per minute reading speed

/**
 * Count words in markdown content
 */
function countWords(content: string): number {
  // Remove markdown syntax, code blocks, and extra whitespace
  const cleaned = content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]+`/g, '') // Remove inline code
    .replace(/\$\$[\s\S]*?\$\$/g, '') // Remove display math
    .replace(/\$[^$]+\$/g, '') // Remove inline math
    .replace(/[#*_~\[\]()]/g, '') // Remove markdown syntax
    .trim();
  
  const words = cleaned.split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

/**
 * Format reading time as "X H Y M" or "Y M"
 */
function formatReadingTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} M`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return `${hours} H`;
  }
  
  return `${hours} H ${mins} M`;
}

/**
 * Calculate reading time for a markdown file
 */
export function calculateReadingTime(fileId: string): string {
  try {
    const filePath = path.join(process.cwd(), 'public', 'comp', 'writeups_md', `${fileId}.md`);
    const content = fs.readFileSync(filePath, 'utf-8');
    const wordCount = countWords(content);
    const minutes = Math.ceil(wordCount / WPM);
    return formatReadingTime(minutes);
  } catch (error) {
    console.error(`Error reading file ${fileId}:`, error);
    return '-- M';
  }
}

/**
 * Get reading times for all writeups
 */
export function getAllReadingTimes(): Record<string, string> {
  const writeups = [
    'max_flow',
    'matrix_exponentiation',
    'fenwick_segment_trees',
    'dynamic_programming_subset_sums',
    'prefix_sums',
    'interval_math',
    'constraints'
  ];

  const times: Record<string, string> = {};
  writeups.forEach(id => {
    times[id] = calculateReadingTime(id);
  });

  return times;
}

