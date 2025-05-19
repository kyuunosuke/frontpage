import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  CalendarIcon,
  FilterIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface FilterPanelProps {
  onFilterChange?: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  categories: string[];
  prizeRange: [number, number];
  endDate: Date | null;
  difficultyLevel: string | null;
}

const FilterPanel = ({ onFilterChange = () => {} }: FilterPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    prizeRange: [0, 10000],
    endDate: null,
    difficultyLevel: null,
  });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const categories = [
    "Sweepstakes",
    "Photo Contest",
    "Video Contest",
    "Writing Contest",
    "Social Media",
    "Instant Win",
  ];

  const difficultyLevels = ["Easy", "Medium", "Hard", "Expert"];

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];

    updateFilters({ ...filters, categories: newCategories });
  };

  const updateFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);

    // Count active filters
    let count = 0;
    if (newFilters.categories.length > 0) count++;
    if (newFilters.prizeRange[0] > 0 || newFilters.prizeRange[1] < 10000)
      count++;
    if (newFilters.endDate) count++;
    if (newFilters.difficultyLevel) count++;

    setActiveFiltersCount(count);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const resetFiltersState = {
      categories: [],
      prizeRange: [0, 10000],
      endDate: null,
      difficultyLevel: null,
    };
    updateFilters(resetFiltersState);
  };

  const formatPrizeValue = (value: number) => {
    return value >= 1000 ? `$${value / 1000}k` : `$${value}`;
  };

  return (
    <div className="w-full bg-background border-b shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3">
        {/* Mobile Filter Toggle */}
        <div className="md:hidden flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex justify-between items-center"
          >
            <div className="flex items-center">
              <FilterIcon className="mr-2 h-4 w-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            {isExpanded ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Filter Panel Content */}
        <div
          className={cn(
            "grid gap-4",
            isExpanded ? "grid-cols-1 mt-4" : "hidden md:grid md:grid-cols-5",
          )}
        >
          {/* Categories Filter */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={
                    filters.categories.includes(category)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Prize Range Filter */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Prize Value</h3>
            <Slider
              defaultValue={[0, 10000]}
              value={filters.prizeRange}
              min={0}
              max={10000}
              step={500}
              onValueChange={(value) =>
                updateFilters({
                  ...filters,
                  prizeRange: value as [number, number],
                })
              }
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatPrizeValue(filters.prizeRange[0])}</span>
              <span>{formatPrizeValue(filters.prizeRange[1])}</span>
            </div>
          </div>

          {/* End Date Filter */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">End Date</h3>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate ? (
                    format(filters.endDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.endDate || undefined}
                  onSelect={(date) =>
                    updateFilters({ ...filters, endDate: date })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Difficulty Level Filter */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Difficulty Level</h3>
            <Select
              value={filters.difficultyLevel || "any"}
              onValueChange={(value) =>
                updateFilters({
                  ...filters,
                  difficultyLevel: value === "any" ? null : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any difficulty</SelectItem>
                {difficultyLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end space-x-2">
            <Button
              variant="default"
              className="flex-1"
              onClick={() => onFilterChange(filters)}
            >
              Apply Filters
            </Button>
            <Button variant="outline" className="flex-1" onClick={resetFilters}>
              Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
