# notifications

Listens to MQTT `readings` topic. On sensor error (any `pNStatusCode !== 0`) → sends web push + email to all users.

## Rate limiting

Both channels rate-limit per sensor ID to prevent spam. Cooldowns are in-memory — reset on restart.

<details>
<summary>Web push</summary>

Default: 30s cooldown per sensor.

```env
COOLDOWN_MS=30000
```

</details>

<details>
<summary>Email</summary>

Default: 1h cooldown per sensor.

```env
EMAIL_COOLDOWN_MS=3600000
```

</details>
