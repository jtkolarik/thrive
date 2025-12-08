-- Seed data for milestones reference table
-- Based on CDC developmental milestones

INSERT INTO milestones (category, title, description, age_range_start_months, age_range_end_months, source) VALUES

-- 2 months milestones
('social-emotional', 'Calms down when spoken to or picked up', 'Baby begins to self-soothe when comforted by caregiver', 2, 2, 'CDC'),
('social-emotional', 'Looks at your face', 'Makes eye contact and watches faces', 2, 2, 'CDC'),
('language', 'Makes sounds other than crying', 'Coos, gurgles, and makes vowel sounds', 2, 2, 'CDC'),
('cognitive', 'Reacts to loud sounds', 'Startles or turns head toward sudden noises', 2, 2, 'CDC'),
('movement', 'Holds head up when on tummy', 'Shows improved neck strength during tummy time', 2, 2, 'CDC'),

-- 4 months milestones
('social-emotional', 'Smiles on their own to get your attention', 'Social smiling emerges', 4, 4, 'CDC'),
('language', 'Chuckles when you try to make them laugh', 'Responds to playful interaction with laughter', 4, 4, 'CDC'),
('language', 'Makes sounds back when you talk', 'Engages in vocal turn-taking', 4, 4, 'CDC'),
('cognitive', 'Looks at you, moves, or makes sounds to get or keep your attention', 'Shows intentional communication', 4, 4, 'CDC'),
('movement', 'Holds head steady without support when being held', 'Strong neck control established', 4, 4, 'CDC'),
('movement', 'Holds a toy when you put it in their hand', 'Grasps objects placed in palm', 4, 4, 'CDC'),

-- 6 months milestones
('social-emotional', 'Knows familiar people', 'Recognizes and prefers familiar faces', 6, 6, 'CDC'),
('social-emotional', 'Likes to look at self in a mirror', 'Shows interest in own reflection', 6, 6, 'CDC'),
('language', 'Takes turns making sounds with you', 'Participates in vocal back-and-forth', 6, 6, 'CDC'),
('language', 'Blows "raspberries"', 'Makes bubbling sounds with lips and tongue', 6, 6, 'CDC'),
('cognitive', 'Puts things in mouth to explore them', 'Uses mouth for sensory exploration', 6, 6, 'CDC'),
('movement', 'Rolls from tummy to back', 'Can change positions independently', 6, 6, 'CDC'),
('movement', 'Pushes up with straight arms when on tummy', 'Shows increased upper body strength', 6, 6, 'CDC'),

-- 9 months milestones
('social-emotional', 'Is shy, clingy, or fearful around strangers', 'Stranger anxiety develops', 9, 9, 'CDC'),
('language', 'Makes different sounds like "mamamama" and "babababa"', 'Babbles with consonant-vowel combinations', 9, 9, 'CDC'),
('language', 'Lifts arms up to be picked up', 'Communicates desires through gestures', 9, 9, 'CDC'),
('cognitive', 'Looks for objects when dropped out of sight', 'Object permanence emerges', 9, 9, 'CDC'),
('movement', 'Gets to a sitting position by themselves', 'Can move into sitting independently', 9, 9, 'CDC'),
('movement', 'Moves things from one hand to the other', 'Transfers objects between hands', 9, 9, 'CDC'),
('movement', 'Uses fingers to "rake" food towards themselves', 'Develops pincer grasp precursor', 9, 9, 'CDC'),

-- 12 months milestones
('social-emotional', 'Plays games with you like pat-a-cake', 'Engages in simple interactive games', 12, 12, 'CDC'),
('language', 'Waves "bye-bye"', 'Uses conventional gestures', 12, 12, 'CDC'),
('language', 'Calls a parent "mama" or "dada" or another special name', 'Uses specific words for caregivers', 12, 12, 'CDC'),
('cognitive', 'Puts something in a container like a block in a cup', 'Understands spatial relationships', 12, 12, 'CDC'),
('movement', 'Pulls up to stand', 'Can move to standing position with support', 12, 12, 'CDC'),
('movement', 'Walks holding on to furniture', 'Cruises along furniture', 12, 12, 'CDC'),
('movement', 'Picks things up between thumb and pointer finger', 'Pincer grasp fully developed', 12, 12, 'CDC'),

-- 15 months milestones
('social-emotional', 'Copies other children while playing', 'Begins parallel play', 15, 15, 'CDC'),
('language', 'Says several single words', 'Vocabulary of 3-5 words', 15, 15, 'CDC'),
('language', 'Shows you an object they like', 'Points to share interest', 15, 15, 'CDC'),
('cognitive', 'Claps when excited', 'Expresses emotions physically', 15, 15, 'CDC'),
('movement', 'Takes a few steps on their own', 'Walks independently', 15, 15, 'CDC'),
('movement', 'Uses fingers to feed themselves some food', 'Self-feeding skills emerge', 15, 15, 'CDC'),

-- 18 months milestones
('social-emotional', 'Moves away from you but looks to make sure you are close by', 'Secure base behavior', 18, 18, 'CDC'),
('language', 'Says and shakes head "no"', 'Uses gestures with words', 18, 18, 'CDC'),
('language', 'Points to show you something interesting', 'Joint attention established', 18, 18, 'CDC'),
('cognitive', 'Tries to use things the right way like a phone or cup', 'Functional play emerges', 18, 18, 'CDC'),
('movement', 'Walks without holding on to anyone or anything', 'Independent walking mastered', 18, 18, 'CDC'),
('movement', 'Drinks from a cup without a lid', 'Advanced drinking skills', 18, 18, 'CDC'),

-- 2 years milestones
('social-emotional', 'Notices when others are hurt or upset', 'Empathy begins to develop', 24, 24, 'CDC'),
('language', 'Says at least two words together', 'Two-word combinations emerge', 24, 24, 'CDC'),
('language', 'Points to things in a book when you ask', 'Receptive language developing', 24, 24, 'CDC'),
('cognitive', 'Holds something in one hand while using the other', 'Bilateral coordination', 24, 24, 'CDC'),
('movement', 'Kicks a ball', 'Gross motor coordination improves', 24, 24, 'CDC'),
('movement', 'Runs', 'Advanced mobility achieved', 24, 24, 'CDC'),

-- 30 months milestones
('social-emotional', 'Plays next to other children', 'Parallel play is common', 30, 30, 'CDC'),
('language', 'Says about 50 words', 'Vocabulary expansion', 30, 30, 'CDC'),
('language', 'Says two or more words together', 'Multi-word phrases', 30, 30, 'CDC'),
('cognitive', 'Uses things to pretend like feeding a block to a doll', 'Pretend play develops', 30, 30, 'CDC'),
('movement', 'Uses hands to twist things like turning doorknobs', 'Fine motor skills advance', 30, 30, 'CDC'),

-- 3 years milestones
('social-emotional', 'Calms down within 10 minutes after you leave', 'Separation anxiety decreases', 36, 36, 'CDC'),
('social-emotional', 'Notices other children and joins them to play', 'Interactive play begins', 36, 36, 'CDC'),
('language', 'Talks with you in conversation using at least two back-and-forth exchanges', 'Conversational skills emerge', 36, 36, 'CDC'),
('language', 'Asks "who," "what," "where," or "why" questions', 'Question asking phase', 36, 36, 'CDC'),
('cognitive', 'Draws a circle when you show them how', 'Pre-writing skills develop', 36, 36, 'CDC'),
('movement', 'Strings items together like large beads or macaroni', 'Fine motor precision increases', 36, 36, 'CDC'),

-- 4 years milestones
('social-emotional', 'Pretends to be something else during play', 'Imaginative play flourishes', 48, 48, 'CDC'),
('language', 'Says sentences with four or more words', 'Complex sentence structure', 48, 48, 'CDC'),
('language', 'Says some words from a song, story, or nursery rhyme', 'Memory and language integration', 48, 48, 'CDC'),
('cognitive', 'Names some colors', 'Color recognition established', 48, 48, 'CDC'),
('movement', 'Catches a large ball most of the time', 'Hand-eye coordination improves', 48, 48, 'CDC'),
('movement', 'Pours, cuts with supervision, and mashes own food', 'Self-help skills advance', 48, 48, 'CDC'),

-- 5 years milestones
('social-emotional', 'Wants to please friends', 'Peer relationships important', 60, 60, 'CDC'),
('social-emotional', 'Wants to be like friends', 'Social conformity emerges', 60, 60, 'CDC'),
('language', 'Tells a story heard or made up with at least two events', 'Narrative skills develop', 60, 60, 'CDC'),
('language', 'Speaks clearly', 'Speech intelligibility high', 60, 60, 'CDC'),
('cognitive', 'Counts to 10', 'Basic numeracy established', 60, 60, 'CDC'),
('movement', 'Hops on one foot', 'Balance and coordination refined', 60, 60, 'CDC'),
('movement', 'Uses a fork and spoon and sometimes a table knife', 'Utensil use mastered', 60, 60, 'CDC');
