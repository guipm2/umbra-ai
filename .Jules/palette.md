## 2025-02-23 - Accessibility in Raw Inputs
**Learning:** This app uses raw HTML `<input>` elements with placeholders but without `<label>` tags or `aria-label` attributes, making them inaccessible to screen readers and harder to target in tests.
**Action:** When working on forms in this repo, always check for missing labels and add `aria-label` if visible labels cannot be added due to design constraints.
