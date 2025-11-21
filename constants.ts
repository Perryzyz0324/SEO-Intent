import { IntentType } from './types';

export const INTENT_COLORS = {
  [IntentType.PRODUCT]: '#3b82f6', // Blue
  [IntentType.COLLECTION]: '#8b5cf6', // Violet
  [IntentType.ARTICLE]: '#10b981', // Emerald
  [IntentType.UNKNOWN]: '#9ca3af', // Gray
};

// Sample data based on the user's screenshot to allow quick testing
export const SAMPLE_INPUT_TEXT = `Artificial flowers	14800
fake flowers	18100
faux flowers	6600
Artificial Floral Arrangements	1000
Artificial Orchid	390
Artificial Rose	390
Artificial Hydrangea	320
Artificial Sunflower	210
Artificial Peony	140
Artificial Tulip	140
Artificial Chrysanthemum	110
Artificial Magnolia	110
Artificial Phalaenopsis	50
Artificial Dahlia	30
Artificial Lily	30
Artificial plants	9900
fake plants	18100
faux plants	6600
artificial outdoor plants	3600
artificial planter plants	3600
artificial hanging plants	2400
artificial plants indoor	2400
How to clean artificial flowers 500
Best artificial flowers for wedding 200`;
