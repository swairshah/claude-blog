---
layout: post
title: OpenHands' Memory and Condensation System for Code Understanding
date: 2025-04-23
categories: coding ai
---

# OpenHands' Memory and Condensation System for Code Understanding

## Introduction

OpenHands takes a different approach to codebase understanding compared to other AI coding assistants. Instead of focusing heavily on preprocessing and indexing, OpenHands emphasizes efficient real-time search, chunking, and memory condensation. This unique approach enables OpenHands to work with large codebases while maintaining context efficiency.

## Memory and Condensation: The Core Innovation

The heart of OpenHands' approach lies in its memory and condensation system, located in the `openhands/memory` directory. This system optimizes context window usage by intelligently summarizing chunks of conversation events:

```python
class Condenser(ABC):
    """Abstract condenser interface.
    
    Condensers take a list of `Event` objects and reduce them into a potentially smaller list.
    """

    def __init__(self):
        self._metadata_batch: dict[str, Any] = {}
        self._llm_metadata: dict[str, Any] = {}
        
    @abstractmethod
    def condense(self, View) -> View | Condensation:
        """Condense a sequence of events into a potentially smaller list."""
        
    def condensed_history(self, state: State) -> View | Condensation:
        """Condense the state's history."""
        self._llm_metadata = state.to_llm_metadata('condenser')
        with self.metadata_batch(state):
            return self.condense(state.view)
```

## Multiple Condenser Strategies for Different Scenarios

OpenHands supports multiple condenser types, configured in `openhands/core/config/condenser_config.py`, including:

1. **LLMSummarizingCondenser**: Uses an LLM to create summaries of forgotten events
2. **AmortizedForgettingCondenser**: Gradually forgets old events when history grows too large
3. **BrowserOutputCondenser**: Specialized handler for browser output with masking capabilities
4. **ObservationMaskingCondenser**: Masks older observations while maintaining an attention window

A specialized `RollingCondenser` base class is provided for condensers that need to apply their logic to a rolling history:

```python
class RollingCondenser(Condenser, ABC):
    """Base class for a specialized condenser strategy that applies condensation to a rolling history."""

    @abstractmethod
    def should_condense(self, view: View) -> bool:
        """Determine if a view should be condensed."""

    @abstractmethod
    def get_condensation(self, view: View) -> Condensation:
        """Get the condensation from a view."""

    def condense(self, view: View) -> View | Condensation:
        if self.should_condense(view):
            return self.get_condensation(view)
        else:
            return view
```

## Efficient Search Tools: Ripgrep Wrappers

For codebase search, OpenHands provides sophisticated tools exposed as function calls to the LLM/agent, including a `GrepTool` that wraps around ripgrep (`rg`) for fast regex-based code searching:

```python
class GrepTool:
    """Fast content search tool that works with any codebase size"""
    
    def __call__(self, pattern: str, path: str = None, include: str = None):
        """
        Searches file contents using regular expressions
        
        Args:
            pattern: The regex pattern to search for
            path: Optional directory to search in
            include: Optional file pattern to include
            
        Returns:
            Matching file paths sorted by modification time
        """
        cmd = ["rg", "--no-ignore", "--hidden", "--glob", "!.git"]
        
        if include:
            cmd.extend(["--glob", include])
            
        cmd.extend(["--json", pattern])
        
        if path:
            cmd.append(path)
```

OpenHands also includes a `GlobTool` that uses ripgrep's `--files` mode for fast file pattern matching:

```python
class GlobTool:
    """Fast file pattern matching tool"""
    
    def __call__(self, pattern: str, path: str = None):
        """
        Find files matching a glob pattern
        
        Args:
            pattern: The glob pattern to match against
            path: Optional directory to search in
            
        Returns:
            List of matching file paths sorted by modification time
        """
        cmd = ["rg", "--files", "--no-ignore", "--hidden", "--glob", "!.git", "--glob", pattern]
        
        if path:
            cmd.append(path)
```

## Chunk Localization: Finding Relevant Code Segments

OpenHands implements a specialized chunk localization system to identify the most relevant chunks in a file:

```python
def normalized_lcs(chunk: str, query: str) -> float:
    """Calculate the normalized Longest Common Subsequence (LCS) to compare file chunk with the query.

    We normalize Longest Common Subsequence (LCS) by the length of the chunk
    to check how **much** of the chunk is covered by the query.
    """
    if len(chunk) == 0:
        return 0.0
    _score = pylcs.lcs_sequence_length(chunk, query)
    return _score / len(chunk)


def get_top_k_chunk_matches(
    text: str, query: str, k: int = 3, max_chunk_size: int = 100
) -> list[Chunk]:
    """Get the top k chunks in the text that match the query."""
    raw_chunks = create_chunks(text, max_chunk_size)
    chunks_with_lcs: list[Chunk] = [
        Chunk(
            text=chunk.text,
            line_range=chunk.line_range,
            normalized_lcs=normalized_lcs(chunk.text, query),
        )
        for chunk in raw_chunks
    ]
    sorted_chunks = sorted(
        chunks_with_lcs,
        key=lambda x: x.normalized_lcs,
        reverse=True,
    )
    return sorted_chunks[:k]
```

The `Chunk` class organizes code into manageable pieces with line ranges:

```python
class Chunk(BaseModel):
    text: str
    line_range: tuple[int, int]  # (start_line, end_line), 1-index, inclusive
    normalized_lcs: float | None = None

    def visualize(self) -> str:
        lines = self.text.split('\n')
        assert len(lines) == self.line_range[1] - self.line_range[0] + 1
        ret = ''
        for i, line in enumerate(lines):
            ret += f'{self.line_range[0] + i}|{line}\n'
        return ret
```

## Search Result Paging and Iteration

OpenHands includes utilities for paginated search results using base64 encoding for page identifiers:

```python
def offset_to_page_id(offset: int, has_next: bool) -> str | None:
    if not has_next:
        return None
    next_page_id = base64.b64encode(str(offset).encode()).decode()
    return next_page_id


def page_id_to_offset(page_id: str | None) -> int:
    if not page_id:
        return 0
    offset = int(base64.b64decode(page_id).decode())
    return offset


async def iterate(fn: Callable, **kwargs) -> AsyncIterator:
    """Iterate over paged result sets. Assumes that the results sets contain an array of result objects, and a next_page_id"""
    kwargs = {**kwargs}
    kwargs['page_id'] = None
    while True:
        result_set = await fn(**kwargs)
        for result in result_set.results:
            yield result
        if result_set.next_page_id is None:
            return
        kwargs['page_id'] = result_set.next_page_id
```

## Practical Implementation Approach

When working with large codebases, OpenHands:

1. Uses efficient command-line tools wrapped in safer interfaces (GrepTool, GlobTool)
   - Ripgrep (`rg`) is the underlying tool for both search methods, providing fast performance even on large codebases
   - The wrappers handle complex patterns, escaping, and sanitize outputs for consumption by LLMs

2. Employs memory condensation to optimize context usage
   - Configurable strategies available through the `CondenserConfig` system
   - Automatic summarization of history when context grows too large
   - Maintaining only the most relevant context to conserve tokens

3. Applies chunk localization to find relevant code segments
   - Uses normalized Longest Common Subsequence (LCS) to measure relevance between code chunks and queries
   - Splits large files into manageable chunks for more effective processing
   - Preserves line numbers for accurate referencing

## Computational Economics

OpenHands' approach represents a balanced investment in real-time processing with good token efficiency:

- **Preprocessing Cost**: Minimal - primarily real-time search and chunking
- **Storage Overhead**: Minimal - only stores condensed history
- **Search Complexity**: O(m) where m = search results (using ripgrep's optimized search)
- **Token Efficiency**: Good (optimizes through memory condensation)

This approach is particularly well-suited for workflows with rapidly changing codebases where heavy preprocessing would quickly become stale.

## Conclusion

OpenHands' memory and condensation system represents a lightweight yet effective approach to codebase understanding. By focusing on efficient real-time search, intelligent chunking, and sophisticated memory management, OpenHands achieves good performance while minimizing preprocessing overhead.

Key strengths of this approach include:
- Minimal preprocessing requirements
- Adaptability to rapidly changing codebases
- Efficient token usage through memory condensation
- Flexible search capabilities with ripgrep integration
- Chunk localization for finding relevant code segments

This approach illustrates that effective codebase understanding doesn't always require heavyweight preprocessing and indexing - sometimes a more lightweight, real-time approach can be just as effective.
