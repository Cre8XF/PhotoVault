# HomeDashboard - Hero & Statistics

## INSTRUCTIONS FOR CLAUDE CODE

Read @docs/design-system.md for design tokens. Implement all changes directly - no approval needed. Test your changes before finishing. Commit with message: "feat(home): add animated hero and statistics dashboard"

## FILES TO MODIFY

- @src/pages/HomeDashboard.jsx
- Create @src/components/AnimatedCounter.jsx
- Create @src/components/Particles.jsx
- Create @src/utils/greetings.js

## CURRENT STATE ANALYSIS

HomeDashboard currently has:

- Basic welcome message
- Simple stats grid
- Static layout
- No animations

## TARGET STATE

Premium animated welcome experience with:

- Gradient hero with particles
- Time-based greeting
- Animated statistics counters
- Smooth transitions
- Mobile responsive

## IMPLEMENTATION STEPS

### 1. Create AnimatedCounter Component

**File:** `src/components/AnimatedCounter.jsx`

```jsx
import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export const AnimatedCounter = ({ end, duration = 1500, className = '' }) => {
  const [count, setCount] = useState(0);
  const spring = useSpring(0, {
    duration,
    bounce: 0
  });
  const display = useTransform(spring, val => Math.floor(val));

  useEffect(() => {
    spring.set(end);
  }, [end, spring]);

  useEffect(() => {
    const unsubscribe = display.on('change', setCount);
    return () => unsubscribe();
  }, [display]);

  return (
    <motion.span className={className} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
      {count.toLocaleString('no-NO')}
    </motion.span>
  );
};
```

### 2. Create Particles Component

**File:** `src/components/Particles.jsx`

```jsx
import { motion } from 'framer-motion';

export const Particles = () => {
  const particles = Array.from({ length: 30 });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          initial={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`
          }}
          animate={{
            y: [null, '-20%', '-40%', '-60%', '-80%', '-100%'],
            opacity: [0, 0.5, 1, 0.5, 0],
            scale: [0, 1, 1, 0.5, 0]
          }}
          transition={{
            duration: Math.random() * 8 + 12,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'linear'
          }}
        />
      ))}
    </div>
  );
};
```

### 3. Create Greeting Utility

**File:** `src/utils/greetings.js`

```js
export const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 6) return 'God natt';
  if (hour < 10) return 'God morgen';
  if (hour < 18) return 'God dag';
  if (hour < 22) return 'God kveld';
  return 'God natt';
};

export const getGreetingEmoji = () => {
  const hour = new Date().getHours();

  if (hour < 6) return '🌙';
  if (hour < 10) return '☀️';
  if (hour < 18) return '👋';
  if (hour < 22) return '🌆';
  return '⭐';
};
```

### 4. Update HomeDashboard.jsx

Replace the current hero section with:

```jsx
import { motion } from 'framer-motion';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { Particles } from '../components/Particles';
import { getGreeting, getGreetingEmoji } from '../utils/greetings';
import { Sparkles, Star, Clock, Users, FolderOpen, ImagePlus } from 'lucide-react';

// Add after imports
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const statCardVariant = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

// In component, replace hero section:
<motion.section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 p-8 md:p-12" {...fadeIn}>
  <Particles />

  <div className="relative z-10">
    <motion.div className="flex items-center gap-3 mb-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
      <span className="text-4xl">{getGreetingEmoji()}</span>
      <h1 className="text-3xl md:text-4xl font-bold text-white">
        {getGreeting()}, {user?.displayName || user?.email?.split('@')[0] || t('home:user')}!
      </h1>
    </motion.div>

    {stats.recent > 0 && (
      <motion.p className="text-lg text-white/90 mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <AnimatedCounter end={stats.recent} className="font-bold" /> {stats.recent === 1 ? t('home:newPhoto') : t('home:newPhotos')} {t('home:sinceYesterday')}
      </motion.p>
    )}

    <motion.div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4" variants={staggerContainer} initial="initial" animate="animate">
      <motion.div
        variants={statCardVariant}
        className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300"
        whileHover={{ y: -4, scale: 1.02 }}
      >
        <div className="flex items-center gap-2 text-white/70 text-xs mb-2">
          <FolderOpen className="w-4 h-4" />
          <span>{t('common:albums')}</span>
        </div>
        <AnimatedCounter end={albums.length} className="text-2xl md:text-3xl font-bold text-white" />
      </motion.div>

      <motion.div
        variants={statCardVariant}
        className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300"
        whileHover={{ y: -4, scale: 1.02 }}
      >
        <div className="flex items-center gap-2 text-white/70 text-xs mb-2">
          <ImagePlus className="w-4 h-4" />
          <span>{t('common:photos')}</span>
        </div>
        <AnimatedCounter end={stats.total} className="text-2xl md:text-3xl font-bold text-white" />
      </motion.div>

      <motion.div
        variants={statCardVariant}
        className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300"
        whileHover={{ y: -4, scale: 1.02 }}
      >
        <div className="flex items-center gap-2 text-white/70 text-xs mb-2">
          <Star className="w-4 h-4" />
          <span>{t('common:favorites')}</span>
        </div>
        <AnimatedCounter end={stats.favorites} className="text-2xl md:text-3xl font-bold text-white" />
      </motion.div>

      <motion.div
        variants={statCardVariant}
        className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300"
        whileHover={{ y: -4, scale: 1.02 }}
      >
        <div className="flex items-center gap-2 text-white/70 text-xs mb-2">
          <Sparkles className="w-4 h-4" />
          <span>AI</span>
        </div>
        <AnimatedCounter end={photos.filter(p => p.aiAnalyzed).length} className="text-2xl md:text-3xl font-bold text-white" />
      </motion.div>

      <motion.div
        variants={statCardVariant}
        className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300"
        whileHover={{ y: -4, scale: 1.02 }}
      >
        <div className="flex items-center gap-2 text-white/70 text-xs mb-2">
          <Clock className="w-4 h-4" />
          <span>{t('home:new7d', 'Nye (7d)')}</span>
        </div>
        <AnimatedCounter end={stats.recentUploads} className="text-2xl md:text-3xl font-bold text-white" />
      </motion.div>
    </motion.div>
  </div>
</motion.section>;
```

## TESTING CHECKLIST

Run these tests before committing:

- [ ] Hero section renders without errors
- [ ] Particles animate smoothly (check FPS in DevTools)
- [ ] Counters animate from 0 to target value
- [ ] Greeting changes based on time of day
- [ ] Hover effects work on stat cards
- [ ] Mobile responsive (test on small screen)
- [ ] No layout shift during animations
- [ ] i18n works for both NO and EN
- [ ] Performance: Hero paints in <500ms
- [ ] No console warnings

## PERFORMANCE REQUIREMENTS

- Hero section first paint: <500ms
- Animation FPS: 60fps minimum
- Particles should not block main thread
- Use transform/opacity for animations (GPU accelerated)

## COMMIT MESSAGE

```
feat(home): add animated hero and statistics dashboard

- Add animated particle background
- Implement counter animations with Framer Motion
- Add time-based greeting system
- Create responsive stat cards with hover effects
- Improve mobile layout for hero section

Performance: Hero renders in <500ms, 60fps animations
```

## NEXT SESSION

After this is complete and committed, proceed to: `@docs/prompts/02-home-content.md`

---

END OF PROMPT
