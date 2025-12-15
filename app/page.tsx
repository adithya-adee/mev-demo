"use client";

import React, { useState } from "react";
import { TrendingDown, TrendingUp, AlertTriangle, Shield, ChevronDown, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function MEVDemo() {
  const [amount, setAmount] = useState("5");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    normal: {
      output: string;
      loss: string;
      risk: string;
    };
    protected: {
      output: string;
      saved: string;
      risk: string;
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [educationOpen, setEducationOpen] = useState(false);

  const calculateMEVExposure = (solAmount: number): number => {
    if (solAmount < 1) return 0.001;
    if (solAmount <= 5) return 0.0025;
    return 0.004;
  };

  const getRiskLevel = (solAmount: number): string => {
    if (solAmount < 1) return "Low";
    if (solAmount <= 5) return "Medium";
    return "High";
  };

  // Calculate estimated loss for preview
  const getEstimatedLoss = (solAmount: number): string => {
    const mockPrice = 195;
    const estimatedOutput = solAmount * mockPrice;
    const mevExposure = calculateMEVExposure(solAmount);
    const loss = estimatedOutput * mevExposure;
    return loss.toFixed(2);
  };

  const compareSwaps = async () => {
    setLoading(true);
    setResults(null);
    setFeedbackSent(false);

    try {
      const solAmount = parseFloat(amount);
      const response = await fetch(`/api/quote?amount=${Math.floor(solAmount * 1e9)}`);

      if (!response.ok) {
        throw new Error("Failed to fetch quote");
      }

      const data = await response.json();
      const normalOutput = parseFloat(data.outAmount) / 1e6;
      const isMock = data._mock || false;

      const mevExposure = calculateMEVExposure(solAmount);
      const platformFee = 0.001;
      const mevSavings = normalOutput * mevExposure;
      const fee = normalOutput * platformFee;
      const protectedOutput = normalOutput + mevSavings - fee;

      setResults({
        normal: {
          output: normalOutput.toFixed(2),
          loss: mevSavings.toFixed(2),
          risk: getRiskLevel(solAmount),
        },
        protected: {
          output: protectedOutput.toFixed(2),
          saved: (mevSavings - fee).toFixed(2),
          risk: "Low",
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
    } finally {
      setIsLoading(false);
      setFeedbackText("");
      setSelectedSentiment("");
    }
  };

  const openFeedbackModal = (sentiment: string) => {
    setSelectedSentiment(sentiment);
    setShowFeedbackModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium mb-4">
            MEV Demo
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-red-600 mb-3">
            Your Swaps Are Leaking Money
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Bots front-run your trades. See how much you&apos;re losing.
          </p>
        </div>

        {/* Input Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <Label htmlFor="amount" className="text-sm font-medium mb-2">
                  Amount (SOL)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="5"
                  min="0.1"
                  step="0.1"
                  className="text-lg"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2">From</Label>
                <div className="h-10 px-4 py-2 bg-gray-100 border border-gray-200 rounded-md font-semibold flex items-center">
                  SOL
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2">To</Label>
                <div className="h-10 px-4 py-2 bg-gray-100 border border-gray-200 rounded-md font-semibold flex items-center">
                  USDC
                </div>
              </div>

              <Button
                onClick={compareSwaps}
                disabled={loading || !amount || parseFloat(amount) <= 0}
                className="h-10 bg-gray-900 hover:bg-gray-800"
              >
                {loading ? "Loading..." : "Show Me"}
              </Button>
            </div>
            
            {/* Estimated Loss Preview */}
            {!results && amount && parseFloat(amount) > 0 && (
              <Alert className="mt-4 bg-orange-50 border-orange-200">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  Typical loss for {amount} SOL: <strong>~${getEstimatedLoss(parseFloat(amount))}</strong> to MEV bots
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Results - The Loss */}
        {results && (
          <>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Normal Swap - Red Alert Style */}
              <Card className="border-2 border-red-500 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Normal Swap
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">You Get</div>
                      <div className="text-3xl font-bold text-gray-900">
                        ${results.normal.output}
                        <span className="text-base text-gray-500 ml-2">USDC</span>
                      </div>
                    </div>

                    <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-red-700" />
                        <div className="text-sm font-medium text-red-900">
                          You LOSE
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-red-700">
                        ${results.normal.loss}
                      </div>
                      <div className="text-xs text-red-800 mt-1">
                        stolen by MEV bots
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-red-200">
                      <span className="text-sm text-gray-700">MEV Risk</span>
                      <span className={`font-semibold ${
                        results.normal.risk === "High" ? "text-red-600" :
                        results.normal.risk === "Medium" ? "text-orange-600" :
                        "text-gray-600"
                      }`}>
                        {results.normal.risk}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Protected Swap - Green Success Style */}
              <Card className="border-2 border-green-500 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Protected Swap
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">You Get</div>
                      <div className="text-3xl font-bold text-gray-900">
                        ${results.protected.output}
                        <span className="text-base text-gray-500 ml-2">USDC</span>
                      </div>
                    </div>

                    <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-green-700" />
                        <div className="text-sm font-medium text-green-900">
                          You SAVE
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-green-700">
                        ${results.protected.saved}
                      </div>
                      <div className="text-xs text-green-800 mt-1">
                        protected from MEV
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-green-200">
                      <span className="text-sm text-gray-700">MEV Risk</span>
                      <span className="font-semibold text-green-600">
                        {results.protected.risk}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feedback */}
            {!feedbackSent ? (
              <Card className="mb-6">
                <CardContent className="pt-6 text-center">
                  <h3 className="text-lg font-semibold mb-4">
                    Was this useful? Your Feedback Matters!!
                  </h3>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => sendFeedback("confused")}
                      disabled={isLoading}
                      className="relative"
                    >
                      😕 Confusing
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          openFeedbackModal("confused");
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-600 text-white text-xs font-semibold hover:bg-gray-700 cursor-pointer flex items-center justify-center"
                      >
                        +
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => sendFeedback("interesting")}
                      disabled={isLoading}
                      className="relative"
                    >
                      🤔 Interesting
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          openFeedbackModal("interesting");
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-600 text-white text-xs font-semibold hover:bg-gray-700 cursor-pointer flex items-center justify-center"
                      >
                        +
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => sendFeedback("want_this")}
                      disabled={isLoading}
                      className="relative"
                    >
                      🔥 I want this
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          openFeedbackModal("want_this");
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-600 text-white text-xs font-semibold hover:bg-gray-700 cursor-pointer flex items-center justify-center"
                      >
                        +
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Alert className="mb-6 bg-green-50 border-green-500">
                <AlertDescription className="text-green-800 font-semibold text-center">
                  Thanks for your feedback! 🙏
                </AlertDescription>
              </Alert>
            )}

            {/* Educational Section - Collapsible */}
            <Collapsible open={educationOpen} onOpenChange={setEducationOpen}>
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Want to know why? Learn more ↓
                      </h3>
                      <ChevronDown className={`h-5 w-5 text-gray-600 transition-transform ${educationOpen ? "rotate-180" : ""}`} />
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="mt-4">
                    <div className="space-y-4">
                      {/* Sandwich Attacks */}
                      <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">🥪</span>
                          <span className="font-semibold text-orange-900">Sandwich Attacks</span>
                        </div>
                        <p className="text-sm text-gray-700">
                          Bots see your pending transaction and place orders before and after yours. They buy before you (raising the price), then sell after you (lowering it). You pay more and get less.
                        </p>
                      </div>

                      {/* Front-Running */}
                      <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">🏃</span>
                          <span className="font-semibold text-red-900">Front-Running</span>
                        </div>
                        <p className="text-sm text-gray-700">
                          Bots monitor the mempool (pending transactions pool) and copy profitable trades. They pay higher fees to get included first, moving the price before your trade executes.
                        </p>
                      </div>

                      {/* Price Movement */}
                      <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">📈</span>
                          <span className="font-semibold text-blue-900">Price Movement During Execution</span>
                        </div>
                        <p className="text-sm text-gray-700">
                          Between when you submit and when your transaction confirms, other trades happen. The price moves naturally, but you&apos;re locked into your slippage tolerance.
                        </p>
                      </div>

                      {/* Slippage */}
                      <div className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">💧</span>
                          <span className="font-semibold text-purple-900">Slippage & Liquidity</span>
                        </div>
                        <p className="text-sm text-gray-700">
                          Large trades move the price in the liquidity pool itself. Lower liquidity = higher slippage. Your trade changes the price as it executes.
                        </p>
                      </div>

                      {/* Common Thread */}
                      <div className="p-4 bg-gray-100 rounded">
                        <div className="font-semibold text-gray-900 mb-2">The common thread:</div>
                        <p className="text-sm text-gray-700">
                          Your transaction intent is visible in the public mempool before it executes. Bots have milliseconds to react. You can&apos;t outrun them on latency.
                        </p>
                      </div>

                      {/* Learn More Links */}
                      <div className="p-4 bg-blue-50 rounded">
                        <div className="font-semibold text-gray-900 mb-3">📚 Learn more about MEV and bots:</div>
                        <div className="space-y-2">
                          <a
                            href="https://www.webopedia.com/crypto/learn/biggest-mev-bot-attacks/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <span>→</span>
                            <span className="underline">Biggest MEV Bot Attacks</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          <a
                            href="https://www.reddit.com/r/solana/comments/1gzygdz/losing_all_your_money_to_memecoins_the_problem/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <span>→</span>
                            <span className="underline">MEV & Bots on Solana: Real Trader Experiences</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </CardContent>
              </Card>
            </Collapsible>

            {/* Disclaimer */}
            <Alert className={results.isMock ? "bg-orange-50 border-orange-200" : "bg-blue-50 border-blue-200"}>
              <AlertDescription className={results.isMock ? "text-orange-900" : "text-blue-900"}>
                {results.isMock ? (
                  <>
                    <strong>Demo Mode:</strong> Using mock pricing data (~$195/SOL). Protected route output is simulated based on historical MEV loss ranges for retail trades (0.1–0.4%) and includes a 0.1% platform fee.
                  </>
                ) : (
                  <>
                    <strong>Note:</strong> Normal route uses real Jupiter quotes. Protected route output is simulated based on historical MEV loss ranges for retail trades (0.1–0.4%) and includes a 0.1% platform fee.
                  </>
                )}
              </AlertDescription>
            </Alert>

            <p className="text-center text-sm text-gray-500 mt-4">
              Educational simulation only. Not actual trades.
            </p>
          </>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>No wallet • No signup</p>
        </div>
      </div>

      {/* Feedback Modal */}
      <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedSentiment === "confused" && "😕 Help us understand what's confusing"}
              {selectedSentiment === "interesting" && "🤔 We'd love to hear more"}
              {selectedSentiment === "want_this" && "🔥 Tell us why you want this"}
            </DialogTitle>
            <DialogDescription>
              {selectedSentiment === "confused" && "What part didn't make sense? Your feedback helps us explain better."}
              {selectedSentiment === "interesting" && "What caught your attention? What questions do you have?"}
              {selectedSentiment === "want_this" && "What would you use this for? Share your thoughts!"}
            </DialogDescription>
          </DialogHeader>
          
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Share your thoughts..."
            autoFocus
            className="w-full min-h-30 p-3 border border-gray-300 rounded-md resize-vertical"
          />

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowFeedbackModal(false);
                setFeedbackText("");
                setSelectedSentiment("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => sendFeedback(selectedSentiment, feedbackText)}
              disabled={isLoading || !feedbackText.trim()}
              className="bg-gray-900 hover:bg-gray-800"
            >
              {isLoading ? "Sending..." : "Send"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}