# Card Design Visual Reference Guide

## 🎨 Complete Visual Breakdown

### Skill Card Anatomy

```
┌─────────────────────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ ← 2px Gradient Border
│                                                             │   (Primary → Light → Info)
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │  Python Programming                      ✏️  🗑️     │   │ ← 1.25rem Bold
│  │                                                      │   │   Font-weight: 700
│  │  ┌──────────┐                                       │   │
│  │  │ Backend  │                                       │   │ ← Category Pill
│  │  └──────────┘                                       │   │   20% opacity
│  │                                                      │   │   Accent color
│  │  ● In Progress                                      │   │ ← Status Badge
│  │                                                      │   │   Colored dot (8px)
│  │                                                      │   │   Font-weight: 600
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Padding: 24px                                              │
│  Border-radius: 12px                                        │
│  Shadow: Level 1 → Level 2 (hover)                          │
└─────────────────────────────────────────────────────────────┘

HOVER STATE:
- Transform: translateY(-2px)
- Shadow: Level 2 + inset shadow
- Gradient opacity: 0.8 → 1.0
- Transition: 200ms
```

### Stat Card Anatomy (Streak Example)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ╔═══════╗                                                  │
│  ║       ║                                                  │
│  ║  🔥   ║    7                                             │ ← Icon (48x48)
│  ║       ║    CURRENT STREAK                                │   + Number (2.5rem)
│  ╚═══════╝                                                  │   + Label (0.8rem)
│   White                                                     │
│   Circle                                                    │
│                                                             │
│  ╔═══════════════════════════════════════════════════════╗ │
│  ║  ORANGE GRADIENT BACKGROUND                           ║ │
│  ║  #ff9a56 ──────────────────────────────► #ff6b35     ║ │
│  ╚═══════════════════════════════════════════════════════╝ │
│                                                             │
│  Padding: 24px                                              │
│  Border-radius: 12px                                        │
│  Shadow: Level 1 → Level 3 (hover)                          │
└─────────────────────────────────────────────────────────────┘

GRADIENT TYPES:
┌──────────┬────────────────────────────────────┐
│ Streak   │ Orange: #ff9a56 → #ff6b35          │
│ Weekly   │ Blue:   #60a5fa → #3b82f6          │
│ Monthly  │ Purple: #c084fc → #a855f7          │
│ Learned  │ Green:  #6ee7b7 → #10b981          │
└──────────┴────────────────────────────────────┘

HOVER STATE:
- Transform: translateY(-2px)
- Shadow: Level 3
- Gradient position: 0% → 100% (shift animation)
- Transition: 300ms
```

### Log Card Anatomy (Timeline Style)

```
┌─────────────────────────────────────────────────────────────┐
║                                                             │ ← 4px Timeline
║                                                             │   Border (left)
║  ┌─────────────────────────────────────────────────────┐   │
║  │                                                      │   │
║  │  October 29, 2025                    ⏱ 2.5h        │   │ ← Date (1.125rem bold)
║  │                                                      │   │   Hours badge (gradient)
║  │                                                      │   │
║  │  ┌────────┐ ┌───────┐ ┌──────┐                     │   │
║  │  │ Python │ │ React │ │ CSS  │                     │   │ ← Skill Pills
║  │  └────────┘ └───────┘ └──────┘                     │   │   (gradient, 8px gap)
║  │                                                      │   │
║  │  Learned about modern card design and                  │
║  │  implemented gradient backgrounds...                │   │ ← Notes (italic)
║  │                                                      │   │
║  └─────────────────────────────────────────────────────┘   │
║                                                             │
│  Padding: 24px + 12px left                                  │
│  Border-radius: 12px                                        │
│  Shadow: Level 1 → Level 2 (hover)                          │
└─────────────────────────────────────────────────────────────┘

TIMELINE BORDER:
- Width: 4px
- Default: Gray (--border-color)
- Hover: Primary color
- Animation: 200ms ease

HOVER STATE:
- Transform: translateY(-1px)
- Shadow: Level 2
- Border color: Gray → Primary
```

### Empty State Anatomy

```
     ┌───────────────────────────────┐
     │                               │
     │         ┌─────────┐           │
     │         │         │           │  ← Icon Container
     │         │   📖    │           │    140x140px
     │         │         │           │    Animated
     │         └─────────┘           │
     │                               │
     │      No Skills Yet            │  ← Title (1.5rem bold)
     │                               │    Delay: 0.2s
     │   Start tracking your         │
     │   learning journey by         │  ← Description (1rem)
     │   adding your first skill     │    Delay: 0.4s
     │                               │
     │   ┌───────────────────────┐   │
     │   │   Add New Skill       │   │  ← CTA Button (48px)
     │   └───────────────────────┘   │    Delay: 0.6s
     │                               │
     └───────────────────────────────┘

ICON ANIMATIONS:

Book (Pulsing):
  0%   ──────  100%
  │             │
  │    50%      │
  │    ▲        │
  │   1.05x     │
  └─────────────┘
  Duration: 2s infinite

Calendar (Lifting):
  0%   ──────  100%
  │             │
  │    50%      │
  │    ▲        │
  │   -8px      │
  └─────────────┘
  Duration: 3s infinite
  Shadow: Level 3 → Level 4

Search (Rotating):
  0%   ──────  100%
  │             │
  │  25%   75%  │
  │  -10°  +10° │
  └─────────────┘
  Duration: 4s infinite

STAGGERED FADE-IN:
Icon:        ████████ (0.6s, delay 0s)
Title:       ░░████████ (0.6s, delay 0.2s)
Description: ░░░░████████ (0.6s, delay 0.4s)
Button:      ░░░░░░████████ (0.6s, delay 0.6s)

CTA BUTTON HOVER:
- Transform: translateY(-4px)
- Shadow: Level 2 → Level 4
- Stronger lift effect
```

## 📐 Spacing & Sizing Reference

### Skill Cards
```
┌─────────────────────────────────────┐
│ ← 24px →                            │
│    ↑                                │
│   24px  Skill Name (1.25rem)        │
│    ↓                                │
│    ↑                                │
│   16px  Category Pill               │
│    ↓                                │
│    ↑                                │
│   16px  Status Badge                │
│    ↓                                │
│ ← 24px →                            │
└─────────────────────────────────────┘

Border-radius: 12px
Gradient height: 2px
```

### Stat Cards
```
┌─────────────────────────────────────┐
│ ← 24px →                            │
│    ↑                                │
│   24px  ┌────┐                      │
│         │Icon│ Number (2.5rem)      │
│         │48px│ Label (0.8rem)       │
│         └────┘                      │
│    ↓                                │
│ ← 24px →                            │
└─────────────────────────────────────┘

Icon: 48x48px circle
Gap: 24px between icon and content
```

### Log Cards
```
┌─────────────────────────────────────┐
║← 4px                                │
║← 12px →← 24px →                     │
║    ↑                                │
║   24px  Date + Hours                │
║    ↓                                │
║    ↑                                │
║   16px  Skill Pills (8px gap)       │
║    ↓                                │
║    ↑                                │
║   16px  Notes                       │
║    ↓                                │
║← 12px →← 24px →                     │
└─────────────────────────────────────┘

Timeline border: 4px left
Extra padding: 12px left
```

### Empty States
```
     ┌─────────────────────┐
     │    ↑                │
     │   48px              │
     │    ↓                │
     │  ┌────────┐         │
     │  │ 140px  │         │
     │  │  Icon  │         │
     │  └────────┘         │
     │    ↑                │
     │   32px              │
     │    ↓                │
     │   Title             │
     │    ↑                │
     │   16px              │
     │    ↓                │
     │  Description        │
     │    ↑                │
     │   32px              │
     │    ↓                │
     │  ┌──────────┐       │
     │  │ 48px btn │       │
     │  └──────────┘       │
     │    ↑                │
     │   48px              │
     │    ↓                │
     └─────────────────────┘

Button: 48px height
Button padding: 16px/32px
```

## 🎨 Color Palette

### Gradient Definitions

**Stat Card Gradients:**
```css
/* Streak - Orange */
linear-gradient(135deg, 
  #ff9a56 0%,    /* Light Orange */
  #ff6b35 50%,   /* Dark Orange */
  #ff9a56 100%   /* Light Orange */
)

/* Weekly - Blue */
linear-gradient(135deg,
  #60a5fa 0%,    /* Light Blue */
  #3b82f6 50%,   /* Dark Blue */
  #60a5fa 100%   /* Light Blue */
)

/* Monthly - Purple */
linear-gradient(135deg,
  #c084fc 0%,    /* Light Purple */
  #a855f7 50%,   /* Dark Purple */
  #c084fc 100%   /* Light Purple */
)

/* Learned - Green */
linear-gradient(135deg,
  #6ee7b7 0%,    /* Light Green */
  #10b981 50%,   /* Dark Green */
  #6ee7b7 100%   /* Light Green */
)
```

**Skill Card Gradient:**
```css
/* Top Border */
linear-gradient(90deg,
  var(--primary-color),   /* #0B6623 */
  var(--primary-light),   /* #10b981 */
  var(--info-color)       /* #3b82f6 */
)
```

**Log Element Gradients:**
```css
/* Hours Badge & Skill Pills */
linear-gradient(135deg,
  var(--primary-color),   /* #0B6623 */
  var(--primary-light)    /* #10b981 */
)
```

### Status Badge Colors

```css
/* To Learn - Yellow/Amber */
Background: rgba(251, 191, 36, 0.15)
Color: #fbbf24
Border: #fbbf24
Dot: #fbbf24 with glow

/* In Progress - Blue */
Background: rgba(59, 130, 246, 0.15)
Color: #3b82f6
Border: #3b82f6
Dot: #3b82f6 with glow

/* Learned - Green */
Background: rgba(16, 185, 129, 0.15)
Color: #10b981
Border: #10b981
Dot: #10b981 with glow
```

### Category Pill Color

```css
Background: rgba(11, 102, 35, 0.2)  /* Primary at 20% */
Color: var(--text-accent)            /* Primary color */
Border-radius: 9999px                /* Full pill */
```

## 🎬 Animation Specifications

### Skill Card Animations

**Gradient Opacity:**
```css
.skill-card::before {
  opacity: 0.8;
  transition: opacity 200ms ease;
}

.skill-card:hover::before {
  opacity: 1.0;
}
```

**Card Lift:**
```css
.skill-card {
  transition: transform 200ms ease,
              box-shadow 200ms ease;
}

.skill-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-2),
              inset 0 1px 3px rgba(0, 0, 0, 0.05);
}
```

### Stat Card Animations

**Gradient Shift:**
```css
.stat-card {
  background-size: 200% 100%;
  background-position: 0% 0%;
  transition: background-position 300ms ease;
}

.stat-card:hover {
  background-position: 100% 0%;
}
```

**Card Lift:**
```css
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-3);
}
```

### Log Card Animations

**Timeline Border:**
```css
.log-card {
  border-left: 4px solid var(--border-color);
  transition: border-left-color 200ms ease;
}

.log-card:hover {
  border-left-color: var(--primary-color);
}
```

**Skill Tag Hover:**
```css
.log-skill-tag {
  transition: transform 150ms ease,
              box-shadow 150ms ease;
}

.log-skill-tag:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-2);
}
```

### Empty State Animations

**Book Pulse:**
```css
@keyframes bookPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.empty-icon-book {
  animation: bookPulse 2s ease-in-out infinite;
}
```

**Calendar Lift:**
```css
@keyframes calendarLift {
  0%, 100% {
    transform: translateY(0);
    box-shadow: var(--shadow-3);
  }
  50% {
    transform: translateY(-8px);
    box-shadow: var(--shadow-4);
  }
}

.empty-icon-calendar {
  animation: calendarLift 3s ease-in-out infinite;
}
```

**Search Rotate:**
```css
@keyframes searchRotate {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}

.empty-icon-search {
  animation: searchRotate 4s ease-in-out infinite;
}
```

**Staggered Fade-In:**
```css
@keyframes emptyStateFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-state-icon {
  animation: emptyStateFadeIn 0.6s ease-out 0s both;
}

.empty-state-title {
  animation: emptyStateFadeIn 0.6s ease-out 0.2s both;
}

.empty-state-description {
  animation: emptyStateFadeIn 0.6s ease-out 0.4s both;
}

.empty-state-cta {
  animation: emptyStateFadeIn 0.6s ease-out 0.6s both;
}
```

## 📱 Responsive Breakpoints

### Mobile (<768px)

**Skill Cards:**
```
Grid: 1 column
Gap: 16px (reduced from 24px)
Padding: 24px (maintained)
All features preserved
```

**Stat Cards:**
```
Grid: 1 column
Icon: 48px (maintained)
Number: 2.5rem (maintained)
Gradient: Full width
```

**Log Cards:**
```
Timeline: 4px (maintained)
Pills: Wrap naturally
Spacing: Maintained
```

**Empty States:**
```
Icon: 140px (maintained)
Button: Full width option
Animations: Continue
```

## 🎯 Quick Reference

### Font Sizes
```
Skill Name:     1.25rem (20px)
Stat Number:    2.5rem (40px)
Stat Label:     0.8rem (12.8px)
Log Date:       1.125rem (18px)
Log Hours:      0.875rem (14px)
Empty Title:    1.5rem (24px)
Empty Desc:     1rem (16px)
CTA Button:     1.125rem (18px)
```

### Font Weights
```
Skill Name:     700 (bold)
Category:       600 (semi-bold)
Status:         600 (semi-bold)
Stat Number:    700 (bold)
Stat Label:     600 (semi-bold)
Log Date:       700 (bold)
Empty Title:    700 (bold)
CTA Button:     600 (semi-bold)
```

### Shadows
```
Rest:    Level 1 (subtle)
Hover:   Level 2 (raised)
Modal:   Level 3 (floating)
Lift:    Level 4 (emphasized)
```

### Border Radius
```
Badges:  4px (--radius-sm)
Inputs:  8px (--radius-md)
Cards:   12px (--radius-lg)
Modals:  16px (--radius-xl)
Pills:   9999px (--radius-full)
```

---

**This visual guide provides complete reference for implementing and maintaining the modern card design system!**
