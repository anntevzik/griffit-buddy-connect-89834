import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gamepad2, Heart, Palette, Brain, PenTool, BookOpen } from "lucide-react";
import MemoryGame from "./MemoryGame";
import ColorMatchGame from "./ColorMatchGame";
import BreathingGame from "./BreathingGame";
import TracingGame from "./TracingGame";
import SequenceGame from "./SequenceGame";
import SocialStoryGame from "./SocialStoryGame";

const MiniGames = () => {
  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="flex items-center gap-3 mb-6">
        <Gamepad2 className="w-8 h-8 text-primary" />
        <h2 className="text-2xl font-bold text-primary">Fun Games! 🎮</h2>
      </div>

      <Tabs defaultValue="memory" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6">
          <TabsTrigger value="memory" className="gap-2">
            <Brain className="w-4 h-4" />
            Memory
          </TabsTrigger>
          <TabsTrigger value="colors" className="gap-2">
            <Palette className="w-4 h-4" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="breathing" className="gap-2">
            <Heart className="w-4 h-4" />
            Breathe
          </TabsTrigger>
          <TabsTrigger value="tracing" className="gap-2">
            <PenTool className="w-4 h-4" />
            Trace
          </TabsTrigger>
          <TabsTrigger value="sequence" className="gap-2">
            <Brain className="w-4 h-4" />
            Sequence
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <BookOpen className="w-4 h-4" />
            Stories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="memory">
          <MemoryGame />
        </TabsContent>

        <TabsContent value="colors">
          <ColorMatchGame />
        </TabsContent>

        <TabsContent value="breathing">
          <BreathingGame />
        </TabsContent>

        <TabsContent value="tracing">
          <TracingGame />
        </TabsContent>

        <TabsContent value="sequence">
          <SequenceGame />
        </TabsContent>

        <TabsContent value="social">
          <SocialStoryGame />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default MiniGames;
