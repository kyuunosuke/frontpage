import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Archive,
  CalendarDays,
  Clock,
  Filter,
  Plus,
  Search,
  Trophy,
} from "lucide-react";
import { CompetitionStatus } from "@/types/competition";

interface AdminSidenavProps {
  competitions: {
    id: string;
    title: string;
    status: CompetitionStatus;
    category: string;
  }[];
  selectedCompetitionId: string | null;
  onSelectCompetition: (id: string) => void;
  onAddNewCompetition: () => void;
  onFilterChange: (filter: {
    status?: CompetitionStatus;
    search?: string;
  }) => void;
}

const AdminSidenav: React.FC<AdminSidenavProps> = ({
  competitions,
  selectedCompetitionId,
  onSelectCompetition,
  onAddNewCompetition,
  onFilterChange,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState<
    CompetitionStatus | "all"
  >("all");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onFilterChange({ search: query });
  };

  const handleFilterClick = (status: CompetitionStatus | "all") => {
    setActiveFilter(status);
    onFilterChange({ status: status === "all" ? undefined : status });
  };

  const getStatusColor = (status: CompetitionStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "past":
        return "bg-gray-100 text-gray-800";
      case "archived":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-64 border-r h-full bg-white flex flex-col">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2">Competition Admin</h2>
        <Button
          onClick={onAddNewCompetition}
          className="w-full flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Competition
        </Button>
      </div>

      <div className="px-4 py-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search competitions..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="px-4 py-2">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterClick("all")}
            className="text-xs h-7"
          >
            All
          </Button>
          <Button
            variant={activeFilter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterClick("active")}
            className="text-xs h-7"
          >
            <Trophy className="h-3 w-3 mr-1" /> Active
          </Button>
          <Button
            variant={activeFilter === "upcoming" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterClick("upcoming")}
            className="text-xs h-7"
          >
            <CalendarDays className="h-3 w-3 mr-1" /> Upcoming
          </Button>
          <Button
            variant={activeFilter === "past" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterClick("past")}
            className="text-xs h-7"
          >
            <Clock className="h-3 w-3 mr-1" /> Past
          </Button>
          <Button
            variant={activeFilter === "archived" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterClick("archived")}
            className="text-xs h-7"
          >
            <Archive className="h-3 w-3 mr-1" /> Archived
          </Button>
        </div>
      </div>

      <Separator className="my-2" />

      <ScrollArea className="flex-1">
        <div className="px-2 py-2">
          {competitions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No competitions found
            </div>
          ) : (
            competitions.map((competition) => (
              <div
                key={competition.id}
                className={cn(
                  "p-3 rounded-md mb-2 cursor-pointer hover:bg-gray-100 transition-colors",
                  selectedCompetitionId === competition.id
                    ? "bg-gray-100"
                    : "bg-white",
                )}
                onClick={() => onSelectCompetition(competition.id)}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-sm line-clamp-2">
                    {competition.title}
                  </h3>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      getStatusColor(competition.status),
                    )}
                  >
                    {competition.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {competition.category}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AdminSidenav;
