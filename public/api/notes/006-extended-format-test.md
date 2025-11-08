---
title: "Extended Format Test"
tagline: "Testing all extended frontmatter fields"
date: "2025-11-08T19:00:00Z"
description: "A comprehensive test of all extended frontmatter fields including tagline, author, image, and HTML support in markdown content."
author: "Test Author"
image: "https://via.placeholder.com/800x400/0c0c0c/00ff00?text=Test+Image"
tags: ["test", "format", "extended"]
---

# Extended Format Test

This note tests all the extended format features.

## Frontmatter Fields

This note includes:
- **title**: Extended Format Test
- **tagline**: Testing all extended frontmatter fields
- **author**: Test Author
- **image**: Placeholder image URL
- **description**: Used as fallback for excerpt
- **tags**: test, format, extended

## HTML Support

Let's test embedded HTML in markdown:

<div class="flex flex-col gap-4" style="border: 1px solid #00ff00; padding: 10px; margin: 10px 0;">
  <p style="color: #00ff00;">This is HTML content embedded in markdown!</p>
  <p style="color: #00aa00;">With multiple paragraphs and inline styling.</p>
</div>

## Image References

Standard markdown image syntax:

![Test Image](https://via.placeholder.com/600x300/0c0c0c/00ff00?text=Markdown+Image)

Reference-style image:

![][testimg]

[testimg]: https://via.placeholder.com/600x300/0c0c0c/00aa00?text=Reference+Image

## Conclusion

If you can see:
1. ✅ The featured image at the top
2. ✅ The tagline below the title
3. ✅ The author name
4. ✅ HTML content properly rendered
5. ✅ All images displaying

Then the extended format support is working perfectly!

