import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CompetitionCard from "./CompetitionCard";

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

const CompetitionGrid: React.FC<CompetitionGridProps> = ({
  competitions = defaultCompetitions,
  filters = {},
}) => {
  const [filteredCompetitions, setFilteredCompetitions] =
    useState<Competition[]>(competitions);
  const [isLoading, setIsLoading] = useState(false);

  // Apply filters when they change
  useEffect(() => {
    setIsLoading(true);

    // Simulate loading delay
    const timer = setTimeout(() => {
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
          const prizeNumber = parseInt(comp.prizeValue.replace(/[^0-9]/g, ""));
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
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [competitions, filters]);

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

// Default competitions data for development and testing
const defaultCompetitions: Competition[] = [
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
  {
    id: "3",
    title: "Culinary Creations Sweepstakes",
    imageUrl:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80",
    deadline: "2023-07-31",
    prizeValue: "$2,500",
    category: "Food",
    difficulty: "Medium",
    requirements:
      "Submit an original recipe with photos of the finished dish. Recipe must include the sponsor's product as a key ingredient.",
    description:
      "Create delicious recipes using our sponsor products and win kitchen appliances and cash prizes.",
  },
  {
    id: "4",
    title: "Fitness Transformation Challenge",
    imageUrl:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
    deadline: "2023-10-15",
    prizeValue: "$10,000",
    category: "Fitness",
    difficulty: "Hard",
    requirements:
      "Document your 12-week fitness journey with weekly updates, before/after photos, and a detailed training and nutrition log.",
    description:
      "Transform your body and life in our 12-week challenge with expert coaching and substantial prizes.",
  },
  {
    id: "5",
    title: "Short Story Competition",
    imageUrl:
      "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&q=80",
    deadline: "2023-08-31",
    prizeValue: "$3,000",
    category: "Writing",
    difficulty: "Medium",
    requirements:
      'Submit an original short story between 2,000-5,000 words on the theme "Beginnings". Stories must be previously unpublished.',
    description:
      "Share your creative writing talents in our annual short story competition with publication opportunities.",
  },
  {
    id: "6",
    title: "Sustainable Design Awards",
    imageUrl:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80",
    deadline: "2023-11-30",
    prizeValue: "$15,000",
    category: "Design",
    difficulty: "Medium",
    requirements:
      "Submit designs for sustainable home products that reduce environmental impact. Include material specifications, production methods, and impact analysis.",
    description:
      "Design innovative sustainable products that could change how we live and reduce our environmental footprint.",
  },
  {
    id: "7",
    title: "Mobile App Development Contest",
    imageUrl:
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80",
    deadline: "2023-09-15",
    prizeValue: "$20,000",
    category: "Technology",
    difficulty: "Hard",
    requirements:
      "Develop and submit a working mobile app that addresses a social or environmental challenge. App must be original and not previously published.",
    description:
      "Create innovative mobile applications that solve real-world problems and compete for development funding.",
  },
  {
    id: "8",
    title: "Travel Photography Contest",
    imageUrl:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
    deadline: "2023-08-01",
    prizeValue: "$4,000",
    category: "Photography",
    difficulty: "Easy",
    requirements:
      "Submit up to 5 travel photographs that tell a story about a place or culture. Include location details and a brief description for each photo.",
    description:
      "Share your travel experiences through photography and win prizes including camera equipment and travel vouchers.",
  },
];

export default CompetitionGrid;
