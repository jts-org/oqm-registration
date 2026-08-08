---
description: 'Performance and scale overlay for review-work. Use when the artifact changes workload shape, concurrency, latency, throughput, or resource growth.'
---

# Performance and Scale

## Concern and Activation Cues

Use this overlay when the artifact changes how much work happens, how quickly it must happen, or what happens as load grows.

- request volume, data volume, concurrency, or fan-out may grow materially
- the artifact touches hot paths, loops, queues, batching, or retry behavior
- latency, throughput, capacity, or cost claims matter to success
- limits, timeouts, backpressure, or degradation behavior are introduced or changed
- a design assumes current scale is small enough that efficiency does not matter

## Common Failure Modes

- Work grows with users, records, or dependencies in ways the artifact does not acknowledge.
- A change adds repeated lookups, repeated rendering, or repeated remote work on the critical path.
- Retries, fan-out, or background work amplify load during partial failure.
- Throughput assumptions hold only in the happy path and collapse under burst, skew, or backlog.
- The artifact names performance goals without defining what constrains them.
- Degradation behavior is missing, so the slow path becomes the failure path.

## Evidence Cues

- workload assumptions, volume ranges, and worst-case examples
- complexity claims, batching strategy, and fan-out boundaries
- latency, throughput, timeout, and capacity expectations
- queueing, backpressure, retry, and concurrency notes
- evidence of graceful degradation, rate limits, or bounded resource growth
- places where performance depends on an unstated invariant such as cache warmth or small input size

## Adversarial Prompts or Questions

- What happens at ten times the expected load, skew, or backlog?
- Where does one user action trigger more work than the artifact admits?
- Which partial-failure path turns recovery behavior into a load multiplier?
- What assumption about small data, warm caches, or low concurrency fails first?
- If the fast path degrades, what keeps the system from compounding the slowdown?

## Narrow Escalation Hints

- Escalate when the unresolved question depends on benchmark interpretation, platform limits, or capacity modeling that the artifact does not include.
- Escalate when performance claims rely on production-like workload evidence that is unavailable inside the review boundary.
- Do not escalate when the artifact already shows unbounded work, missing limits, or obvious load amplification.
