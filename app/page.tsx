"use client";

import React, { useState } from "react";
import { WhySwapsGoWrong } from "@/components/WhySwapsGoWrong";

export default function MEVDemo() {
  const [amount, setAmount] = useState("5");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    normal: {
      output: string;
      risk: string;
      slippage: string;
      rangeMin: string;
      rangeMax: string;
    };
    protected: {
      output: string;
      improvement: string;
      mevAvoided: string;
      risk: string;
      slippage: string;
      rangeMin: string;
      rangeMax: string;
    };
    rawData: {
      normalOutput: number;
      protectedOutput: number;
      mevSavings: string;
      platformFee: string;
    };
    isMock: boolean;
  } | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedSentiment, setSelectedSentiment] = useState("");
  const [isLoading ,setIsLoading] = useState<boolean>(false);

  // Deterministic MEV calculation based on trade size
  const calculateMEVExposure = (solAmount: number): number => {
    if (solAmount < 1) return 0.001; // 0.10%
    if (solAmount <= 5) return 0.0025; // 0.25%
    return 0.004; // 0.40%
  };

  const getRiskLevel = (solAmount: number): string => {
    if (solAmount < 1) return "Low";
    if (solAmount <= 5) return "Medium";
    return "High";
  };

  const compareSwaps = async () => {
    setLoading(true);
    setResults(null);
    setFeedbackSent(false);

    try {
      const solAmount = parseFloat(amount);

      // Fetch Jupiter quote via our API proxy (avoids CORS)
      const response = await fetch(
        `/api/quote?amount=${Math.floor(solAmount * 1e9)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch quote");
      }

      const data = await response.json();
      const normalOutput = parseFloat(data.outAmount) / 1e6;
      const isMock = data._mock || false;

      // Deterministic protected calculation
      const mevExposure = calculateMEVExposure(solAmount);
      const platformFee = 0.001; // 0.10%
      const mevSavings = normalOutput * mevExposure;
      const fee = normalOutput * platformFee;
      const protectedOutput = normalOutput + mevSavings - fee;

      // Calculate outcome ranges based on slippage
      const normalSlippage = 0.005; // 0.5%
      const protectedSlippage = 0.003; // 0.3%

      const normalRangeMin = (normalOutput * (1 - normalSlippage)).toFixed(2);
      const normalRangeMax = normalOutput.toFixed(2);

      const protectedRangeMin = (
        protectedOutput *
        (1 - protectedSlippage)
      ).toFixed(2);
      const protectedRangeMax = protectedOutput.toFixed(2);

      setResults({
        normal: {
          output: normalOutput.toFixed(2),
          risk: getRiskLevel(solAmount),
          slippage: "0.5%",
          rangeMin: normalRangeMin,
          rangeMax: normalRangeMax,
        },
        protected: {
          output: protectedOutput.toFixed(2),
          improvement: (
            ((protectedOutput - normalOutput) / normalOutput) *
            100
          ).toFixed(2),
          mevAvoided: (mevExposure * 100).toFixed(2),
          risk: "Lower",
          slippage: "0.3%",
          rangeMin: protectedRangeMin,
          rangeMax: protectedRangeMax,
        },
        rawData: {
          normalOutput,
          protectedOutput,
          mevSavings: mevSavings.toFixed(3),
          platformFee: fee.toFixed(3),
        },
        isMock,
      });
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to fetch quote. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sendFeedback = async (sentiment: string, feedback?: string) => {
    try {
      setIsLoading(true);
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sentiment,
          amount: parseFloat(amount),
          timestamp: new Date().toISOString(),
          feedback: feedback || null,
        }),
      });
      setFeedbackSent(true);
      setShowFeedbackModal(false);
    } catch (error) {
      console.error("Feedback error:", error);
    }finally {
      setIsLoading(false)
      setFeedbackText("");
      setSelectedSentiment("");
    }
  };

  const openFeedbackModal = (sentiment: string) => {
    setSelectedSentiment(sentiment);
    setShowFeedbackModal(true);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "2rem 1rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div
            style={{
              display: "inline-block",
              backgroundColor: "#333",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              fontSize: "0.875rem",
              fontWeight: "500",
              marginBottom: "1rem",
            }}
          >
            MEV Demo
          </div>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "700",
              color: "#111",
              margin: "0 0 1rem 0",
            }}
          >
            See Why Your Swaps Go Worse Than Expected
          </h1>
          <p
            style={{
              color: "#666",
              fontSize: "1.125rem",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Compare normal vs protected execution
          </p>
        </div>

        {/* Input Section */}
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minMax(150px, 1fr))",
              gap: "1rem",
              alignItems: "end",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  marginBottom: "0.5rem",
                  color: "#333",
                }}
              >
                Amount (SOL)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="5"
                min="0.1"
                step="0.1"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "1rem",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  marginBottom: "0.5rem",
                  color: "#333",
                }}
              >
                From
              </label>
              <div
                style={{
                  padding: "0.75rem",
                  backgroundColor: "#f9f9f9",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontWeight: "600",
                }}
              >
                SOL
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  marginBottom: "0.5rem",
                  color: "#333",
                }}
              >
                To
              </label>
              <div
                style={{
                  padding: "0.75rem",
                  backgroundColor: "#f9f9f9",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontWeight: "600",
                }}
              >
                USDC
              </div>
            </div>

            <button
              onClick={compareSwaps}
              disabled={loading || !amount || parseFloat(amount) <= 0}
              style={{
                padding: "0.75rem 2rem",
                backgroundColor: loading ? "#ccc" : "#111",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Loading..." : "Compare"}
            </button>
          </div>
        </div>

        {/* Results */}
        {results && (
          <>
            {/* Why Swaps Go Wrong - Educational Section */}
            <WhySwapsGoWrong />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              {/* Normal Swap */}
              <div
                style={{
                  backgroundColor: "white",
                  border: "2px solid #ff9800",
                  borderRadius: "8px",
                  padding: "1.5rem",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 1rem 0",
                    fontSize: "1.25rem",
                    fontWeight: "600",
                    color: "#333",
                  }}
                >
                  Normal (Public Swap)
                </h3>

                <div style={{ marginBottom: "1rem" }}>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "#666",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Expected Output
                  </div>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: "700",
                      color: "#111",
                    }}
                  >
                    {results.normal.output}{" "}
                    <span style={{ fontSize: "1rem", color: "#666" }}>
                      USDC
                    </span>
                  </div>

                  {/* Outcome Range */}
                  <div
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.5rem",
                      backgroundColor: "#fff3e0",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                    }}
                  >
                    <div style={{ color: "#666", marginBottom: "0.25rem" }}>
                      Possible outcome range:
                    </div>
                    <div style={{ fontWeight: "600", color: "#e65100" }}>
                      {results.normal.rangeMin} – {results.normal.rangeMax} USDC
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: "1px solid #eee",
                    paddingTop: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ fontSize: "0.875rem", color: "#666" }}>
                      Visible to public mempool
                    </span>
                    <span style={{ fontWeight: "600" }}>Yes</span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ fontSize: "0.875rem", color: "#666" }}>
                      Slippage buffer required
                    </span>
                    <span style={{ fontWeight: "600" }}>
                      {results.normal.slippage}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ fontSize: "0.875rem", color: "#666" }}>
                      Failure risk
                    </span>
                    <span
                      style={{
                        fontWeight: "600",
                        color:
                          results.normal.risk === "High"
                            ? "#d32f2f"
                            : results.normal.risk === "Medium"
                            ? "#ff9800"
                            : "#666",
                      }}
                    >
                      {results.normal.risk}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ fontSize: "0.875rem", color: "#666" }}>
                      Execution confidence
                    </span>
                    <span style={{ fontWeight: "600", color: "#ff9800" }}>
                      Low
                    </span>
                  </div>
                </div>

                {/* What Usually Goes Wrong */}
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "0.75rem",
                    backgroundColor: "#fff3e0",
                    border: "1px solid #ff9800",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                    color: "#e65100",
                  }}
                >
                  <div style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
                    Common issues:
                  </div>
                  <div style={{ fontSize: "0.75rem", lineHeight: "1.4" }}>
                    • Sandwiching
                    <br />
                    • Price moved before execution
                    <br />• Slippage exceeded
                  </div>
                </div>
              </div>

              {/* Protected Swap */}
              <div
                style={{
                  backgroundColor: "white",
                  border: "2px solid #4caf50",
                  borderRadius: "8px",
                  padding: "1.5rem",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 0.25rem 0",
                    fontSize: "1.25rem",
                    fontWeight: "600",
                    color: "#333",
                  }}
                >
                  Protected (Private Execution)
                </h3>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#666",
                    marginBottom: "1rem",
                    fontStyle: "italic",
                  }}
                >
                  Simulated based on historical MEV ranges
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "#666",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Expected Output
                  </div>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: "700",
                      color: "#111",
                    }}
                  >
                    {results.protected.output}{" "}
                    <span style={{ fontSize: "1rem", color: "#666" }}>
                      USDC
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: "0.5rem",
                      color: "#4caf50",
                      fontWeight: "600",
                      fontSize: "0.875rem",
                    }}
                  >
                    ↑ +{results.protected.improvement}% better
                  </div>

                  {/* Outcome Range */}
                  <div
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.5rem",
                      backgroundColor: "#e8f5e9",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                    }}
                  >
                    <div style={{ color: "#666", marginBottom: "0.25rem" }}>
                      Possible outcome range:
                    </div>
                    <div style={{ fontWeight: "600", color: "#2e7d32" }}>
                      {results.protected.rangeMin} –{" "}
                      {results.protected.rangeMax} USDC
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: "1px solid #eee",
                    paddingTop: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ fontSize: "0.875rem", color: "#666" }}>
                      Trade hidden until inclusion
                    </span>
                    <span style={{ fontWeight: "600" }}>Yes</span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ fontSize: "0.875rem", color: "#666" }}>
                      Lower slippage buffer
                    </span>
                    <span style={{ fontWeight: "600" }}>
                      {results.protected.slippage}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ fontSize: "0.875rem", color: "#666" }}>
                      Failure risk
                    </span>
                    <span style={{ fontWeight: "600", color: "#4caf50" }}>
                      {results.protected.risk}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ fontSize: "0.875rem", color: "#666" }}>
                      MEV avoided (est.)
                    </span>
                    <span style={{ fontWeight: "600" }}>
                      {results.protected.mevAvoided}%
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ fontSize: "0.875rem", color: "#666" }}>
                      Execution confidence
                    </span>
                    <span style={{ fontWeight: "600", color: "#4caf50" }}>
                      Higher
                    </span>
                  </div>
                </div>

                {/* Reduced Risks */}
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "0.75rem",
                    backgroundColor: "#e8f5e9",
                    border: "1px solid #4caf50",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                    color: "#2e7d32",
                  }}
                >
                  <div style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
                    Reduced risk of:
                  </div>
                  <div style={{ fontSize: "0.75rem", lineHeight: "1.4" }}>
                    • Sandwiching
                    <br />• Pre-trade visibility
                  </div>
                </div>
              </div>
            </div>

            {/* When This Matters Most */}
            <div
              style={{
                backgroundColor: "white",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <h3
                style={{
                  margin: "0 0 1rem 0",
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  color: "#333",
                }}
              >
                When this matters most
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.875rem",
                  }}
                >
                  <span style={{ color: "#4caf50", fontSize: "1.25rem" }}>
                    ✓
                  </span>
                  <span>Trade size is large</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.875rem",
                  }}
                >
                  <span style={{ color: "#4caf50", fontSize: "1.25rem" }}>
                    ✓
                  </span>
                  <span>Volatility is high</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.875rem",
                  }}
                >
                  <span style={{ color: "#4caf50", fontSize: "1.25rem" }}>
                    ✓
                  </span>
                  <span>Liquidity is thin</span>
                </div>
              </div>
            </div>

            {/* Why This Happens */}
            <details
              style={{
                backgroundColor: "white",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "2rem",
                cursor: "pointer",
              }}
            >
              <summary
                style={{
                  fontWeight: "600",
                  fontSize: "1rem",
                  color: "#333",
                  marginBottom: "0.5rem",
                }}
              >
                Why this happens
              </summary>
              <div
                style={{
                  marginTop: "1rem",
                  fontSize: "0.875rem",
                  color: "#666",
                  lineHeight: "1.6",
                }}
              >
                In public swaps, your intent is visible before execution. Bots
                can react faster than you, changing the final price. Private
                execution hides intent until inclusion.
              </div>
            </details>

            {/* Disclaimer */}
            <div
              style={{
                backgroundColor: results.isMock ? "#fff3e0" : "#e3f2fd",
                border: results.isMock
                  ? "1px solid #ff9800"
                  : "1px solid #2196f3",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1rem",
                fontSize: "0.875rem",
                color: results.isMock ? "#e65100" : "#0d47a1",
              }}
            >
              {results.isMock ? (
                <>
                  <strong>Demo Mode:</strong> Using mock pricing data
                  (~$195/SOL). Protected route output is simulated based on
                  historical MEV loss ranges for retail trades (0.1–0.4%) and
                  includes a 0.1% platform fee.
                </>
              ) : (
                <>
                  <strong>Note:</strong> Normal route uses real Jupiter quotes.
                  Protected route output is simulated based on historical MEV
                  loss ranges for retail trades (0.1–0.4%) and includes a 0.1%
                  platform fee. This demonstrates how private orderflow
                  execution reduces exposure compared to public mempool
                  visibility.
                </>
              )}
            </div>

            {/* What This Demo Is NOT */}
            <div
              style={{
                backgroundColor: "#f9f9f9",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "2rem",
                fontSize: "0.95rem",
                color: "#666",
                textAlign: "center",
              }}
            >
              This demo does not execute trades or guarantee outcomes. Protected
              execution shown here is a simulation to explain potential
              benefits.
            </div>

            {/* Feedback */}
            {!feedbackSent ? (
              <div
                style={{
                  backgroundColor: "white",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "1.5rem",
                  textAlign: "center",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 1rem 0",
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    color: "#333",
                  }}
                >
                  Was this useful?
                </h3>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    marginBottom: "1rem",
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={() => sendFeedback("confused")}
                      disabled={isLoading}
                      style={{
                        padding: "0.75rem 1.5rem",
                        backgroundColor: "white",
                        border: "2px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "1rem",
                        cursor: isLoading ? "not-allowed" : "pointer",
                        fontWeight: "500",
                        transition: "all 0.2s",
                        opacity: isLoading ? 0.7 : 1,
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.borderColor = "#666")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.borderColor = "#ddd")
                      }
                    >
                      {isLoading ? "Sending..." : "😕 Confusing"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openFeedbackModal("confused");
                      }}
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-8px",
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        backgroundColor: "#666",
                        color: "white",
                        border: "none",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "600",
                      }}
                      title="Add details"
                    >
                      +
                    </button>
                  </div>
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={() => sendFeedback("interesting")}
                      disabled={isLoading}
                      style={{
                        padding: "0.75rem 1.5rem",
                        backgroundColor: "white",
                        border: "2px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "1rem",
                        cursor: isLoading ? "not-allowed" : "pointer",
                        fontWeight: "500",
                        transition: "all 0.2s",
                        opacity: isLoading ? 0.7 : 1,
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.borderColor = "#666")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.borderColor = "#ddd")
                      }
                    >
                      {isLoading ? "Sending..." : "🤔 Interesting"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openFeedbackModal("interesting");
                      }}
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-8px",
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        backgroundColor: "#666",
                        color: "white",
                        border: "none",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "600",
                      }}
                      title="Add details"
                    >
                      +
                    </button>
                  </div>
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={() => sendFeedback("want_this")}
                      disabled={isLoading}
                      style={{
                        padding: "0.75rem 1.5rem",
                        backgroundColor: "white",
                        border: "2px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "1rem",
                        cursor: isLoading ? "not-allowed" : "pointer",
                        fontWeight: "500",
                        transition: "all 0.2s",
                        opacity: isLoading ? 0.7 : 1,
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.borderColor = "#666")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.borderColor = "#ddd")
                      }
                    >
                      {isLoading ? "Sending..." : "🔥 I want this"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openFeedbackModal("want_this");
                      }}
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-8px",
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        backgroundColor: "#666",
                        color: "white",
                        border: "none",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "600",
                      }}
                      title="Add details"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: "#e8f5e9",
                  border: "1px solid #4caf50",
                  borderRadius: "8px",
                  padding: "1rem",
                  textAlign: "center",
                  color: "#2e7d32",
                  fontWeight: "600",
                }}
              >
                Thanks for your feedback! 🙏
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: "3rem",
            color: "#999",
            fontSize: "0.975rem",
          }}
        >
          <p>No wallet required • No signup • Just education</p>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
          onClick={() => setShowFeedbackModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "2rem",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: "0 0 0.5rem 0",
                fontSize: "1.25rem",
                fontWeight: "600",
                color: "#333",
              }}
            >
              {selectedSentiment === "confused" &&
                "😕 Help us understand what's confusing"}
              {selectedSentiment === "interesting" &&
                "🤔 We'd love to hear more"}
              {selectedSentiment === "want_this" &&
                "🔥 Tell us why you want this"}
            </h3>
            <p
              style={{
                margin: "0 0 1rem 0",
                fontSize: "0.875rem",
                color: "#666",
              }}
            >
              {selectedSentiment === "confused" &&
                "What part didn't make sense? Your feedback helps us explain better."}
              {selectedSentiment === "interesting" &&
                "What caught your attention? What questions do you have?"}
              {selectedSentiment === "want_this" &&
                "What would you use this for? Share your thoughts!"}
            </p>

            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Share your thoughts..."
              autoFocus
              style={{
                width: "100%",
                minHeight: "120px",
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "1rem",
                fontFamily: "inherit",
                resize: "vertical",
                marginBottom: "1rem",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedbackText("");
                  setSelectedSentiment("");
                }}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "white",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => sendFeedback(selectedSentiment, feedbackText)}
                disabled={isLoading || !feedbackText.trim()}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: isLoading
                    ? "#ccc"
                    : feedbackText.trim()
                    ? "#111"
                    : "#ccc",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "1rem",
                  cursor: isLoading || !feedbackText.trim() ? "not-allowed" : "pointer",
                  fontWeight: "600",
                }}
              >
                {isLoading ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
