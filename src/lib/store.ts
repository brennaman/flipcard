import type { Deck, FlashCard, Category } from '@/types';
import { randomUUID } from 'crypto';

// In-memory data store (resets on server restart)
// Only used when Supabase env vars are not configured
const store = {
  decks: new Map<string, Deck>(),
  flashcards: new Map<string, FlashCard>(),
  categories: new Map<string, Category>(),
};

let seeded = false;

export function seedSampleData() {
  if (seeded || store.decks.size > 0) return;
  seeded = true;

  const deckId = randomUUID();
  const catBehavioral = randomUUID();
  const catTechnical = randomUUID();
  const catSituational = randomUUID();

  store.decks.set(deckId, {
    id: deckId,
    name: 'Interview Prep (Sample)',
    description: 'Sample deck — running in local mode without Supabase',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  store.categories.set(catBehavioral, {
    id: catBehavioral,
    deck_id: deckId,
    name: 'Behavioral',
    color: 'blue',
    created_at: new Date().toISOString(),
  });

  store.categories.set(catTechnical, {
    id: catTechnical,
    deck_id: deckId,
    name: 'Technical',
    color: 'emerald',
    created_at: new Date().toISOString(),
  });

  store.categories.set(catSituational, {
    id: catSituational,
    deck_id: deckId,
    name: 'Situational',
    color: 'amber',
    created_at: new Date().toISOString(),
  });

  const sampleCards = [
    {
      title: 'Low Performer',
      content:
        'Describe a time you managed a team member who was not meeting expectations.\n\nKey points to cover:\n- How did you identify the performance gap?\n- What steps did you take to address it?\n- Did you set clear expectations and a timeline?\n- What was the outcome — did they improve, or did you escalate?\n\nUse the STAR format: Situation, Task, Action, Result.',
      category_id: catBehavioral,
    },
    {
      title: 'Conflict Resolution',
      content:
        'Tell me about a time you had a significant disagreement with a colleague or stakeholder.\n\nKey points to cover:\n- What was the nature of the conflict?\n- How did you approach the other person?\n- What techniques did you use to find common ground?\n- What was the resolution, and what did you learn?\n\nTip: Focus on professional disagreements, not personal ones. Demonstrate empathy and maturity.',
      category_id: catBehavioral,
    },
    {
      title: 'System Design',
      content:
        'Walk me through how you would design a URL shortener at scale.\n\nConsider:\n- **API Design**: POST /shorten → returns short URL; GET /{code} → redirect\n- **Storage**: Key-value store (Redis for hot links, DynamoDB/Postgres for persistence)\n- **Encoding**: Base62 encoding of auto-increment IDs or hash of URL\n- **Scale**: 100M URLs, 1B redirects/day → read-heavy, needs caching layer\n- **Analytics**: Track click counts, referrers, geographic data\n- **Expiration**: TTL on entries, background cleanup job',
      category_id: catTechnical,
    },
    {
      title: 'Prioritization',
      content:
        'Describe how you prioritize work when you have multiple competing deadlines.\n\nFrameworks to mention:\n- **Impact vs. Effort matrix**: focus on high-impact, low-effort first\n- **MoSCoW**: Must-have, Should-have, Could-have, Won\'t-have\n- **Stakeholder alignment**: communicate tradeoffs, not just decisions\n\nGive a specific example with real stakes — budget, product launch, team capacity.',
      category_id: catBehavioral,
    },
    {
      title: 'Failure Story',
      content:
        'Tell me about a time you failed and what you learned from it.\n\nThis question tests self-awareness and growth mindset.\n\nDo:\n- Choose a real failure with real stakes\n- Own it without deflecting blame\n- Be specific about what went wrong\n- Explain what you changed afterward\n\nDon\'t:\n- Pick a fake "weakness that\'s really a strength"\n- Blame external factors entirely\n- Choose something trivial',
      category_id: catBehavioral,
    },
    {
      title: 'Cross-Team Influence',
      content:
        'Give an example of a time you influenced a team or outcome without direct authority.\n\nThis tests leadership without power — common for senior/staff+ roles.\n\nKey elements:\n- What was the goal or change you wanted to drive?\n- Who were the stakeholders and what were their concerns?\n- How did you build buy-in? (data, demos, small wins, champions)\n- What was the outcome?',
      category_id: catSituational,
    },
    {
      title: 'Tight Deadline',
      content:
        'Describe a situation where you had to deliver under an extremely tight deadline.\n\nWhat to address:\n- What was the project and why was the timeline compressed?\n- How did you scope and cut scope to meet the deadline?\n- How did you communicate risk to stakeholders?\n- What corners, if any, were cut — and were they acceptable tradeoffs?\n- Did you hit the deadline? What was the quality of the deliverable?',
      category_id: catSituational,
    },
    {
      title: 'API Rate Limiting',
      content:
        'How would you implement rate limiting for a public API?\n\nApproaches:\n- **Token Bucket**: refills at a fixed rate, allows bursts\n- **Leaky Bucket**: smooths out bursts, constant drain\n- **Fixed Window**: simple but has boundary issues\n- **Sliding Window**: more accurate, higher memory cost\n\nImplementation:\n- Store counters in Redis with TTL\n- Return `429 Too Many Requests` with `Retry-After` header\n- Identify clients by API key, IP, or user ID\n- Consider tiered limits (free vs. paid)',
      category_id: catTechnical,
    },
  ];

  sampleCards.forEach((card, index) => {
    const id = randomUUID();
    const cat = store.categories.get(card.category_id);
    store.flashcards.set(id, {
      id,
      deck_id: deckId,
      title: card.title,
      content: card.content,
      category_id: card.category_id,
      sort_order: index,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: cat,
    });
  });

  return deckId;
}

// Seed automatically on module load so the landing page can show the sample deck link
seedSampleData();

export { store };
export function getSampleDeckId(): string | null {
  const deck = Array.from(store.decks.values())[0];
  return deck?.id ?? null;
}
