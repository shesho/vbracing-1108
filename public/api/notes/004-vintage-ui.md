---
title: "Vintage Terminal UI Design"
date: "2025-11-08T18:15:00Z"
tags: ["design", "ui", "aesthetic"]
excerpt: "Green-on-black terminal aesthetic. Inspired by 80s/90s development environments."
---

# Vintage Terminal UI Design

## Design Philosophy
Minimalist hacker aesthetic. Carmack's .plan files were plain text in terminal emulators. This captures that spirit in a web context.

## Color Palette
- Background: #0c0c0c (near black)
- Primary text: #00ff00 (bright green)
- Secondary text: #00aa00 (dimmer green)
- Accent: #00cc00
- Borders: #004400
- Hover backgrounds: #003300, #001100

## Typography
Courier New, monospace throughout. No font variations. Size hierarchy through scale only.

## Component Styles
- Note cards: dark green background, green border, brighten on hover
- Links: dotted underline, green background on hover
- Tags: inline blocks, bordered, small text
- Code blocks: darker background, green text, bordered

## Layout
- Max width 900px (readable line length)
- 20px padding (breathing room)
- Header/footer separated by borders
- No sidebars, no navigation chrome
- Mobile: reduce padding, scale fonts down

## No JavaScript Required
Pure CSS styling. No animations, no transitions, no dynamic theme switching. Just render the HTML.

The aesthetic should feel like SSH'd into a remote server reading developer logs.

