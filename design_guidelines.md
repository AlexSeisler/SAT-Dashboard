# SAT Roadmap Design Guidelines

## Design Approach

**Hybrid Approach**: Drawing from Linear's calm minimalism and Notion's focused hierarchy, combined with Material Design's clear feedback patterns for educational contexts. This platform prioritizes psychological safety and clarity over visual flair.

**Core Principle**: Every design decision must reduce cognitive load and anxiety while building confidence.

## Typography System

**Font Stack**:
- Primary: Inter (via Google Fonts) - body text, UI elements
- Display: Cal Sans (or Poppins as fallback) - large headings only

**Hierarchy**:
- Hero/Dashboard Headings: 3xl-4xl, semibold
- Section Headers: xl-2xl, semibold  
- Card Titles: lg, medium
- Body Text: base, regular (line-height relaxed for readability)
- Supporting Text: sm, regular
- Micro Labels: xs, medium, uppercase tracking-wide

**Reading Optimization**: Max-width of prose (65ch) for all instructional content. Use text-base with leading-7 for comfortable reading during study sessions.

## Layout System

**Spacing Primitives**: Use Tailwind units of 3, 4, 6, 8, 12, 16 consistently (p-4, gap-6, space-y-8, etc.)

**Grid Structure**:
- Dashboard: Asymmetric 2-column layout (primary content 2/3, sidebar 1/3)
- Roadmap: Vertical scrolling with horizontal topic swimlanes
- Learning Zones: Single-column centered (max-w-3xl) for focused attention
- Cards: Consistent 16px padding, 8px gap between elements

**Responsive Behavior**: 
- Desktop (lg+): Multi-column layouts with sidebars
- Tablet (md): Stack to 2-column where logical
- Mobile: Single column, full-width cards with 16px screen margins

## Component Library

### Navigation
- Top navigation bar: Minimal, sticky, with logo, current section indicator, and profile
- Breadcrumbs: Show path context (Dashboard > Math > Algebra > Topic)
- Sidebar: Persistent on dashboard with section icons and labels

### Progress Indicators
- **Readiness State Badge**: Large, prominent pill with icon and text ("On Track", "Borderline", "At Risk")
- **Score Display**: Current vs Target in large numerals with subtle progress bar beneath
- **Mastery Nodes**: Circular badges with state-based styling (Unseen: outline, In Progress: partial fill, Shaky: dashed border, Solid: filled)
- **Streak Counter**: Minimalist number display with subtle flame/calendar icon

### Cards & Containers
- **Recommendation Cards**: Elevated shadow, clear hierarchy with icon, title, explanation text, and impact metric
- **Topic Cards**: Horizontal layout with thumbnail, title, mastery indicator, and action button
- **Learning Zone Container**: Clean white background, generous padding, clear section divisions
- **Progress Cards**: Minimal border, internal padding, trend arrow indicators

### Interactive Elements
- **Primary Actions**: Medium-sized buttons with rounded corners, clear labels ("Start Topic", "Continue Learning")
- **Secondary Actions**: Ghost buttons or text links
- **Checkpointed Video Player**: Custom controls with checkpoint markers on progress bar
- **Assessment Questions**: Radio/checkbox inputs with generous touch targets, clear selection states

### Chatbot
- **Persistent Panel**: Slide-out drawer from right side, accessible via fixed button
- **Message Bubbles**: Student messages aligned right, bot responses left with gentle background
- **Context Awareness**: Show current topic/section at top of chat panel

### Data Visualization
- **Progress Charts**: Line charts for score projection with confidence interval shading
- **Mastery Overview**: Horizontal bar charts showing topic completion percentage
- **Error Pattern Display**: Simple category grouping with count badges

### Feedback & States
- **Success States**: Subtle check icon with encouraging text
- **Error Patterns**: Non-judgmental language with constructive guidance
- **Loading States**: Minimal skeleton screens, no aggressive spinners
- **Empty States**: Calm illustrations with clear next-step guidance

## Visual Language

**Borders & Shadows**: 
- Primary cards: 1px border with subtle shadow (shadow-sm)
- Elevated elements: shadow-md
- Interactive hover: shadow-lg transition

**Corner Radius**: 
- Cards: rounded-lg (8px)
- Buttons: rounded-md (6px)
- Badges: rounded-full

**Spacing Rhythm**:
- Section padding: py-12 to py-16
- Card internal: p-6
- Element gaps: gap-4 to gap-6
- List items: space-y-3

## Animations

**Minimal & Purposeful Only**:
- Page transitions: Simple fade (200ms)
- Card hover: Subtle lift (shadow change only)
- State changes: Smooth 150ms ease transitions
- Progress updates: Animated number counting for score changes
- NO: Loading spinners, bouncing elements, celebratory explosions

## Images

**Strategic Placement**:
- **Dashboard Hero**: Small, calming abstract geometric pattern as background (not full-bleed) in header area only
- **Topic Thumbnails**: Simple icon-based illustrations representing each topic category (not photographic)
- **Empty States**: Minimal line-art illustrations that are supportive, not cutesy
- **Video Thumbnails**: Frame captures from instructional content

**Image Treatment**: All imagery should feel professional, calm, and educational - avoid stock photo aesthetics.

## Emotional Design Considerations

- Use encouraging micro-copy throughout ("Nice progress", "You've got this")
- Show trends positively ("Improving" vs "Still weak")
- Frame setbacks as learning opportunities
- Make "override recommendations" feel empowering, not rebellious
- Daily check-ins use conversational, judgment-free language

## Accessibility Standards

- All interactive elements minimum 44px touch target
- WCAG AA contrast ratios throughout
- Focus indicators visible and distinct
- Screen reader labels for all icons and charts
- Keyboard navigation for all workflows

This design system creates a calm, trustworthy learning environment that guides without overwhelming, motivates without pressuring, and adapts without patronizing.