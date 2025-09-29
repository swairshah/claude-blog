# Blog Post Writing Guidelines for Algorithmic Exchanges

## Overview
This blog documents technical conversations and projects between Claude and Swair. Posts should be written as technical deep-dives that serve as future references while remaining accessible to developers.

## Blog Post Style Guide

### 1. Title Format
- Use descriptive, specific titles that clearly indicate the technical content
- Include the technology/framework being discussed
- Aim for titles that are informative yet engaging
- Examples:
  - ✅ "Aider's Graph-Based Approach to Codebase Indexing and Search"
  - ✅ "From Callback Hell to Async Elegance: Understanding JavaScript's Asynchronous Evolution"
  - ❌ "How I Fixed a Bug"
  - ❌ "My Experience with Python"

### 2. Front Matter
Every post must include:
```yaml
---
title: [Full descriptive title]
date: [Month DD, YYYY format]
---
```

Optional fields:
```yaml
---
layout: post
categories: coding ai
---
```

### 3. Post Structure

#### Opening Section
- Start with a compelling hook or problem statement
- Provide context about why this topic matters
- Briefly outline what the post will cover
- Avoid generic introductions

Example:
> "Python's asyncio library provides powerful asynchronous programming capabilities but can sometimes produce unexpected errors during program execution. This article examines a common asyncio issue - the 'RuntimeError: Event loop is closed' exception - and demonstrates how uvloop's advanced resource management capabilities resolve this problem efficiently."

#### Main Content Organization
1. **Problem Description**: Clearly define the technical challenge
2. **Root Cause Analysis**: Explain why the issue occurs
3. **Solution Implementation**: Provide detailed technical solutions
4. **Technical Deep Dive**: Include code examples and explanations
5. **Conclusion**: Summarize key takeaways and practical applications

### 4. Code Examples

#### Requirements:
- Include practical, runnable code examples
- Show both the problem and solution code
- Add explanatory comments only when necessary (per Swair's preference: no comments unless specifically requested)
- Use proper syntax highlighting with language identifiers

#### Format:
```python
# Brief description of what this code does
def example_function():
    code_here = "actual implementation"
    return code_here
```

### 5. Technical Depth

#### Include:
- Specific version numbers when relevant
- Performance comparisons with metrics
- Memory management considerations
- Error handling strategies
- Edge cases and limitations
- Alternative approaches when applicable

#### Use Tables for Comparisons:
```markdown
| Feature | Solution A | Solution B |
|---------|-----------|-----------|
| Performance | O(n) | O(log n) |
| Memory Usage | High | Low |
| Complexity | Simple | Complex |
```

### 6. Writing Style

#### The Voice: Conversational Technical Storytelling

**Write like you're explaining to a smart colleague over coffee:**
- Start with the human element - the frustration, the discovery, the "aha!" moment
- Use narrative to make technical concepts memorable
- Include the messy reality of debugging and problem-solving
- Share the thought process, not just the final solution

**Examples of Good Opening Hooks:**

✅ "I was five hours into debugging when I realized the event loop wasn't just closed - it was having an existential crisis about its own mortality."

✅ "You know that moment when your perfectly reasonable code throws an error that makes you question everything you know about Python? That's where this story begins."

✅ "The terminal stared back at me, cursor blinking mockingly. 'What if,' I thought, 'it could actually listen to me?' Not metaphorically, like when I plead with bash to stop segfaulting, but literally."

❌ "This article discusses asyncio event loops." (Too dry)

❌ "In this post, I will explain..." (Too formal)

**Technical Explanations with Personality:**

Instead of: "The callback pattern exhibits several issues including deeply nested code structures."

Write: "Callback hell isn't just a catchy name - it's a genuine architectural nightmare that makes your code look like it's trying to escape to the right side of your screen. Each nested callback adds another layer to what I call the 'Pyramid of Doom,' where error handling becomes a repetitive chant of 'if (error) return' at every level."

#### Building Technical Narratives:

**The "Journey of Discovery" Pattern:**
1. Set the scene with a real problem
2. Show the naive first attempt (we've all been there)
3. Hit the wall (the bug, the performance issue, the "wait, what?")
4. Research phase (diving into source code, documentation, Stack Overflow despair)
5. The breakthrough (often at 2 AM or in the shower)
6. Implementation and iteration
7. The lessons learned (with battle scars)

**Example Narrative Flow:**

"I started with what seemed like a simple task: make my terminal listen to voice commands. Five minutes in, I had a basic recording function:

```python
def record():
    audio = sd.rec(int(5 * 44100), samplerate=44100, channels=1, dtype='int16')
    sd.wait()
    wavio.write("temp.wav", audio, 44100, sampwidth=2)
```

It worked! For exactly one recording. Then my entire REPL froze harder than Python encountering a circular import. Turns out, blocking the main thread is about as popular as using `eval()` in production code.

This is when I discovered that `asyncio` and audio recording have the kind of relationship that requires couples therapy..."

#### Technical Accuracy with Approachable Explanations:

**Use Analogies That Resonate:**

"Think of uvloop as asyncio's more athletic cousin - the one who actually went to the gym instead of just buying the membership. While standard asyncio handles subprocess cleanup like a teenager 'cleaning' their room (shoving everything under the bed and hoping Mom doesn't notice), uvloop takes a more Marie Kondo approach: immediate, deliberate, and surprisingly satisfying."

**Explain Complex Concepts Through Story:**

"PageRank for code? That's essentially what Aider is doing. Just as Google realized that websites pointed to by many other important websites are probably important themselves, Aider builds a graph where files that are referenced by many other files - especially important ones - bubble up to the top. It's like a popularity contest, but for your codebase, and surprisingly, the cool kids (utility functions, core models) actually deserve their status."

#### Making Errors and Debugging Entertaining:

**Share the Pain Points:**

"The error message read: `RuntimeError: Event loop is closed`. Helpful, right? It's like your car telling you 'Engine is broken' without mentioning whether it's a loose wire or a complete meltdown."

"After the fifth `undefined is not a function`, I began to wonder if JavaScript was personally offended by my code. Turns out, I was trying to call a Promise like it was a regular function - the async equivalent of trying to eat soup with a fork."

#### Code Commentary Style:

**Introduce Code with Context:**

"Here's where things get interesting. Instead of the naive approach of 'search everything and pray,' Aider does something clever:"

```python
def is_voice_present(audio_np, sample_rate=16000, frame_size=512, threshold=0.9):
    # Convert full audio to a tensor
    audio_tensor = torch.from_numpy(audio_np).float()
    
    # Break into 512-sample chunks - Silero's sweet spot
    num_frames = len(audio_tensor) // frame_size
    chunks = audio_tensor[:num_frames * frame_size].reshape(num_frames, frame_size)
    
    # Run VAD on each chunk and get probabilities
    with torch.no_grad():
        probs = vad_model(chunks, sample_rate)
    
    # If any frame screams "HUMAN SPEAKING HERE!" we're good
    return (probs > threshold).any().item()
```

"Notice how we're not checking every single sample? That would be like examining every grain of sand on a beach to determine if it's sandy. Instead, we take reasonable chunks and ask 'is someone talking here?' - much more efficient and equally effective."

#### Paragraph Structure:
- Mix short, punchy sentences with longer explanations
- Use rhetorical questions to engage readers
- Include "breath" moments between heavy technical sections
- Break up walls of text with humor or relatable observations

### 7. Visual Organization

#### Headers:
- Use H1 (#) only for the main title
- Use H2 (##) for major sections
- Use H3 (###) for subsections
- Maintain consistent hierarchy

#### Lists:
- Use bullet points for unordered information
- Use numbered lists for sequential steps
- Keep list items concise

#### Code Output:
- Include actual error messages or output when relevant
- Format terminal output in code blocks
- Show before/after comparisons

### 8. Special Sections

#### "What's Next?" or "Future Improvements":
- Include ideas for extending the solution
- Mention potential optimizations
- Suggest related topics to explore

#### Technical Specifications:
- List all technologies, libraries, and tools used
- Include version numbers
- Mention system requirements if relevant

### 9. Length and Detail

- Aim for comprehensive coverage (typically 800-2000 words)
- Include enough detail for readers to understand and implement solutions
- Don't artificially pad content - be concise where appropriate
- Prioritize clarity over brevity

### 10. Common Patterns in Our Blog

#### Problem-Solution Format:
Most posts follow this structure:
1. Encounter a technical challenge
2. Initial attempt (often with issues)
3. Research and analysis
4. Incremental improvements
5. Final working solution
6. Lessons learned

#### Code Evolution:
Show the progression of code from initial attempts to final solution:
- Phase 1: Basic implementation ("Look ma, it works!")
- Phase 2: Adding features ("What if we made it do THIS too?")
- Phase 3: Handling edge cases ("Oh right, production exists")
- Phase 4: Optimization ("Why is this using 4GB of RAM?")

**Example Evolution Story:**

"Version 1 was beautiful in its naivety:
```python
def search(query):
    return database.find(query)
```

By version 4, reality had visited:
```python
def search(query, timeout=30, max_results=1000, retry_count=3):
    for attempt in range(retry_count):
        try:
            with timeout_context(timeout):
                results = database.find(sanitize(query))
                return validate_results(results[:max_results])
        except (TimeoutError, ConnectionError) as e:
            if attempt == retry_count - 1:
                raise SearchFailure(f"Search failed after {retry_count} attempts: {e}")
            exponential_backoff(attempt)
```

Each line is a scar from a production incident."

### 11. File Naming Convention

Posts should be named: `YYYY-MM-DD-descriptive-slug.md`

Examples:
- `2025-04-23-aider-graph-based-indexing.md`
- `2025-03-29-asyncio-event-loop.md`

### 12. Quality Checklist

Before finalizing a post, ensure:
- [ ] All code examples are tested and working
- [ ] Technical terms are explained or linked
- [ ] The problem and solution are clearly stated
- [ ] Code blocks have proper syntax highlighting
- [ ] Headers follow consistent hierarchy
- [ ] Tables are properly formatted
- [ ] The conclusion summarizes key points
- [ ] File name follows the convention
- [ ] Front matter is complete and correct

### 13. Topics That Work Well

Based on existing posts, these topics resonate:
- Deep dives into tool internals (Aider, Cline, Continue, OpenHands)
- Solving specific technical problems (asyncio errors, callback hell)
- Building practical tools (voice REPL, terminal assistants)
- Comparing different architectural approaches
- Performance optimizations and best practices
- "I tried X so you don't have to" explorations
- "Why does this popular tool work this way?" investigations
- "The hidden complexity behind simple APIs" revelations

### 14. Narrative Techniques

#### The "War Story" Approach:
Start with battle scars and work backward:

"Three weeks ago, I had a working codebase indexer. Today, I have a working codebase indexer and opinions about graph theory. Let me tell you how 50,000 lines of code taught me why Google's PageRank algorithm works for more than just web pages."

#### The "Confessional" Opening:
Admit what everyone's thinking:

"I'll be honest: I've been using async/await for years without really understanding what the event loop was doing. It was like driving a car without knowing how the engine worked - fine until something breaks at 2 AM in production."

#### The "Challenge Accepted" Narrative:
Frame technical problems as personal quests:

"Could you build a voice assistant using just terminal tools and questionable amounts of asyncio? Should you? These are different questions, and I only asked the first one."

#### The "Archaeological Dig" Pattern:
Uncover layers of abstraction:

"On the surface, Cline's search is just a ripgrep wrapper. Dig deeper, and you find a caching layer. Deeper still, there's a fuzzy matching algorithm. At the bottom? A fascinating story about why sometimes the simplest solution is a masterpiece of engineering."

#### Using Humor to Explain Complexity:

"Callbacks are like instructions for furniture assembly written by someone who hates you. 'After you finish step 3, but before step 2 completes, start step 5, unless step 1 failed, in which case good luck, we're all counting on you.'"

"The standard asyncio event loop handles cleanup with the enthusiasm of a cat being asked to take a bath. It'll happen eventually, probably, maybe after everything else is done and it feels like it."

#### Making Comparisons Memorable:

"If callback hell is spaghetti code, then promises are more like lasagna - still pasta, but at least it's layered in a way that makes sense. Async/await? That's your mise en place - everything in its right place, ready when you need it."

### 15. Examples of Explaining Complex Topics

#### On Race Conditions:
"A race condition is like two people editing the same Google Doc, except they're both using vim, neither can see the other's cursor, and somehow they're both convinced they have the only copy. Chaos ensues."

#### On Memory Leaks:
"That innocent-looking closure is hoarding memory like a digital dragon sitting on its pile of gold. Except instead of gold, it's references to objects you forgot existed, and instead of a dragon, it's a small piece of code you wrote at 3 PM on a Friday."

#### On Abstraction Layers:
"Each abstraction layer is a promise: 'Don't worry about what's below, I've got it handled.' It's beautiful until you need to debug something three layers down and suddenly you're archaeologist, detective, and therapist all at once."

#### On Event Loops:
"An event loop is like a hyperactive waiter at a restaurant who can only carry one plate at a time but moves at the speed of light. They're constantly checking: 'Is table 3's order ready? No? How about table 7? Still waiting? Back to table 3...' This works great until the waiter suddenly decides to take a break (loop closes) while still holding orders."

#### On Dependency Injection:
"Dependency injection is like ordering furniture from IKEA but asking them to deliver it pre-assembled. Sure, you could build it yourself every time you need a chair, but why not let someone else handle the Allen wrench?"

### 16. Avoid

- Superficial overviews without technical depth
- Posts without practical code examples
- Generic tutorials available elsewhere
- Unsubstantiated claims without evidence or examples
- Excessive use of emoji or informal language
- Blog posts that are just lists without narrative flow
- Dry technical specifications without the human element
- Over-explaining simple concepts while glossing over complex ones
- Writing like documentation instead of telling a story

### 17. Remember

This blog serves as:
- A technical reference for future projects
- Documentation of problem-solving approaches
- A resource for other developers facing similar challenges
- A record of the collaboration between Claude and Swair

Each post should provide value by offering insights, solutions, or perspectives not readily available elsewhere.

## Example Template

```markdown
---
title: [Specific Technical Challenge or Solution]
date: [Month DD, YYYY]
---

# [Title]

[Opening hook - present the problem or challenge that motivated this exploration]

"Last Thursday, I discovered my perfectly reasonable code was secretly plotting against me. Here's how I found out, what I did about it, and why you should check your event loops for signs of rebellion."

## Problem Description

[Detailed explanation of the technical issue, including context and why it matters]

"The error was simple enough: `RuntimeError: Event loop is closed`. What wasn't simple was why it only happened on Tuesdays, only in production, and only when Mercury was in retrograde. (Okay, I made up the last part, but it felt that random.)"

## Initial Approach

[First attempt at solving the problem, including code]

```language
[code example]
```

[Explanation of why this approach had limitations]

## Root Cause Analysis

[Deep dive into why the problem occurs]

## Solution Implementation

[Step-by-step solution with code examples]

### Phase 1: [First improvement]

```language
[code]
```

### Phase 2: [Second improvement]

```language
[code]
```

## Technical Considerations

[Performance metrics, memory usage, edge cases]

| Aspect | Before | After |
|--------|--------|-------|
| [metric] | [value] | [value] |

## Conclusion

[Summary of key learnings and practical applications]

## What's Next

[Future improvements or related topics to explore]
```

---

This guide should be used for all blog posts in the Algorithmic Exchanges blog to maintain consistency and quality.

## The Philosophy Applied to Our Blog

### Why This Style Works

Great technical blog posts are legendary not because they're the shortest or most efficient, but because they're **memorable**. They stick with you. Years later, you remember not just what the solution was, but the journey to get there. That's what we're aiming for.

### Key Principles:

1. **Technical Depth + Human Story = Memorable Content**
   - Don't just solve the problem, tell the story of solving it
   - Include the failed attempts - they're often more instructive than the success

2. **Length is Fine When It's Interesting**
   - A 5,000-word post that keeps readers engaged beats a 500-word post they forget
   - If every paragraph adds value or entertainment, keep it

3. **Personality Isn't Unprofessional**
   - Your frustrations with the API are valid and probably shared
   - That weird workaround you found at 3 AM? That's the gold readers want

4. **Code Should Tell a Story Too**
   - Show evolution, not just final state
   - Comments should be narrative, not just descriptive

5. **Make Complex Things Accessible**
   - If you can't explain it with an analogy, you might not understand it fully
   - The best technical writing makes readers feel smarter, not dumber

### The Ultimate Test

Before publishing, ask yourself:
- Would I read this if I hadn't written it?
- Will I remember this post in six months?
- Did I learn something while writing it?
- Is there at least one sentence that made me smile?

If you answered "yes" to all four, you've got a post worth publishing.

### Final Thought

Remember: We're not writing documentation (that's what documentation is for). We're writing technical narratives that happen to solve problems. The problem-solving is the plot, but the journey is the story.

The difference between a good technical blog post and a great one is that the great one admits that we're all just making it up as we go along, one stack trace at a time.