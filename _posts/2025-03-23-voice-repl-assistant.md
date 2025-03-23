---
title: Talking to My Terminal: Building a Voice-Driven REPL Assistant with Whisper, GPT, and a Lot of asyncio
date: March 23, 2025
---

# Talking to My Terminal: Building a Voice-Driven REPL Assistant with Whisper, GPT, and a Lot of `asyncio`

For a while, I'd been thinking: what if my terminal could listen to me? Not in a metaphorical sense like Bash waiting for `rm -rf /`, but literally. Speak a question, get a response. Like a command-line Claude. I wasn't aiming for sentience, just a helpful assistant that could handle both voice and keyboard input. Naturally, this led to a weekend project that spiraled into something more involved and more fun than I expected.

This is a walkthrough of how I built a voice + text REPL in Python using OpenAI's Whisper and GPT APIs, Silero's Voice Activity Detection, `asyncio`, and a terminal UI powered by `rich`. It includes the bugs I encountered, the incremental fixes, and the final version that now runs happily in my terminal.

---

## Phase 1: Basic Audio Recording

I began by recording audio using `sounddevice`. Here's the first attempt:

```python
import sounddevice as sd
import wavio

def record():
    audio = sd.rec(int(5 * 44100), samplerate=44100, channels=1, dtype='int16')
    sd.wait()
    wavio.write("temp.wav", audio, 44100, sampwidth=2)
```

This worked. I could record 5 seconds of audio and save it to disk. But it blocked the main thread completely, which made it unsuitable for a REPL. So I brought in `asyncio`.

---

## Phase 2: Asynchronous Recording and Transcription

I rewrote the recorder to run inside an async coroutine, using `loop.run_in_executor()` to run the blocking audio capture code:

```python
async def audio_stream():
    loop = asyncio.get_event_loop()
    while True:
        audio = await loop.run_in_executor(None, sd.rec, ...)
        await loop.run_in_executor(None, sd.wait)
        # save and queue
```

I also set up an `asyncio.Queue` to coordinate the recording and transcription tasks. Using a regular `queue.Queue` here would've led to blocking issues, so the switch to `asyncio.Queue` was essential:

```python
audio_queue = asyncio.Queue()
await audio_queue.put(temp_file)
audio_file = await audio_queue.get()
```

This structure allowed me to run multiple coroutines in parallel: one to record audio, one to transcribe it with Whisper, and one to process keyboard input via `aioconsole.ainput()`.

---

## Phase 3: Filtering Silence with Silero VAD

Initially, I sent every 5-second audio clip to Whisper, which meant a lot of empty transcriptions like "..." or silence. To avoid this, I used Silero's VAD (Voice Activity Detection), a compact and fast PyTorch model for detecting speech.

To use it properly, I had to reshape the audio into 512-sample chunks, as required by the model:

```python
def is_voice_present(audio_np):
    audio_tensor = torch.from_numpy(audio_np).float()
    chunks = audio_tensor[:num_frames * 512].reshape(num_frames, 512)
    with torch.no_grad():
        probs = vad_model(chunks, sample_rate)
    return (probs > 0.9).any().item()
```

This, combined with a simple RMS energy check, filtered out low-volume noise and made the system much more responsive to actual speech.

---

## Phase 4: Handling Long LLM Outputs

Once I hooked up GPT-4 (via OpenAI's `chat.completions.create`), I ran into a new issue. Long outputs would occasionally crash the program with this error:

```
BlockingIOError: [Errno 35] write could not complete without blocking
```

This happens on macOS when you `print()` large amounts of data inside an async context. The terminal output buffer gets overwhelmed.

My initial fix was to chunk the response and use `sys.stdout.write()` in a background thread. But this was clunky and still prone to timing issues.

The real solution was to switch to **streaming** responses from the API. Instead of waiting for the full output, I printed tokens as they arrived:

```python
async for chunk in stream:
    delta = chunk.choices[0].delta.content
    if delta:
        response_text += delta
        await asyncio.to_thread(console.print, delta, end="")
```

This not only solved the crash but made the assistant feel significantly more responsive.

---

## Phase 5: Graceful Shutdown

Pressing Ctrl+C caused a cascade of `CancelledError` exceptions, especially in coroutines waiting on `await audio_queue.get()` or `await aioconsole.ainput()`. To fix this, I caught `CancelledError` explicitly and added a shutdown handler:

```python
async def shutdown(loop, signal=None):
    print("\nShutting down...")
    tasks = [t for t in asyncio.all_tasks() if t is not asyncio.current_task()]
    [task.cancel() for task in tasks]
    await asyncio.gather(*tasks, return_exceptions=True)
    loop.stop()
```

I also wrapped long-running loops in `try: except asyncio.CancelledError` so they could exit cleanly.

---

## Phase 6: Using `rich` for Output

Finally, to make the REPL friendlier, I switched to using the `rich` library for styled and safe terminal output. No more `print()` or `sys.stdout.write()` hacks — just:

```python
console.print("[bold green]Claude:[/] Hello, how can I help you?")
```

This cleaned up the look of the assistant and made the streaming output more readable.

More importantly, `rich` solved a critical problem: we kept hitting `BlockingIOError` even with chunked output when printing long LLM responses. Offloading to `asyncio.to_thread(console.print, ...)` was reliable, and `rich`'s built-in buffering made terminal I/O much smoother and crash-resistant.

---

## Final Result

The final assistant supports both text and voice input, uses VAD to skip silence, streams LLM responses, and shuts down cleanly. It runs entirely in the terminal and feels remarkably responsive.

Technologies used:
- Python `asyncio`
- OpenAI Whisper + GPT-4 (via `openai-python`)
- Silero VAD
- `sounddevice`, `wavio`
- `rich` for terminal output
- `aioconsole` for async user input

---

## What's Next?

A few ideas for the future:
- Add TTS (text-to-speech) so the assistant talks back
- Integrate with CLI tools (e.g., "Run `git status`" by voice)
- Log conversations to a file
- Build a GUI using `textual`

For now, the REPL assistant lives in my terminal, listening patiently and answering intelligently. And that's more than I ever expected when I started with a blocking call to `sd.rec()`.