# mqtt-broker

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.12. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

---

## Auth

- **MQTT**: Aedes checks `MQTT_USERNAME` / `MQTT_PASSWORD` on every client connect. Sensors must supply matching credentials.
- **WebSocket**: Clients must pass `?key=<WS_SECRET>` in the URL. Requests without it get `401`. The web app reads this from `NEXT_PUBLIC_WS_SECRET`.
