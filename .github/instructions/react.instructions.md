---
applyTo: "frontend/**/*.ts,frontend/**/*.tsx"
---

# React Guidelines

## Imports

- Prefer direct imports for React hooks and related helpers, for example:
    - `import { useState, useMemo, useEffect, useCallback, useRef } from "react";`
- Do not use namespaced access like `React.useState`, `React.useMemo`, or `React.useEffect` in this project.
- Keep using `import * as React from "react"` only when needed for React types, JSX runtime compatibility, or other
  non-hook React APIs.
