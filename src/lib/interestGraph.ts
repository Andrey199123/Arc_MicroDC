/**
 * Interest Graph System
 * Defines relationships between interests for dynamic suggestions
 */

export interface InterestNode {
  id: string;
  label: string;
  related: string[]; // IDs of related interests
}

export const INTEREST_GRAPH: Record<string, InterestNode> = {
  // STEM Cluster
  tech: {
    id: 'tech',
    label: 'Technology',
    related: ['computer-science', 'engineering', 'robotics', 'ai', 'cybersecurity', 'data-science']
  },
  'computer-science': {
    id: 'computer-science',
    label: 'Computer Science',
    related: ['tech', 'programming', 'ai', 'data-science', 'cybersecurity', 'software-dev']
  },
  programming: {
    id: 'programming',
    label: 'Programming',
    related: ['computer-science', 'tech', 'software-dev', 'web-dev', 'game-dev', 'ai']
  },
  ai: {
    id: 'ai',
    label: 'Artificial Intelligence',
    related: ['computer-science', 'tech', 'data-science', 'machine-learning', 'robotics', 'math']
  },
  'data-science': {
    id: 'data-science',
    label: 'Data Science',
    related: ['ai', 'computer-science', 'math', 'statistics', 'machine-learning', 'analytics']
  },
  math: {
    id: 'math',
    label: 'Mathematics',
    related: ['physics', 'computer-science', 'engineering', 'data-science', 'statistics', 'finance']
  },
  physics: {
    id: 'physics',
    label: 'Physics',
    related: ['math', 'engineering', 'astronomy', 'science', 'chemistry', 'robotics']
  },
  engineering: {
    id: 'engineering',
    label: 'Engineering',
    related: ['tech', 'robotics', 'physics', 'math', 'design', 'architecture']
  },
  robotics: {
    id: 'robotics',
    label: 'Robotics',
    related: ['engineering', 'tech', 'ai', 'physics', 'programming', 'electronics']
  },
  science: {
    id: 'science',
    label: 'Science',
    related: ['physics', 'chemistry', 'biology', 'research', 'medicine', 'environment']
  },
  chemistry: {
    id: 'chemistry',
    label: 'Chemistry',
    related: ['science', 'biology', 'medicine', 'physics', 'research', 'pharmacy']
  },
  biology: {
    id: 'biology',
    label: 'Biology',
    related: ['science', 'medicine', 'chemistry', 'environment', 'research', 'health']
  },

  // Business & Finance Cluster
  business: {
    id: 'business',
    label: 'Business',
    related: ['entrepreneurship', 'finance', 'marketing', 'economics', 'management', 'investing']
  },
  entrepreneurship: {
    id: 'entrepreneurship',
    label: 'Entrepreneurship',
    related: ['business', 'startups', 'innovation', 'marketing', 'finance', 'leadership']
  },
  finance: {
    id: 'finance',
    label: 'Finance',
    related: ['business', 'investing', 'economics', 'accounting', 'banking', 'math']
  },
  marketing: {
    id: 'marketing',
    label: 'Marketing',
    related: ['business', 'social-media', 'design', 'writing', 'psychology', 'branding']
  },
  economics: {
    id: 'economics',
    label: 'Economics',
    related: ['finance', 'business', 'politics', 'math', 'statistics', 'policy']
  },

  // Creative Arts Cluster
  art: {
    id: 'art',
    label: 'Art',
    related: ['design', 'drawing', 'painting', 'animation', 'photography', 'sculpture']
  },
  design: {
    id: 'design',
    label: 'Design',
    related: ['art', 'graphic-design', 'ui-ux', 'architecture', 'fashion', 'animation']
  },
  'graphic-design': {
    id: 'graphic-design',
    label: 'Graphic Design',
    related: ['design', 'art', 'ui-ux', 'branding', 'illustration', 'photography']
  },
  animation: {
    id: 'animation',
    label: 'Animation',
    related: ['art', 'design', 'film', 'game-dev', '3d-modeling', 'storytelling']
  },
  music: {
    id: 'music',
    label: 'Music',
    related: ['singing', 'instruments', 'production', 'composition', 'performance', 'audio']
  },
  film: {
    id: 'film',
    label: 'Film & Video',
    related: ['animation', 'photography', 'storytelling', 'editing', 'directing', 'acting']
  },
  photography: {
    id: 'photography',
    label: 'Photography',
    related: ['art', 'film', 'design', 'editing', 'visual-arts', 'journalism']
  },
  fashion: {
    id: 'fashion',
    label: 'Fashion',
    related: ['design', 'art', 'sewing', 'styling', 'business', 'sneakers']
  },
  sneakers: {
    id: 'sneakers',
    label: 'Sneakers',
    related: ['fashion', 'design', 'collecting', 'business', 'art', 'culture']
  },

  // Writing & Communication Cluster
  writing: {
    id: 'writing',
    label: 'Writing',
    related: ['journalism', 'creative-writing', 'blogging', 'storytelling', 'poetry', 'literature']
  },
  journalism: {
    id: 'journalism',
    label: 'Journalism',
    related: ['writing', 'media', 'photography', 'politics', 'research', 'communication']
  },
  literature: {
    id: 'literature',
    label: 'Literature',
    related: ['writing', 'reading', 'poetry', 'history', 'philosophy', 'languages']
  },

  // Sports & Fitness Cluster
  sports: {
    id: 'sports',
    label: 'Sports',
    related: ['fitness', 'basketball', 'soccer', 'athletics', 'health', 'coaching']
  },
  fitness: {
    id: 'fitness',
    label: 'Fitness',
    related: ['sports', 'health', 'nutrition', 'wellness', 'athletics', 'training']
  },
  health: {
    id: 'health',
    label: 'Health',
    related: ['fitness', 'nutrition', 'medicine', 'wellness', 'biology', 'psychology']
  },

  // Social Sciences Cluster
  psychology: {
    id: 'psychology',
    label: 'Psychology',
    related: ['mental-health', 'neuroscience', 'counseling', 'research', 'sociology', 'health']
  },
  sociology: {
    id: 'sociology',
    label: 'Sociology',
    related: ['psychology', 'politics', 'anthropology', 'social-justice', 'research', 'culture']
  },
  politics: {
    id: 'politics',
    label: 'Politics',
    related: ['government', 'law', 'economics', 'history', 'policy', 'debate']
  },
  history: {
    id: 'history',
    label: 'History',
    related: ['politics', 'culture', 'literature', 'research', 'archaeology', 'geography']
  },
  philosophy: {
    id: 'philosophy',
    label: 'Philosophy',
    related: ['literature', 'ethics', 'logic', 'psychology', 'politics', 'debate']
  },

  // Gaming & Entertainment Cluster
  gaming: {
    id: 'gaming',
    label: 'Gaming',
    related: ['game-dev', 'esports', 'streaming', 'tech', 'animation', 'design']
  },
  'game-dev': {
    id: 'game-dev',
    label: 'Game Development',
    related: ['programming', 'gaming', 'animation', 'design', '3d-modeling', 'storytelling']
  },

  // Environment & Sustainability Cluster
  environment: {
    id: 'environment',
    label: 'Environment',
    related: ['sustainability', 'climate', 'biology', 'science', 'activism', 'conservation']
  },
  sustainability: {
    id: 'sustainability',
    label: 'Sustainability',
    related: ['environment', 'climate', 'green-tech', 'policy', 'activism', 'engineering']
  },

  // Medicine & Healthcare Cluster
  medicine: {
    id: 'medicine',
    label: 'Medicine',
    related: ['health', 'biology', 'chemistry', 'nursing', 'research', 'pharmacy']
  },
  nursing: {
    id: 'nursing',
    label: 'Nursing',
    related: ['medicine', 'health', 'care', 'biology', 'psychology', 'wellness']
  },

  // Languages & Culture Cluster
  languages: {
    id: 'languages',
    label: 'Languages',
    related: ['culture', 'travel', 'literature', 'linguistics', 'translation', 'communication']
  },
  culture: {
    id: 'culture',
    label: 'Culture',
    related: ['languages', 'history', 'art', 'travel', 'sociology', 'anthropology']
  },
};

// Initial interests to show (8 diverse options)
export const INITIAL_INTERESTS = [
  'tech',
  'business',
  'art',
  'sports',
  'music',
  'writing',
  'science',
  'psychology'
];

/**
 * Get related interests for a given interest
 */
export function getRelatedInterests(interestId: string): InterestNode[] {
  const interest = INTEREST_GRAPH[interestId];
  if (!interest) return [];
  
  return interest.related
    .map(id => INTEREST_GRAPH[id])
    .filter(Boolean);
}

/**
 * Get interests to display based on selected interests
 * Shows initial interests + related interests for selected ones
 */
export function getSuggestedInterests(selectedInterests: string[]): InterestNode[] {
  if (selectedInterests.length === 0) {
    // Show initial 8 interests
    return INITIAL_INTERESTS.map(id => INTEREST_GRAPH[id]).filter(Boolean);
  }

  // Get all related interests from selected ones
  const relatedSet = new Set<string>();
  selectedInterests.forEach(selected => {
    const interest = INTEREST_GRAPH[selected];
    if (interest) {
      interest.related.forEach(relatedId => {
        // Don't suggest already selected interests
        if (!selectedInterests.includes(relatedId)) {
          relatedSet.add(relatedId);
        }
      });
    }
  });

  // Convert to array and limit to 8 suggestions
  const related = Array.from(relatedSet)
    .map(id => INTEREST_GRAPH[id])
    .filter(Boolean)
    .slice(0, 8);

  return related;
}
