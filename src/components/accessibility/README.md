# Accessibility Widget

A comprehensive accessibility widget for the CredApp frontend that provides multiple accessibility options to make the application more inclusive and user-friendly.

## Features

The accessibility widget includes the following features:

### 1. **Text to Speech** 🔊
- Enables read-aloud functionality for text content
- Uses the Web Speech API to speak text when activated

### 2. **Bigger Text** 📝
- Increases the font size across the entire application by 25%
- Improves readability for users with visual impairments

### 3. **Text Spacing** ↔️
- Increases letter spacing and word spacing
- Helps users with dyslexia and reading difficulties

### 4. **Line Height** ↕️
- Doubles the line height for better text separation
- Reduces visual crowding and improves readability

### 5. **Dyslexia Friendly Font** 📖
- Switches to a dyslexia-friendly font (Comic Sans MS / Trebuchet MS)
- These fonts are recommended for users with dyslexia due to their clear letterforms

### 6. **Highlight Links** 🔗
- Makes all links highly visible with yellow background
- Adds bold styling and borders for better identification
- Improves navigation for users with visual impairments

### 7. **Hide Images** 🖼️
- Hides all images and videos on the page
- Reduces visual distractions and improves loading times
- Useful for users with cognitive disabilities or slow connections

### 8. **Large Cursor** 🖱️
- Increases cursor size with custom SVG cursor
- Makes cursor easier to track for users with motor impairments

### 9. **Invert Colors** 🎨
- Inverts all colors on the page
- Provides high contrast mode for users with light sensitivity
- Maintains proper color relationships with hue rotation

## Usage

The accessibility widget is automatically available on all pages through the root layout. Users can:

1. Click the blue floating button in the bottom-right corner
2. Select desired accessibility options from the sidebar
3. Settings are automatically saved to localStorage
4. Click "Reset All Settings" to restore defaults

## Components

### AccessibilityWidget
Main component that combines the button and sidebar.

### AccessibilityButton
Floating action button that opens the accessibility sidebar.

### AccessibilitySidebar
Sidebar panel containing all accessibility options with toggle switches.

### AccessibilityContext
React context that manages accessibility state globally and persists settings.

## Technical Details

- **State Management**: React Context API
- **Persistence**: localStorage
- **Styling**: CSS classes applied to document body
- **Browser APIs**: Web Speech API for text-to-speech
- **Accessibility**: ARIA labels and keyboard navigation support

## CSS Classes

The following CSS classes are applied to the body element:
- `accessibility-bigger-text`
- `accessibility-text-spacing`
- `accessibility-line-height`
- `accessibility-dyslexia`
- `accessibility-highlight-links`
- `accessibility-hide-images`
- `accessibility-large-cursor`
- `accessibility-invert-colors`

## Browser Compatibility

- Text to Speech requires Web Speech API support (Chrome, Edge, Safari)
- All other features work in modern browsers (Chrome, Firefox, Safari, Edge)
- CSS features use standard properties with high browser support

## Future Enhancements

Possible improvements:
- Keyboard shortcuts for quick access
- More color themes (high contrast, dark mode, etc.)
- Adjustable speech rate and voice selection
- Reading mode that focuses on content
- Customizable font sizes with slider
- Animation reduction option

