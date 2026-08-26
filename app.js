const START_BALANCE = 10_000;
const BALANCE_KEY = "maktub-sdk-demo:balance";
const GAME_KEY = "maktub-sdk-demo:game";

const games = [
  ["dice", "Dice"],
  ["mines", "Mines"],
  ["plinko", "Plinko"],
  ["roulette", "Roulette"],
  ["wheel", "Wheel"],
  ["limbo", "Limbo"],
  ["coinflip", "Coin Flip"],
  ["blackjack", "Blackjack"],
  ["hilo", "Hi-Lo"],
  ["keno", "Keno"],
  ["crash", "Crash"],
  ["baccarat", "Baccarat"],
  ["chicken", "Chicken"],
  ["diamonds", "Diamonds"],
  ["tower", "Tower"],
  ["soccer", "Soccer"],
  ["doors", "Doors"],
  ["slide", "Slide"],
  ["videopoker", "Video Poker"],
  ["balloon", "Balloon"],
  ["phoenix", "Phoenix"],
  ["realestate", "Real Estate"],
  ["stairs", "Stairs"],
  ["bridge", "Bridge"],
  ["double", "Double"],
  ["volt", "Volt"],
  ["defuse", "Defuse"],
  ["spark", "Spark"],
  ["safe", "Safe"],
  ["pulse", "Pulse"],
  ["wire", "Wire"],
];

const balanceElement = document.querySelector("#balance");
const gameSelect = document.querySelector("#game-select");
const gameRoot = document.querySelector("#game-root");
const gameTitle = document.querySelector("#game-title");
const gameStatus = document.querySelector("#game-status");
const resetButton = document.querySelector("#reset-balance");
const toast = document.querySelector("#toast");

let activeGame = null;
let toastTimer = null;
let balance = readStoredBalance();

function readStoredBalance() {
  const value = Number.parseFloat(localStorage.getItem(BALANCE_KEY));
  return Number.isFinite(value) && value >= 0 ? value : START_BALANCE;
}

function formatBalance(value) {
  return `${new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} BC`;
}

function updateBalance(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return;
  balance = Math.max(0, parsed);
  localStorage.setItem(BALANCE_KEY, String(balance));
  balanceElement.textContent = formatBalance(balance);
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2800);
}

function getSdk() {
  const exported = window.MaktubSDK;
  return exported?.default ?? exported;
}

function mountGame(gameName) {
  const sdk = getSdk();
  const label = games.find(([name]) => name === gameName)?.[1] ?? gameName;

  if (!sdk || typeof sdk[gameName] !== "function") {
    gameStatus.textContent = "SDK ERROR";
    gameRoot.innerHTML = '<div class="loading"><p>Не удалось загрузить игровой модуль.</p></div>';
    return;
  }

  if (activeGame) {
    activeGame.destroy();
    activeGame = null;
  }

  gameRoot.replaceChildren();
  gameTitle.textContent = label;
  gameStatus.textContent = "DEMO READY";
  localStorage.setItem(GAME_KEY, gameName);

  document.querySelectorAll("[data-game]").forEach((button) => {
    button.classList.toggle("active", button.dataset.game === gameName);
  });

  const user = {
    balance,
    betCount: 0,
    isAuthenticated: true,
  };

  try {
    activeGame = sdk[gameName](gameRoot, {
      accessToken: null,
      user,
      updateBalance,
      onAuthRequired: () => showToast("В demo mode авторизация не требуется"),
      onToast: ({ title, description }) => showToast([title, description].filter(Boolean).join(" — ")),
      currency: { code: "BC", prefix: "BC ", rate: 1 },
      language: "en",
      isDemo: true,
      initialBalanceUsd: balance,
      showBalance: true,
      showRules: true,
      hideProvablyFair: true,
      showWin: true,
      theme: {
        backgroundDark: "#1D121F",
        backgroundDarkLight: "#251929",
        buttonColor: "#E6007A",
        buttonTextColor: "#FFFFFF",
        accentColor: "#E6007A",
      },
    });
  } catch (error) {
    console.error(error);
    gameStatus.textContent = "SDK ERROR";
    gameRoot.innerHTML = `<div class="loading"><p>${error.message || "Ошибка запуска игры"}</p></div>`;
  }
}

for (const [value, label] of games) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  gameSelect.append(option);
}

const storedGame = localStorage.getItem(GAME_KEY);
gameSelect.value = games.some(([name]) => name === storedGame) ? storedGame : "dice";
balanceElement.textContent = formatBalance(balance);

gameSelect.addEventListener("change", () => mountGame(gameSelect.value));

document.querySelectorAll("[data-game]").forEach((button) => {
  button.addEventListener("click", () => {
    gameSelect.value = button.dataset.game;
    mountGame(button.dataset.game);
  });
});

resetButton.addEventListener("click", () => {
  if (!window.confirm("Вернуть тестовый баланс к 10 000 BC?")) return;
  localStorage.setItem(BALANCE_KEY, String(START_BALANCE));
  window.location.reload();
});

mountGame(gameSelect.value);
