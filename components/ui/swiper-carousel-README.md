# SwiperCarousel Component

A flexible and customizable carousel/slider component built with Swiper.js for displaying emergency alerts, notifications, news, and other content in a sliding format.

## Features

- 🚨 **Emergency-themed styling** with red color scheme for critical alerts
- 📱 **Responsive design** that works on all screen sizes
- ⚡ **Auto-play functionality** with configurable timing
- 🎯 **Multiple effects** - slide and fade transitions
- 🎛️ **Customizable navigation** - arrows, pagination, or both
- 🎨 **Multiple variants** - emergency, info, news, and default themes
- ❌ **Dismissible alerts** with close buttons
- 🔘 **Action buttons** for each slide
- 🔄 **Loop functionality** for continuous playback

## Installation

The component uses Swiper.js which is already installed:

```bash
npm install swiper
```

## Basic Usage

```jsx
import SwiperCarousel from "@/components/ui/swiper-carousel"

const MyComponent = () => {
  const slides = [
    {
      type: "emergency",
      title: "Critical Alert",
      description: "Emergency situation",
      content: "Details about the emergency...",
      action: {
        label: "View Details",
        variant: "destructive",
        onClick: () => console.log("View details"),
      },
      dismissible: true,
      onDismiss: () => console.log("Dismissed"),
    },
  ]

  return (
    <SwiperCarousel
      slides={slides}
      variant="emergency"
      autoplay={true}
      autoplayDelay={5000}
    />
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `slides` | `Array` | `[]` | Array of slide objects |
| `className` | `string` | `""` | Additional CSS classes |
| `showNavigation` | `boolean` | `true` | Show navigation arrows |
| `showPagination` | `boolean` | `true` | Show pagination dots |
| `autoplay` | `boolean` | `true` | Enable auto-play |
| `autoplayDelay` | `number` | `5000` | Auto-play delay in milliseconds |
| `effect` | `"slide" \| "fade"` | `"slide"` | Transition effect |
| `slidesPerView` | `number` | `1` | Number of slides per view |
| `spaceBetween` | `number` | `30` | Space between slides |
| `loop` | `boolean` | `true` | Enable loop mode |
| `onSlideChange` | `function` | - | Callback when slide changes |
| `variant` | `"default" \| "emergency" \| "info" \| "news"` | `"default"` | Visual theme |

## Slide Object Structure

```typescript
interface Slide {
  type: "emergency" | "info" | "news" | string
  title?: string
  description?: string
  content?: string
  action?: {
    label: string
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    onClick: () => void
  }
  dismissible?: boolean
  onDismiss?: () => void
}
```

## Variants

### Emergency (Red Theme)
- Red background and borders
- Alert triangle icons
- Destructive action buttons
- Perfect for critical alerts

### Info (Blue Theme)
- Blue background and borders
- Info icons
- Outline action buttons
- Great for informational content

### News (Gray Theme)
- Gray background and borders
- News icons
- Default action buttons
- Ideal for news and updates

### Default (Neutral Theme)
- Neutral colors
- Generic styling
- Versatile for any content

## Examples

### Emergency Alerts
```jsx
const emergencyAlerts = [
  {
    type: "emergency",
    title: "Critical Flood Alert",
    description: "Severe flooding reported in Accra Central",
    content: "Water levels rising rapidly. Emergency services deployed.",
    action: {
      label: "View Details",
      variant: "destructive",
      onClick: () => handleEmergencyDetails(),
    },
    dismissible: true,
    onDismiss: () => dismissAlert("flood"),
  },
]

<SwiperCarousel
  slides={emergencyAlerts}
  variant="emergency"
  autoplay={true}
  autoplayDelay={4000}
  showNavigation={true}
  showPagination={true}
/>
```

### Information Updates
```jsx
const infoUpdates = [
  {
    type: "info",
    title: "System Maintenance",
    description: "Scheduled maintenance tonight",
    content: "System will be offline from 2-4 AM for routine maintenance.",
    action: {
      label: "Learn More",
      variant: "outline",
      onClick: () => showMaintenanceInfo(),
    },
    dismissible: true,
    onDismiss: () => dismissInfo("maintenance"),
  },
]

<SwiperCarousel
  slides={infoUpdates}
  variant="info"
  autoplay={true}
  autoplayDelay={6000}
  effect="fade"
  showNavigation={true}
  showPagination={false}
/>
```

### News Items (Multi-slide)
```jsx
const newsItems = [
  {
    type: "news",
    title: "New Emergency Protocols",
    description: "Updated response procedures",
    content: "NADMO has implemented new emergency response protocols.",
    action: {
      label: "Read More",
      variant: "outline",
      onClick: () => readArticle(),
    },
    dismissible: false,
  },
]

<SwiperCarousel
  slides={newsItems}
  variant="news"
  autoplay={false}
  slidesPerView={2}
  spaceBetween={20}
  showNavigation={true}
  showPagination={true}
/>
```

## Advanced Configuration

### Custom Styling
```jsx
<SwiperCarousel
  slides={slides}
  className="my-custom-class"
  variant="emergency"
/>
```

### Event Handling
```jsx
<SwiperCarousel
  slides={slides}
  onSlideChange={(swiper) => {
    console.log("Current slide:", swiper.activeIndex)
  }}
/>
```

### Manual Control
```jsx
const swiperRef = useRef(null)

<SwiperCarousel
  ref={swiperRef}
  slides={slides}
  autoplay={false}
  showNavigation={true}
/>

// Later, you can control the swiper programmatically
const goToNext = () => swiperRef.current?.swiper.slideNext()
const goToPrev = () => swiperRef.current?.swiper.slidePrev()
```

## Integration with NADMO Dashboard

The component is already integrated into the NADMO dashboard (`app/nadmo/dashboard/page.jsx`) to display live emergency alerts. You can see it in action by navigating to the NADMO dashboard.

## Demo Component

A comprehensive demo component is available at `components/ui/swiper-demo.jsx` that showcases all the different configurations and variants.

## Styling

The component uses Tailwind CSS classes and can be customized by:

1. Modifying the `getVariantStyles()` function in the component
2. Adding custom CSS classes via the `className` prop
3. Overriding specific styles in your global CSS

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Dependencies

- Swiper.js
- Lucide React (for icons)
- Tailwind CSS
- React (with hooks)

## License

This component is part of the GES Education App and follows the same license terms.
