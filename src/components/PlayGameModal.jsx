import React, { useState, useEffect, useRef } from "react";
import { config } from "../data/config";
import { X, Trophy, Bot, User, RefreshCw, Sparkles, MessageCircle, Zap } from "lucide-react";
import "../styles/gameModal.css";

const CHOICES = [
  { id: "rock", label: "Rock", emoji: "✊" },
  { id: "paper", label: "Paper", emoji: "✋" },
  { id: "scissors", label: "Scissors", emoji: "✌️" },
];

const WINNING_MAP = {
  rock: "scissors", // Rock beats Scissors
  paper: "rock", // Paper beats Rock
  scissors: "paper", // Scissors beats Paper
};

const BOT_DIALOGUES = {
  start: [
    "I am Eliyas AI Bot. Let's see if your intuition can beat my prediction algorithms!",
    "Ready for a duel? My neural model is active and analyzing your moves.",
    "Think you can outsmart an AI Automation Expert's bot? Make your move!",
  ],
  botWinRound: [
    "Calculated! Predicted your move with 96.8% heuristic confidence.",
    "Pattern recognized! Point goes to the machine 🤖",
    "Heh, classic human choice! Point for Eliyas Bot.",
    "Data doesn't lie. My counter-algorithm executed flawlessly!",
  ],
  playerWinRound: [
    "Alert! Anomaly detected! You bypassed my heuristic filters!",
    "Whoa! Unpredictable move! Well played, human 👏",
    "Fascinating... you broke the statistical pattern!",
    "Point to you! My weights need recalibration...",
  ],
  drawRound: [
    "Synchronized frequency! We chose the exact same move.",
    "A cosmic collision! We think on the exact same wavelength.",
    "Draw! Great minds (and great AIs) think alike.",
  ],
  matchPlayerWin: [
    "Incredible intuition! You officially defeated Eliyas Bot 🏆 The real Eliyas would love to collaborate with a sharp mind like you!",
  ],
  matchBotWin: [
    "Victory goes to Eliyas Bot! 🤖 Don't worry though—human creativity + Eliyas's AI automation is the ultimate unstoppable combo!",
  ],
};

const TARGET_SCORE = 3;

export default function PlayGameModal({ isOpen, onClose }) {
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [ties, setTies] = useState(0);

  const [playerChoice, setPlayerChoice] = useState(null);
  const [botChoice, setBotChoice] = useState(null);
  const [roundResult, setRoundResult] = useState(null); // 'win' | 'lose' | 'draw'
  const [isShuffling, setIsShuffling] = useState(false);
  const [botMessage, setBotMessage] = useState(BOT_DIALOGUES.start[0]);
  const [history, setHistory] = useState([]); // past moves

  const shuffleIntervalRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset or randomize intro line when opening
  useEffect(() => {
    if (isOpen) {
      const randomIntro =
        BOT_DIALOGUES.start[
          Math.floor(Math.random() * BOT_DIALOGUES.start.length)
        ];
      setBotMessage(randomIntro);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isMatchOver = playerScore >= TARGET_SCORE || botScore >= TARGET_SCORE;
  const playerWonMatch = playerScore >= TARGET_SCORE;

  // AI Decision Logic (Smart Pattern Predictor)
  const getBotChoice = (userChoice) => {
    // 40% random / playful, 60% intelligent prediction based on player history
    const shouldPredict = history.length > 0 && Math.random() < 0.6;

    if (shouldPredict) {
      const lastRound = history[history.length - 1];

      // Psychological Win-Stay, Lose-Shift Heuristic
      let predictedPlayerMove = userChoice;
      if (lastRound.result === "win") {
        // Player won last round -> 65% chance they repeat that move
        predictedPlayerMove = lastRound.playerChoice;
      } else if (lastRound.result === "lose") {
        // Player lost last round -> often switches to what would have beaten bot's last move
        predictedPlayerMove =
          lastRound.botChoice === "rock"
            ? "paper"
            : lastRound.botChoice === "paper"
            ? "scissors"
            : "rock";
      }

      // Counter the predicted move
      if (predictedPlayerMove === "rock") return "paper";
      if (predictedPlayerMove === "paper") return "scissors";
      return "rock";
    }

    // Fallback: Random selection
    const randomIndex = Math.floor(Math.random() * CHOICES.length);
    return CHOICES[randomIndex].id;
  };

  const handlePlayRound = (choiceId) => {
    if (isShuffling || isMatchOver) return;

    setIsShuffling(true);
    setPlayerChoice(choiceId);
    setBotChoice(null);
    setRoundResult(null);
    setBotMessage("Analyzing neural weights and predicting your move...");

    // Shuffle mystery emojis
    let shuffleCount = 0;
    const mysteryEmojis = ["✊", "✋", "✌️", "⚡", "🤖"];
    shuffleIntervalRef.current = setInterval(() => {
      setBotChoice(mysteryEmojis[shuffleCount % mysteryEmojis.length]);
      shuffleCount++;
    }, 100);

    setTimeout(() => {
      clearInterval(shuffleIntervalRef.current);

      const computedBotChoice = getBotChoice(choiceId);
      setBotChoice(computedBotChoice);
      setIsShuffling(false);

      // Evaluate Round
      let result = "draw";
      if (choiceId === computedBotChoice) {
        result = "draw";
        setTies((prev) => prev + 1);
        const line =
          BOT_DIALOGUES.drawRound[
            Math.floor(Math.random() * BOT_DIALOGUES.drawRound.length)
          ];
        setBotMessage(line);
      } else if (WINNING_MAP[choiceId] === computedBotChoice) {
        result = "win";
        const newPlayerScore = playerScore + 1;
        setPlayerScore(newPlayerScore);

        if (newPlayerScore >= TARGET_SCORE) {
          setBotMessage(BOT_DIALOGUES.matchPlayerWin[0]);
        } else {
          const line =
            BOT_DIALOGUES.playerWinRound[
              Math.floor(Math.random() * BOT_DIALOGUES.playerWinRound.length)
            ];
          setBotMessage(line);
        }
      } else {
        result = "lose";
        const newBotScore = botScore + 1;
        setBotScore(newBotScore);

        if (newBotScore >= TARGET_SCORE) {
          setBotMessage(BOT_DIALOGUES.matchBotWin[0]);
        } else {
          const line =
            BOT_DIALOGUES.botWinRound[
              Math.floor(Math.random() * BOT_DIALOGUES.botWinRound.length)
            ];
          setBotMessage(line);
        }
      }

      setRoundResult(result);
      setHistory((prev) => [
        ...prev,
        { playerChoice: choiceId, botChoice: computedBotChoice, result },
      ]);
    }, 900);
  };

  const handleResetGame = () => {
    setPlayerScore(0);
    setBotScore(0);
    setTies(0);
    setPlayerChoice(null);
    setBotChoice(null);
    setRoundResult(null);
    setIsShuffling(false);
    setHistory([]);
    setBotMessage(BOT_DIALOGUES.start[1]);
  };

  const getEmoji = (id) => {
    const found = CHOICES.find((c) => c.id === id);
    return found ? found.emoji : id || "❓";
  };

  // WhatsApp link for post-game hire CTA
  const whatsAppMessage = playerWonMatch
    ? `Hi Eliyas! I just played your AI Rock-Paper-Scissors game on your portfolio and won ${playerScore}-${botScore}! I would love to discuss a project with you.`
    : `Hi Eliyas! I just challenged your AI Bot on your portfolio. I loved the interactive experience and would like to discuss working together!`;

  const whatsAppUrl = `https://wa.me/8801892832956?text=${encodeURIComponent(
    whatsAppMessage
  )}`;

  return (
    <div
      className="game-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="game-modal-card">
        {/* Close Button */}
        <button
          className="game-modal-close"
          onClick={onClose}
          aria-label="Close Game"
          data-cursor="disable"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="game-modal-header">
          <div className="game-badge">
            <Sparkles size={12} />
            Interactive Cyber Duel
          </div>
          <h2>Rock • Paper • Scissors</h2>
          <p>You vs. Eliyas AI Bot — First to {TARGET_SCORE} Points Wins!</p>
        </div>

        {/* Battle Arena */}
        <div className="game-arena">
          {/* Player (You) */}
          <div className="player-card">
            <div className="player-avatar-wrap">
              <div className="player-avatar">
                <User size={26} />
              </div>
              <span className="avatar-badge">YOU</span>
            </div>
            <div className="player-name">Visitor</div>
            <div className="player-score">{playerScore}</div>
            <div
              className={`hand-display ${
                playerChoice && !isShuffling ? "revealed" : ""
              }`}
            >
              {playerChoice ? getEmoji(playerChoice) : "—"}
            </div>
          </div>

          {/* VS Emblem */}
          <div className="arena-vs">
            <div className="vs-badge">VS</div>
            <span className="vs-target">Race to {TARGET_SCORE}</span>
          </div>

          {/* Bot (Eliyas AI) */}
          <div className="player-card">
            <div className="player-avatar-wrap bot-glow">
              <img
                src={config.developer.photo || "/images/eliyas.png"}
                alt="Eliyas Bot"
                className="player-avatar"
              />
              <span className="avatar-badge">AI BOT</span>
            </div>
            <div className="player-name">Eliyas Bot</div>
            <div className="player-score">{botScore}</div>
            <div
              className={`hand-display ${
                isShuffling
                  ? "shuffling"
                  : botChoice && !isShuffling
                  ? "revealed"
                  : ""
              }`}
            >
              {botChoice ? getEmoji(botChoice) : "—"}
            </div>
          </div>
        </div>

        {/* Dynamic Bot Dialogue Bubble */}
        <div className="bot-speech-bubble">
          <Bot size={18} className="bot-icon-mini" />
          <span>{botMessage}</span>
        </div>

        {/* Round Result Banner */}
        {roundResult && !isMatchOver && (
          <div className={`round-result-banner ${roundResult}`}>
            {roundResult === "win" && "🎉 You won this round!"}
            {roundResult === "lose" && "🤖 Eliyas Bot won this round!"}
            {roundResult === "draw" && "⚡ It's a draw! Both chose the same."}
          </div>
        )}

        {/* Match Completed Screen OR Control Buttons */}
        {isMatchOver ? (
          <div className="match-over-card">
            <div className="match-over-icon">
              {playerWonMatch ? "🏆" : "🤖"}
            </div>
            <h3>
              {playerWonMatch
                ? "VICTORY! You Beat Eliyas Bot!"
                : "Match Over! Eliyas Bot Wins!"}
            </h3>
            <p>
              {playerWonMatch
                ? "You showed incredible intuition against the neural model. The real Eliyas is ready to build smart systems for you!"
                : "Good game! Even against AI, you put up a great fight. Ready to collaborate with the real developer?"}
            </p>
            <div className="match-over-actions">
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="game-action-btn primary"
                data-cursor="disable"
              >
                <MessageCircle size={16} />
                Hire the Real Eliyas &rarr;
              </a>
              <button
                onClick={handleResetGame}
                className="game-action-btn secondary"
                data-cursor="disable"
              >
                <RefreshCw size={15} />
                Play Again
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="game-controls-title">Choose your weapon:</div>
            <div className="game-choices">
              {CHOICES.map((choice) => (
                <button
                  key={choice.id}
                  className="choice-btn"
                  onClick={() => handlePlayRound(choice.id)}
                  disabled={isShuffling}
                  data-cursor="disable"
                  title={`Play ${choice.label}`}
                >
                  <span className="choice-emoji">{choice.emoji}</span>
                  <span className="choice-label">{choice.label}</span>
                </button>
              ))}
            </div>

            {/* Quick Reset or Ties row */}
            <div className="game-history-row">
              <span className="history-pill">Ties: {ties}</span>
              <span className="history-pill">Rounds: {history.length}</span>
              {history.length > 0 && (
                <button
                  onClick={handleResetGame}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.45)",
                    cursor: "pointer",
                    fontSize: "11px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    marginLeft: "8px",
                  }}
                  data-cursor="disable"
                >
                  <RefreshCw size={11} /> Reset
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
