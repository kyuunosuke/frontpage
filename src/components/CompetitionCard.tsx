import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import {
  BookmarkIcon,
  CalendarIcon,
  ChevronDownIcon,
  TrophyIcon,
} from "lucide-react";

interface CompetitionCardProps {
  id?: string;
  title?: string;
  imageUrl?: string;
  deadline?: string;
  prizeValue?: string;
  category?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  requirements?: string;
  rules?: string[];
  isSaved?: boolean;
  onEnter?: (id: string) => void;
  onSave?: (id: string) => void;
}

const CompetitionCard = ({
  id = "1",
  title = "Photography Contest: Urban Wildlife",
  imageUrl = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80",
  deadline = "May 15, 2023",
  prizeValue = "$1,000",
  category = "Photography",
  difficulty = "Medium",
  requirements = "Submit 3-5 original photographs of wildlife in urban settings. Photos must be high resolution (min 300dpi) and taken within the last 6 months.",
  rules = [
    "All submissions must be original work",
    "Participants must be 18 or older",
    "Minor editing allowed, but no composites",
    "Submission deadline is 11:59 PM EST",
  ],
  isSaved = false,
  onEnter = () => {},
  onSave = () => {},
}: CompetitionCardProps) => {
  const [saved, setSaved] = useState(isSaved);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = async () => {
    setSaved(!saved);
    onSave(id);

    // If we have Supabase integration, save to database
    try {
      const { supabase } = await import("@/lib/supabase");

      // Check if user is authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        if (!saved) {
          // Save competition
          await supabase.from("saved_competitions").insert({
            user_id: user.id,
            competition_id: id,
          });
        } else {
          // Unsave competition
          await supabase
            .from("saved_competitions")
            .delete()
            .match({ user_id: user.id, competition_id: id });
        }
      } else {
        console.log("User not authenticated, cannot save competition");
        // Could show a login prompt here
      }
    } catch (error) {
      console.error("Error saving competition:", error);
    }
  };

  const handleEnter = () => {
    onEnter(id);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <Card className="w-full max-w-[350px] h-full bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-3 right-3">
          <Badge
            variant="secondary"
            className={`${getDifficultyColor(difficulty)} font-medium`}
          >
            {difficulty}
          </Badge>
        </div>
        <div className="absolute top-3 left-3">
          <Badge
            variant="outline"
            className="bg-white/80 backdrop-blur-sm font-medium"
          >
            {category}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <h3 className="text-lg font-bold line-clamp-2">{title}</h3>
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarIcon className="h-4 w-4 mr-1" />
          <span>Deadline: {deadline}</span>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="flex items-center text-sm font-medium">
          <TrophyIcon className="h-4 w-4 mr-1 text-amber-500" />
          <span>Prize: {prizeValue}</span>
        </div>
      </CardContent>

      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-center text-sm"
          >
            View Requirements <ChevronDownIcon className="ml-1 h-4 w-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="bg-white p-4">
          <div className="max-w-md mx-auto">
            <h4 className="text-lg font-bold mb-2">{title}</h4>
            <p className="text-sm text-muted-foreground mb-4">{requirements}</p>

            <h5 className="font-semibold mb-2">Rules:</h5>
            <ul className="text-sm space-y-1 mb-4">
              {rules.map((rule, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>

            <div className="flex justify-center mt-4">
              <Button onClick={handleEnter} className="w-full">
                Enter Competition
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <Separator />

      <CardFooter className="pt-3 pb-3 flex justify-between">
        <Button onClick={handleEnter} className="flex-1 mr-2">
          Enter Now
        </Button>
        <Button
          variant="outline"
          onClick={handleSave}
          className={`${saved ? "bg-primary/10" : ""}`}
        >
          <BookmarkIcon className={`h-5 w-5 ${saved ? "fill-primary" : ""}`} />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CompetitionCard;
