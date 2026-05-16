"use client";
import { useState, useMemo } from "react";
import { Brain, ChevronRight } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

interface MoneyPersonalityBadgeProps {
  personality: string | null;
  isPro: boolean;
}

const PERSONALITY_ICONS: Record<string, string> = {
  "The Saver": "🐝",
  "The Spender": "🌊",
  "The Investor": "🦅",
  "The Avoider": "🦉",
  "The Planner": "🗺️",
  "The Hustler": "🚀",
};

const PERSONALITY_COLORS: Record<string, string> = {
  "The Saver": "text-mg-success",
  "The Spender": "text-mg-alert",
  "The Investor": "text-blue-400",
  "The Avoider": "text-purple-400",
  "The Planner": "text-mg-gold",
  "The Hustler": "text-orange-400",
};

// Large pool of questions — 5 are randomly picked each time the quiz starts
const ALL_QUESTIONS = [
  // Spending habits
  "When you receive money, what's the first thing you think about?",
  "You see something you want but can't fully afford. What do you do?",
  "How do you decide whether to buy something or save the money?",
  "Describe your last impulse purchase. How did you feel afterwards?",
  "When you're at Owino market or a shopping centre, how do you decide what to buy?",

  // Savings mindset
  "How do you feel when you check your bank balance?",
  "What does financial success look like to you in 5 years?",
  "Have you ever had a savings goal? Did you hit it? What happened?",
  "If someone gave you UGX 500,000 right now, what would you do with it?",
  "How much of your income do you try to save each month, and does it actually happen?",

  // Financial stress
  "How do you handle unexpected expenses like a medical bill or phone repair?",
  "Describe a time when you ran out of money before the end of the month. What caused it?",
  "When money is tight, what's the first thing you cut from your spending?",
  "How do you feel when friends invite you somewhere you can't afford?",

  // Financial goals
  "What's one big financial goal you have right now and what's stopping you from reaching it?",
  "Do you have an emergency fund? If not, what has prevented you from building one?",
  "How do you feel about investing? Would you put money in the stock market or a SACCO?",
  "Where do you see yourself financially in 10 years and what are you doing to get there?",

  // Behaviour and habits
  "Do you know exactly how much you spent last month? What were your biggest expenses?",
  "How do you feel about borrowing money from friends or family?",
  "When you get paid, what happens to your money over the next few days?",
  "Have you ever regretted a financial decision? What was it and what did you learn?",
];

function pickRandomQuestions(count: number = 5): string[] {
  const shuffled = [...ALL_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const RESULT_STORAGE_KEY = "lumi_personality_result";

function loadSavedResult(): any | null {
  try {
    const stored = localStorage.getItem(RESULT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export default function MoneyPersonalityBadge({ personality, isPro }: MoneyPersonalityBadgeProps) {
  const [mode, setMode] = useState<"idle" | "quiz" | "result">("idle");
  // Pick 5 random questions when component first mounts
  const [quizQuestions, setQuizQuestions] = useState<string[]>(() => pickRandomQuestions(5));
  const [answers, setAnswers] = useState<string[]>(Array(5).fill(""));
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [savedResult] = useState<any>(() => loadSavedResult());
  const [isLoading, setIsLoading] = useState(false);
  const { user, setUser } = useAuthStore();

  const currentPersonality = result?.personality_type || personality;

  const openResult = () => {
    const toShow = result || savedResult;
    if (toShow) {
      setResult(toShow);
      setMode("result");
      return;
    }
    if (personality) {
      setResult({
        personality_type: personality,
        description: "You've been identified as this money personality type. Retake the quiz to get your full profile with detailed strengths, weaknesses, and personalised advice from Lumi AI.",
        strengths: [
          "Goal-oriented and financially self-aware",
          "Using Lumi to actively track your money",
          "Taking steps to understand your financial habits",
        ],
        weaknesses: [
          "Retake the quiz to see your specific areas to watch out for",
        ],
        advice: `${user?.first_name || "You"}, retake the quiz below to get Lumi's full personalised advice tailored specifically to your money style and East African financial context.`,
      });
      setMode("result");
    }
  };

  const handleSubmit = async () => {
    if (answers.some((a) => !a.trim())) {
      toast.error("Please answer all questions");
      return;
    }
    setIsLoading(true);
    try {
      // Send both questions and answers so AI has full context
      const data = await api.post<any>("/ai/personality/analyse", {
        answers: answers.map((a, i) => `Q: ${quizQuestions[i]}\nA: ${a}`),
      });
      setResult(data);
      localStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(data));
      if (user) setUser({ ...user, money_personality: data.personality_type });
      setMode("result");
    } catch (e: any) {
      toast.error(e.message || "Quiz analysis failed");
    } finally {
      setIsLoading(false);
    }
  };

  const resetQuiz = () => {
    // Pick fresh random questions each time quiz is retaken
    setQuizQuestions(pickRandomQuestions(5));
    setAnswers(Array(5).fill(""));
    setStep(0);
    setResult(null);
    setMode("quiz");
  };

  // ── Result view
  if (mode === "result") {
    const r = result || savedResult;
    return (
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Brain size={18} className="text-mg-gold" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Money Personality</h3>
        </div>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
          <div className="text-center">
            <span className="text-4xl block mb-2">{PERSONALITY_ICONS[r?.personality_type] || "💰"}</span>
            <p className={`text-lg font-bold ${PERSONALITY_COLORS[r?.personality_type] || "text-mg-gold"}`}>
              {r?.personality_type}
            </p>
            <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">{r?.description}</p>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-card bg-mg-success/10 border border-mg-success/20">
              <p className="text-xs font-bold text-mg-success uppercase tracking-wide mb-2">Strengths</p>
              {r?.strengths?.map((s: string, i: number) => (
                <p key={i} className="text-sm text-[var(--text-secondary)]">✓ {s}</p>
              ))}
            </div>

            <div className="p-3 rounded-card bg-mg-alert/10 border border-mg-alert/20">
              <p className="text-xs font-bold text-mg-alert uppercase tracking-wide mb-2">Watch out for</p>
              {r?.weaknesses?.map((w: string, i: number) => (
                <p key={i} className="text-sm text-[var(--text-secondary)]">⚠ {w}</p>
              ))}
            </div>

            <div className="p-3 rounded-card bg-mg-gold/10 border border-mg-gold/30">
              <p className="text-xs font-bold text-mg-gold uppercase tracking-wide mb-2">Lumi's Advice for You</p>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed">{r?.advice}</p>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button size="sm" variant="primary" className="flex-1" onClick={resetQuiz}>
              Retake Quiz
            </Button>
            <Button size="sm" variant="secondary" className="flex-1" onClick={() => setMode("idle")}>
              Close
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // ── Quiz view
  if (mode === "quiz") {
    return (
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Brain size={18} className="text-mg-gold" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Money Personality Quiz</h3>
        </div>

        <div className="flex gap-1 mb-3">
          {quizQuestions.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-all ${i <= step ? "bg-mg-gold" : "bg-[var(--border)]"}`}
            />
          ))}
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-3">Question {step + 1} of {quizQuestions.length}</p>

        <p className="text-sm font-semibold text-[var(--text-primary)] leading-relaxed mb-3">
          {quizQuestions[step]}
        </p>

        <textarea
          value={answers[step]}
          onChange={(e) => {
            const updated = [...answers];
            updated[step] = e.target.value;
            setAnswers(updated);
          }}
          placeholder="Type your honest answer..."
          rows={3}
          className="w-full rounded-card border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] px-3 py-2.5 text-sm focus:outline-none focus:border-mg-gold resize-none mb-3"
        />

        <div className="flex gap-2">
          {step > 0 && (
            <Button variant="secondary" size="sm" className="flex-1" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setMode("idle")}>
            Cancel
          </Button>
          {step < quizQuestions.length - 1 ? (
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={() => setStep(step + 1)}
              disabled={!answers[step].trim()}
            >
              Next →
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={!answers[step].trim()}
            >
              Analyse ✨
            </Button>
          )}
        </div>
      </Card>
    );
  }

  // ── Idle view
  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <Brain size={18} className="text-mg-gold" />
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Money Personality</h3>
      </div>

      {currentPersonality ? (
        <div className="space-y-3">
          <button
            onClick={openResult}
            className="w-full flex items-center gap-3 p-3 rounded-card bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-mg-gold/40 transition-all text-left"
          >
            <span className="text-3xl">{PERSONALITY_ICONS[currentPersonality] || "💰"}</span>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold ${PERSONALITY_COLORS[currentPersonality] || "text-mg-gold"}`}>
                {currentPersonality}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Tap to view your full profile & advice</p>
            </div>
            <ChevronRight size={16} className="text-[var(--text-muted)] flex-shrink-0" />
          </button>

          {isPro && (
            <Button size="sm" variant="primary" className="w-full" onClick={resetQuiz}>
              Retake Quiz
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-[var(--text-muted)]">
            {isPro
              ? "Discover your money personality with a quick 5-question quiz. Lumi AI tailors all advice to your style."
              : "Upgrade to Pro to discover your money personality."}
          </p>
          {isPro && (
            <Button size="sm" variant="primary" className="w-full" onClick={() => setMode("quiz")}>
              Take the Quiz ✨
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
