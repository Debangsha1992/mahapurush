<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Agent skills

### Engineering workflow

Use this skill sequence when taking a feature from request to production:

```
Feature request
    ↓
writing-plans
    ↓
test-driven-development
    ↓
Implementation fails?
    └── systematic-debugging
    ↓
webapp-testing + code-security
    ↓
requesting-code-review
    ↓
verification-before-completion
    ↓
github-actions-hardening
    ↓
multi-stage-dockerfile
    ↓
Deployment
    ↓
Sentry instrumentation and production monitoring
```

Invoke each step with `/skill-name` in Agent chat. Loop back to `systematic-debugging` whenever implementation is blocked; do not skip ahead to review or deployment until the current stage is satisfied.
