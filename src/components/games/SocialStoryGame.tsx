import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ThumbsUp, ArrowRight, Star } from "lucide-react";
import { toast } from "sonner";
import { useGameSession } from "./gameSession";

const scenarios = [
  {
    title: "Sharing Toys",
    situation: "Your friend wants to play with your favorite toy. What should you do?",
    choices: [
      { text: "Share and take turns", isGood: true, feedback: "Great choice! Sharing makes everyone happy! 😊" },
      { text: "Say no and keep it", isGood: false },
      { text: "Offer a different toy", isGood: true, feedback: "Good idea! You're being kind and thoughtful! 🌟" },
    ]
  },
  {
    title: "Feeling Upset",
    situation: "You feel angry because you lost a game. What's the best thing to do?",
    choices: [
      { text: "Take deep breaths", isGood: true, feedback: "Perfect! Breathing helps us calm down! 💙" },
      { text: "Yell and throw things", isGood: false },
      { text: "Ask for a hug", isGood: true, feedback: "Wonderful! Asking for help is brave! 🤗" },
    ]
  },
  {
    title: "Making New Friends",
    situation: "You see a new kid at school sitting alone. What could you do?",
    choices: [
      { text: "Say hello and introduce yourself", isGood: true, feedback: "Amazing! You're being so friendly! 🌈" },
      { text: "Ignore them", isGood: false },
      { text: "Invite them to play", isGood: true, feedback: "You're so kind! That will make them feel happy! ⭐" },
    ]
  },
  {
    title: "Helping at Home",
    situation: "Mom looks tired after work. What can you do to help?",
    choices: [
      { text: "Clean up your toys", isGood: true, feedback: "Excellent! You're being helpful and caring! 💚" },
      { text: "Make more mess", isGood: false },
      { text: "Ask if she needs help", isGood: true, feedback: "So thoughtful! Asking is always good! 🌟" },
    ]
  },
];

const SocialStoryGame = () => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const { reportMistake } = useGameSession();

  const handleChoice = (index: number, isGood: boolean) => {
    setSelectedChoice(index);
    const choice = scenarios[currentScenario].choices[index];

    if (isGood) {
      setScore(score + 1);
      setShowFeedback(choice.feedback ?? null);
      toast.success(choice.feedback ?? "Great answer!");
    } else {
      // Find correct answer(s) to show as positive guidance
      const correctChoices = scenarios[currentScenario].choices.filter((c) => c.isGood);
      const correctText = correctChoices.map((c) => c.text).join(" or ");
      const betterMsg = `A better answer is: ${correctText}. You're learning! 💡`;
      setShowFeedback(betterMsg);
      toast.info(betterMsg);
      reportMistake();
    }
  };

  const nextScenario = () => {
    setSelectedChoice(null);
    setShowFeedback(null);
    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(currentScenario + 1);
    } else {
      toast.success(`Great job! You got ${score} good choices! 🎉`);
      setCurrentScenario(0);
      setScore(0);
    }
  };

  const scenario = scenarios[currentScenario];

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-bold text-primary">Social Stories! 📖</h3>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-primary">{scenario.title}</h4>
          <span className="text-sm bg-primary/20 px-3 py-1 rounded-full">
            {currentScenario + 1}/{scenarios.length}
          </span>
        </div>
        <p className="text-base mb-6 bg-white/50 p-4 rounded-lg">
          {scenario.situation}
        </p>

        <div className="space-y-3">
          {scenario.choices.map((choice, index) => (
            <Button
              key={index}
              onClick={() => handleChoice(index, choice.isGood)}
              disabled={selectedChoice !== null}
              variant={
                selectedChoice === index
                  ? choice.isGood
                    ? "default"
                    : "secondary"
                  : "outline"
              }
              className="w-full justify-start text-left h-auto py-3 px-4"
            >
              <span className="flex items-center gap-2">
                {selectedChoice === index && choice.isGood && <ThumbsUp className="w-4 h-4" />}
                {selectedChoice === index && !choice.isGood && <Star className="w-4 h-4" />}
                {choice.text}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {selectedChoice !== null && showFeedback && (
        <div className="mb-4 p-4 bg-white/60 rounded-lg text-center">
          <p className="text-base font-medium text-foreground">{showFeedback}</p>
        </div>
      )}

      {selectedChoice !== null && (
        <div className="flex justify-center">
          <Button onClick={nextScenario} className="gap-2">
            Next Story
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </Card>
  );
};

export default SocialStoryGame;
