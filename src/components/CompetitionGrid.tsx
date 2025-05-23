import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CompetitionCard from "./CompetitionCard";
import { supabase } from "@/lib/supabase";

interface Competition {
  id: string;
  title: string;
  imageUrl: string;
  deadline: string;
  prizeValue: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  requirements: string;
  description: string;
}

interface CompetitionGridProps {
  competitions?: Competition[];
  filters?: {
    category?: string;
    prizeRange?: [number, number];
    endDate?: Date;
    difficulty?: string;
  };
}

// Fallback competitions data in case the API fails
const fallbackCompetitions: Competition[] = [
  {
    id: "1",
    title: "Summer Photography Contest",
    imageUrl:
      "https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=800&q=80",
    deadline: "2023-08-15",
    prizeValue: "$5,000",
    category: "Photography",
    difficulty: "Easy",
    requirements:
      "Submit up to 3 original summer-themed photographs. Photos must be high resolution (min 3000px width) and taken within the last 12 months.",
    description:
      "Capture the essence of summer in this photography contest with cash prizes and featured exhibition opportunities.",
  },
  {
    id: "2",
    title: "Tech Innovation Challenge",
    imageUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    deadline: "2023-09-30",
    prizeValue: "$25,000",
    category: "Technology",
    difficulty: "Hard",
    requirements:
      "Submit a working prototype and business plan for an innovative tech solution addressing environmental challenges. Teams of 1-4 people allowed.",
    description:
      "Showcase your innovative tech solutions and win funding to bring your ideas to life.",
  },
];

const CompetitionGrid: React.FC<CompetitionGridProps> = ({
  competitions = fallbackCompetitions,
  filters = {},
}) => {
  const [filteredCompetitions, setFilteredCompetitions] =
    useState<Competition[]>(competitions);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch competitions from Supabase
  useEffect(() => {
    const fetchCompetitions = async () => {
      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from("competitions")
          .select("*")
          .eq("status", "active");

        if (error) throw error;

        // Transform the data to match our Competition interface
        const transformedData: Competition[] = data.map((item) => ({
          id: item.id,
          title: item.title,
          imageUrl: item.image_url,
          deadline: item.deadline || item.end_date || "",
          prizeValue: item.prize_value.toString(),
          category: item.category,
          difficulty: item.entry_difficulty || item.difficulty,
          requirements: item.requirements,
          description: item.description || "",
        }));

        setFilteredCompetitions(transformedData);
      } catch (err) {
        console.error("Error fetching competitions:", err);
        // Fall back to default competitions if there's an error
        setFilteredCompetitions(fallbackCompetitions);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    setIsLoading(true);

    // Apply filters to the competitions
    const applyFilters = async () => {
      try {
        // Start building the query
        let query = supabase
          .from("competitions")
          .select("*")
          .eq("status", "active");

        // Apply category filter
        if (filters.category && filters.category !== "All") {
          query = query.eq("category", filters.category);
        }

        // Apply difficulty filter
        if (filters.difficulty && filters.difficulty !== "All") {
          query = query.eq("difficulty", filters.difficulty);
        }

        // Apply end date filter
        if (filters.endDate) {
          const formattedDate = filters.endDate.toISOString();
          query = query.lte("end_date", formattedDate);
        }

        // Execute the query
        const { data, error } = await query;

        if (error) throw error;

        // Transform and filter by prize range client-side
        let transformedData: Competition[] = data.map((item) => ({
          id: item.id,
          title: item.title,
          imageUrl: item.image_url,
          deadline: item.deadline || item.end_date || "",
          prizeValue: item.prize_value.toString(),
          category: item.category,
          difficulty: item.entry_difficulty || item.difficulty,
          requirements: item.requirements,
          description: item.description || "",
        }));

        // Apply prize range filter client-side
        if (filters.prizeRange) {
          transformedData = transformedData.filter((comp) => {
            const prizeNumber = parseInt(
              comp.prizeValue.replace(/[^0-9]/g, ""),
            );
            return (
              prizeNumber >= filters.prizeRange[0] &&
              prizeNumber <= filters.prizeRange[1]
            );
          });
        }

        setFilteredCompetitions(transformedData);
      } catch (err) {
        console.error("Error applying filters:", err);
        // Fall back to client-side filtering
        const filtered = competitions.filter((comp) => {
          // Filter by category
          if (
            filters.category &&
            filters.category !== "All" &&
            comp.category !== filters.category
          ) {
            return false;
          }

          // Filter by difficulty
          if (
            filters.difficulty &&
            filters.difficulty !== "All" &&
            comp.difficulty !== filters.difficulty
          ) {
            return false;
          }

          // Filter by prize range
          if (filters.prizeRange) {
            const prizeNumber = parseInt(
              comp.prizeValue.replace(/[^0-9]/g, ""),
            );
            if (
              prizeNumber < filters.prizeRange[0] ||
              prizeNumber > filters.prizeRange[1]
            ) {
              return false;
            }
          }

          // Filter by end date
          if (filters.endDate) {
            const deadlineDate = new Date(comp.deadline);
            if (deadlineDate > filters.endDate) {
              return false;
            }
          }

          return true;
        });

        setFilteredCompetitions(filtered);
      } finally {
        setIsLoading(false);
      }
    };

    // Add a small delay to prevent too many requests when filters change rapidly
    const timer = setTimeout(() => {
      applyFilters();
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  // Animation variants for grid items
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="w-full bg-background py-8 px-4 md:px-6 lg:px-8">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredCompetitions.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-medium text-gray-600">
            No competitions match your filters
          </h3>
          <p className="mt-2 text-gray-500">
            Try adjusting your filter criteria
          </p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredCompetitions.map((competition) => (
            <motion.div key={competition.id} variants={itemVariants}>
              <CompetitionCard
                id={competition.id}
                title={competition.title}
                imageUrl={competition.imageUrl}
                deadline={competition.deadline}
                prizeValue={competition.prizeValue}
                category={competition.category}
                difficulty={competition.difficulty}
                requirements={competition.requirements}
                description={competition.description}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default CompetitionGrid;
