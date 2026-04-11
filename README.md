# copenhagenatomics
Notes: 
- The current system can handle 4095 req/ ms because of the ID generation. We only need 100 req/ second for 10 sensors.
- I'm using TCP for testing. It's out of scope for the Demo to run virtual COM ports because it requires additional drivers to be installed.
- Virtual COM ports: Use Virtual Serial port tools HDD + Free Serial Analyzer. com0com was broken.
- COM ports on Bun: Use node.js v24.14.1
To install dependencies:

# Get started

1. Clone repo
2. Install dependencies
```bash
npm install
```
3. Configure enviroment variables
```bash
cp .env.example .env
```

4. Run COM listener:

```bash
npm run listen
```

