import React, { useState } from "react";

export const WhySwapsGoWrong = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      style={{
        backgroundColor: "white",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "1.5rem",
        marginBottom: "2rem",
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "1.125rem",
            fontWeight: "600",
            color: "#333",
          }}
        >
          Why swaps often get worse prices than expected
        </h3>
        <span
          style={{
            fontSize: "1.5rem",
            color: "#666",
            transition: "transform 0.2s",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <>
          <div
            style={{
              display: "grid",
              gap: "1rem",
              fontSize: "0.875rem",
              lineHeight: "1.6",
            }}
          >
            {/* Sandwich Attacks */}
            <div
              style={{
                padding: "1rem",
                backgroundColor: "#fff3e0",
                borderLeft: "3px solid #ff9800",
                borderRadius: "4px",
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  color: "#e65100",
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                🥪 Sandwich Attacks
              </div>
              <div style={{ color: "#666" }}>
                Bots see your pending transaction and place orders before and
                after yours. They buy before you (raising the price), then sell
                after you (lowering it). You pay more and get less.
              </div>
            </div>

            {/* Front-Running */}
            <div
              style={{
                padding: "1rem",
                backgroundColor: "#ffebee",
                borderLeft: "3px solid #f44336",
                borderRadius: "4px",
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  color: "#c62828",
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                🏃 Front-Running
              </div>
              <div style={{ color: "#666" }}>
                Bots monitor the mempool (pending transactions pool) and copy
                profitable trades. They pay higher fees to get included first,
                moving the price before your trade executes.
              </div>
            </div>

            {/* Price Movement */}
            <div
              style={{
                padding: "1rem",
                backgroundColor: "#e3f2fd",
                borderLeft: "3px solid #2196f3",
                borderRadius: "4px",
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  color: "#1565c0",
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                📈 Price Movement During Execution
              </div>
              <div style={{ color: "#666" }}>
                Between when you submit and when your transaction confirms,
                other trades happen. The price moves naturally, but you&apos;re
                locked into your slippage tolerance.
              </div>
            </div>

            {/* Slippage */}
            <div
              style={{
                padding: "1rem",
                backgroundColor: "#f3e5f5",
                borderLeft: "3px solid #9c27b0",
                borderRadius: "4px",
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  color: "#6a1b9a",
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                💧 Slippage & Liquidity
              </div>
              <div style={{ color: "#666" }}>
                Large trades move the price in the liquidity pool itself. Lower
                liquidity = higher slippage. Your trade changes the price as it
                executes.
              </div>
            </div>

            {/* Back-Running */}
            <div
              style={{
                padding: "1rem",
                backgroundColor: "#fce4ec",
                borderLeft: "3px solid #e91e63",
                borderRadius: "4px",
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  color: "#880e4f",
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                🎯 Back-Running
              </div>
              <div style={{ color: "#666" }}>
                Bots execute right after your trade to profit from the price
                change you created. This doesn&apos;t directly hurt you, but
                shows your intent was visible and exploited.
              </div>
            </div>

            {/* JIT Liquidity */}
            <div
              style={{
                padding: "1rem",
                backgroundColor: "#e0f2f1",
                borderLeft: "3px solid #009688",
                borderRadius: "4px",
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  color: "#00695c",
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                ⚡ Just-In-Time (JIT) Liquidity
              </div>
              <div style={{ color: "#666" }}>
                Sophisticated bots add liquidity right before your trade and
                remove it after, capturing fees without taking long-term price
                risk. You get worse execution.
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "1.5rem",
              padding: "1rem",
              backgroundColor: "#f5f5f5",
              borderRadius: "4px",
              fontSize: "0.875rem",
              color: "#666",
              lineHeight: "1.6",
            }}
          >
            <div
              style={{
                fontWeight: "600",
                color: "#333",
                marginBottom: "0.5rem",
              }}
            >
              The common thread:
            </div>
            Your transaction intent is visible in the public mempool before it
            executes. Bots have milliseconds to react. You can&apos;t outrun
            them on latency.
          </div>

          {/* Learn More Links */}
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1rem",
              backgroundColor: "#e3f2fd",
              borderRadius: "4px",
              fontSize: "0.875rem",
            }}
          >
            <div
              style={{
                fontWeight: "600",
                color: "#333",
                marginBottom: "0.75rem",
              }}
            >
              📚 Learn more about MEV and bots:
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <a
                href="https://www.webopedia.com/crypto/learn/biggest-mev-bot-attacks/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#1565c0",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                <span>→</span>
                <span style={{ textDecoration: "underline" }}>
                  Biggest MEV Bot Attacks
                </span>
                <span style={{ fontSize: "0.75rem" }}>↗</span>
              </a>
              <a
                href="https://www.reddit.com/r/solana/comments/1gzygdz/losing_all_your_money_to_memecoins_the_problem/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#1565c0",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                <span>→</span>
                <span style={{ textDecoration: "underline" }}>
                  MEV & Bots on Solana: Real Trader Experiences
                </span>
                <span style={{ fontSize: "0.75rem" }}>↗</span>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
