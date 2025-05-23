export type CompetitionStatus = "active" | "upcoming" | "past" | "archived";
export type CompetitionDifficulty = "Easy" | "Medium" | "Hard" | "Expert";

export interface Competition {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  competitionUrl?: string;
  category: string;
  difficulty: CompetitionDifficulty;
  prizeValue: string;
  requirements: string;
  rules: string[];
  startDate?: string;
  endDate?: string;
  status: CompetitionStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompetitionFormData {
  title: string;
  description: string;
  imageUrl: string;
  competitionUrl: string;
  category: string;
  difficulty: CompetitionDifficulty;
  prizeValue: string;
  requirements: string;
  rules: string[];
  startDate: string;
  endDate: string;
  status: CompetitionStatus;
}

export const defaultCompetition: CompetitionFormData = {
  title: "",
  description: "",
  imageUrl: "",
  competitionUrl: "",
  category: "",
  difficulty: "Medium",
  prizeValue: "",
  requirements: "",
  rules: [""],
  startDate: "",
  endDate: "",
  status: "active",
};

export const competitionCategories = [
  "Photography",
  "Technology",
  "Food",
  "Fitness",
  "Writing",
  "Design",
  "Sweepstakes",
  "Video Contest",
  "Social Media",
  "Instant Win",
];

export const competitionDifficulties: CompetitionDifficulty[] = [
  "Easy",
  "Medium",
  "Hard",
  "Expert",
];

export const competitionStatuses: CompetitionStatus[] = [
  "active",
  "upcoming",
  "past",
  "archived",
];
