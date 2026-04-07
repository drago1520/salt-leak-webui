# copenhagenatomics
Notes: 
- The current system can handle 4095 req/ ms because of the ID generation. We only need 100 req/ second for 10 sensors.
- I'm using TCP for testing. It's out of scope for the Demo to run virtual COM ports because it requires additional drivers to be installed.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.9. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
