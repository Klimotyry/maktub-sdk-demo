# Maktub Game SDK

Embeddable iGaming components for casino game integration. Available games: Dice, Limbo, Mines, Keno, Plinko, Roulette, Wheel, Coin Flip, Blackjack, and Hi-Lo.

## Onboarding

Before integrating the SDK, your brand must be registered as a **Customer** with the Maktub provider team. During registration you will need to provide:

- **Webhook URL** — A publicly accessible endpoint on your server where Maktub will send real-time event notifications (bets placed, payouts, balance updates, etc.). This is required for the platform to communicate game results back to your system.

Contact the Maktub provider team to complete registration and receive your `clientId` and webhook secret. Keep the secret on your backend.

## Authentication

Create a session by calling the Maktub server:

```ts
const response = await fetch("https://server.maktub.bet/session", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-operator-secret": process.env.MAKTUB_WEBHOOK_SECRET,
  },
  body: JSON.stringify({ clientId: "your-client-id", userId: "your-user-id" }),
});
const { token } = await response.json();
const accessToken = `Bearer ${token}`;
```

The SDK handles all API communication internally — **no server URL needs to be provided**.

## React Integration

```tsx
import { DiceGameSDK } from "@maktubbet/sdk";

function App() {
  return (
    <DiceGameSDK
      accessToken={accessToken}
      user={{ balance: 1000, betCount: 0, isAuthenticated: true }}
      updateBalance={(newBalance) => setBalance(newBalance)}
      onAuthRequired={() => redirectToLogin()}
      currency={{ code: "USD", prefix: "$", rate: 1 }}
      language="en"
      theme={{
        backgroundDark: "#1D121F",
        buttonColor: "#E6007A",
      }}
    />
  );
}
```

All game components share the same props interface.

## Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `accessToken` | `string \| null` | Yes | Bearer token from `/session` endpoint. Pass `null` for demo mode. |
| `user` | `{ balance: number; betCount: number; isAuthenticated: boolean }` | Yes | Current user state. |
| `updateBalance` | `(balance: number) => void` | Yes | Callback when balance changes after a bet. |
| `onAuthRequired` | `() => void` | Yes | Called when an unauthenticated user tries to bet. |
| `currency` | `{ code: string; prefix: string; rate: number }` | No | Currency display config. Defaults to USD. |
| `language` | `string` | No | Locale code. Defaults to `"en"`. |
| `logo` | `ReactNode` | No | Custom logo displayed in the game header. |
| `onToast` | `(toast: { title: string; description?: string; type?: string }) => void` | No | Toast notification callback. |
| `theme` | `GameTheme` | No | Visual theming overrides. |

## Vanilla JS Integration

```html
<script src="https://cdn.maktub.bet/sdk.iife.js"></script>
<div id="dice-game"></div>
<script>
  const game = MaktubSDK.dice("#dice-game", {
    accessToken: "Bearer ...",
    user: { balance: 1000, betCount: 0, isAuthenticated: true },
    updateBalance: (b) => console.log("New balance:", b),
    onAuthRequired: () => console.log("Auth required"),
  });

  // Update props dynamically
  game.update({ user: { balance: 500, betCount: 1, isAuthenticated: true } });

  // Cleanup
  game.destroy();
</script>
```

## Available Games

| Import | Vanilla JS |
| --- | --- |
| `DiceGameSDK` | `MaktubSDK.dice()` |
| `LimboGameSDK` | `MaktubSDK.limbo()` |
| `MinesGameSDK` | `MaktubSDK.mines()` |
| `KenoGameSDK` | `MaktubSDK.keno()` |
| `PlinkoGameSDK` | `MaktubSDK.plinko()` |
| `RouletteGameSDK` | `MaktubSDK.roulette()` |
| `WheelGameSDK` | `MaktubSDK.wheel()` |
| `CoinFlipGameSDK` | `MaktubSDK.coinflip()` |
| `BlackjackGameSDK` | `MaktubSDK.blackjack()` |
| `HiLoGameSDK` | `MaktubSDK.hilo()` |
| `CrashGameSDK` | `MaktubSDK.crash()` |
| `ChickenGameSDK` | `MaktubSDK.chicken()` |
| `BaccaratGameSDK` | `MaktubSDK.baccarat()` |
| `DiamondsGameSDK` | `MaktubSDK.diamonds()` |
| `TowerGameSDK` | `MaktubSDK.tower()` |

---

## New Game Details

### Crash

A multiplayer crash game where a multiplier climbs from 1.00x and can crash at any moment. Players place bets during a 5-second betting window, then watch the multiplier rise during the running phase. Cash out before the crash to lock in winnings — wait too long and the bet is lost.

**Multiplayer:** In production mode the SDK connects to `wss://worker.maktub.bet/ws/crash` so all players share the same round, see each other's bets, and observe live cashouts.

**Extra prop:**

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `userName` | `string` | No | Display name shown to other players in the current round's bet list. Defaults to `"Anonymous"`. |

```tsx
import { CrashGameSDK } from "@maktubbet/sdk";

<CrashGameSDK
  accessToken={accessToken}
  user={user}
  updateBalance={setBalance}
  onAuthRequired={handleAuth}
  userName="LuckyPlayer"
/>
```

**Key features:**
- Shared real-time round with all connected players
- Live bet list showing all participants and their cashout multipliers
- Manual and auto betting modes (auto mode sets a target cashout multiplier)
- Exponential multiplier chart with explosion animation on crash
- Hotkeys: Space (bet/cashout), S (double amount), A (halve amount), D (clear amount)

---

### Chicken

A road-crossing game where a chicken crosses up to 9 lanes. Each lane contains safe spots and dangerous spots (cars). Select a lane and advance — hit a car and the bet is lost, survive and the multiplier grows.

**Difficulty levels:**

| Difficulty | Spots per Row | Safe Spots | Multiplier Growth |
| --- | --- | --- | --- |
| Easy | 4 | 3 | Low |
| Medium | 3 | 2 | Medium |
| Hard | 2 | 1 | High |
| Expert | 4 | 1 | Very High |

```tsx
import { ChickenGameSDK } from "@maktubbet/sdk";

<ChickenGameSDK
  accessToken={accessToken}
  user={user}
  updateBalance={setBalance}
  onAuthRequired={handleAuth}
/>
```

**Key features:**
- 4 difficulty levels with increasing risk and reward
- Animated chicken sprite crossing lanes with traffic
- Cash out at any lane to secure current winnings
- Death animation with trample car and feather particles
- Traffic light indicator shows game state (idle/playing/won/lost)
- Manual, auto, and advanced betting modes
- Active bet persistence (resumes on page reload)
- Hotkeys: Space (bet/cashout), Q/G (go), W (cashout)

---

### Baccarat

Classic Baccarat card game. Place chips on Player, Banker, or Tie, then watch the cards dealt. The hand closest to 9 wins.

**Payouts:**

| Bet | Payout | Multiplier |
| --- | --- | --- |
| Player | 1:1 | 2.00x |
| Banker | 0.95:1 | 1.95x |
| Tie | 8:1 | 9.00x |

```tsx
import { BaccaratGameSDK } from "@maktubbet/sdk";

<BaccaratGameSDK
  accessToken={accessToken}
  user={user}
  updateBalance={setBalance}
  onAuthRequired={handleAuth}
/>
```

**Key features:**
- Chip selection system with multiple denominations
- Place multiple chip stacks on Player, Banker, and/or Tie
- Undo and clear chip placement before confirming
- Animated card dealing (face-down then revealed)
- Third card rules applied automatically
- Winner banner display
- Hotkeys: Space (bet), 1/2/3 (place chip on position), Z (undo), X (clear)

---

### Diamonds

A slot-style game with 5 diamond slots. Place a bet, reveal 5 colored gems, and win based on matching combinations. Seven diamond colors: yellow, pink, blue, green, red, cyan, and purple.

**Paytable:**

| Combination | Multiplier | Chance |
| --- | --- | --- |
| Five of a Kind | 50.00x | ~0.01% |
| Four of a Kind | 5.00x | ~0.37% |
| Full House | 4.00x | ~1.22% |
| Three of a Kind | 3.00x | ~10.2% |
| Two Pairs | 2.00x | ~16.9% |
| Pair | 0.10x | ~46.9% |
| No Match | 0.00x | ~24.4% |

```tsx
import { DiamondsGameSDK } from "@maktubbet/sdk";

<DiamondsGameSDK
  accessToken={accessToken}
  user={user}
  updateBalance={setBalance}
  onAuthRequired={handleAuth}
/>
```

**Key features:**
- 7 unique diamond colors with faceted gem graphics
- Sequential reveal animation across 5 slots
- Interactive paytable with hover tooltips showing profit and probability
- Color-coded pedestals for matched diamonds
- Manual, auto, and advanced betting modes
- Instant bet option (skip reveal animations)
- Hotkeys: Space (bet), S (double amount), A (halve amount), D (clear amount)

---

### Tower

A tower-climbing game with 9 rows of tiles. Select one tile per row to climb — gems are safe, blocks end the game. Higher rows mean higher multipliers. Cash out at any point to secure winnings.

**Difficulty levels:**

| Difficulty | Tiles per Row | Safe Tiles | Multiplier Growth |
| --- | --- | --- | --- |
| Easy | 4 | 3 | Low |
| Medium | 3 | 2 | Medium |
| Hard | 2 | 1 | High |
| Expert | 3 | 1 | Very High |
| Master | 4 | 1 | Extreme |

```tsx
import { TowerGameSDK } from "@maktubbet/sdk";

<TowerGameSDK
  accessToken={accessToken}
  user={user}
  updateBalance={setBalance}
  onAuthRequired={handleAuth}
/>
```

**Key features:**
- 5 difficulty levels with increasing risk and reward
- Visual tower grid (9 rows) with animated tile reveals
- Gem icons for safe tiles, block icons for dangerous tiles
- Pre-select tiles in auto/advanced mode
- Random tile selection option
- Current profit and profit-on-next-win displays
- Manual, auto, and advanced betting modes
- Active bet persistence (resumes on page reload)
- Hotkeys: Space (bet/cashout), W (cashout), Q (random tile), 1–4 (select tile by position)

## Webhook Events

After registration, Maktub will POST JSON payloads to your webhook URL for game events:

```json
{
  "event": "bet_settled",
  "userId": "your-user-id",
  "customerId": "your-client-id",
  "actions": [
    { "type": "debit", "amount": 10 },
    { "type": "credit", "amount": 25 }
  ]
}
```

Your webhook endpoint must return a `200` status to acknowledge receipt.
