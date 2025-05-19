import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AdminSidenav from "./AdminSidenav";
import CompetitionEditor from "./CompetitionEditor";
import { Competition, CompetitionFormData } from "@/types/competition";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminPortal: React.FC = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [filteredCompetitions, setFilteredCompetitions] = useState<
    Competition[]
  >([]);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [filters, setFilters] = useState<{ status?: string; search?: string }>(
    {},
  );

  // Fetch competitions from Supabase
  useEffect(() => {
    const fetchCompetitions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("competitions")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Transform the data to match our Competition type
        const transformedData: Competition[] = data.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          imageUrl: item.image_url,
          competitionUrl: item.competition_url,
          category: item.category,
          difficulty: item.difficulty,
          prizeValue: item.prize_value,
          requirements: item.requirements,
          rules: item.rules || [],
          startDate: item.start_date,
          endDate: item.end_date,
          status: item.status,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }));

        setCompetitions(transformedData);
        setFilteredCompetitions(transformedData);
      } catch (err) {
        console.error("Error fetching competitions:", err);
        setError("Failed to load competitions. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    let filtered = [...competitions];

    if (filters.status) {
      filtered = filtered.filter((comp) => comp.status === filters.status);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (comp) =>
          comp.title.toLowerCase().includes(searchLower) ||
          (comp.description?.toLowerCase().includes(searchLower) ?? false),
      );
    }

    setFilteredCompetitions(filtered);
  }, [competitions, filters]);

  const handleSelectCompetition = (id: string) => {
    setSelectedCompetitionId(id);
    setIsCreatingNew(false);
  };

  const handleAddNewCompetition = () => {
    setSelectedCompetitionId(null);
    setIsCreatingNew(true);
  };

  const handleFilterChange = (newFilters: {
    status?: string;
    search?: string;
  }) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleSaveCompetition = async (data: CompetitionFormData) => {
    setIsSaving(true);
    setError(null);

    try {
      // Transform the data to match Supabase schema
      const competitionData = {
        title: data.title,
        description: data.description,
        image_url: data.imageUrl,
        competition_url: data.competitionUrl,
        category: data.category,
        difficulty: data.difficulty,
        prize_value: data.prizeValue,
        requirements: data.requirements,
        rules: data.rules,
        start_date: data.startDate,
        end_date: data.endDate,
        status: data.status,
        updated_at: new Date().toISOString(),
      };

      let result;

      if (selectedCompetitionId) {
        // Update existing competition
        result = await supabase
          .from("competitions")
          .update(competitionData)
          .eq("id", selectedCompetitionId);
      } else {
        // Create new competition
        result = await supabase
          .from("competitions")
          .insert({
            ...competitionData,
            created_at: new Date().toISOString(),
          })
          .select();
      }

      if (result.error) throw result.error;

      // Refresh the competitions list
      const { data: refreshedData, error: refreshError } = await supabase
        .from("competitions")
        .select("*")
        .order("created_at", { ascending: false });

      if (refreshError) throw refreshError;

      // Transform the refreshed data
      const transformedData: Competition[] = refreshedData.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        imageUrl: item.image_url,
        competitionUrl: item.competition_url,
        category: item.category,
        difficulty: item.difficulty,
        prizeValue: item.prize_value,
        requirements: item.requirements,
        rules: item.rules || [],
        startDate: item.start_date,
        endDate: item.end_date,
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      setCompetitions(transformedData);

      // If we created a new competition, select it
      if (!selectedCompetitionId && result.data && result.data[0]) {
        setSelectedCompetitionId(result.data[0].id);
        setIsCreatingNew(false);
      }
    } catch (err) {
      console.error("Error saving competition:", err);
      setError("Failed to save competition. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (isCreatingNew) {
      setIsCreatingNew(false);
      setSelectedCompetitionId(
        competitions.length > 0 ? competitions[0].id : null,
      );
    }
  };

  // Get the selected competition
  const selectedCompetition = competitions.find(
    (comp) => comp.id === selectedCompetitionId,
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidenav
        competitions={filteredCompetitions.map((comp) => ({
          id: comp.id,
          title: comp.title,
          status: comp.status,
          category: comp.category,
        }))}
        selectedCompetitionId={selectedCompetitionId}
        onSelectCompetition={handleSelectCompetition}
        onAddNewCompetition={handleAddNewCompetition}
        onFilterChange={handleFilterChange}
      />

      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading competitions...</span>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center p-4">
            <Alert variant="destructive" className="max-w-md">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        ) : isCreatingNew ? (
          <CompetitionEditor
            onSave={handleSaveCompetition}
            onCancel={handleCancelEdit}
            isLoading={isSaving}
          />
        ) : selectedCompetition ? (
          <CompetitionEditor
            competition={selectedCompetition}
            onSave={handleSaveCompetition}
            onCancel={handleCancelEdit}
            isLoading={isSaving}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <h2 className="text-xl font-semibold mb-2">
              No Competition Selected
            </h2>
            <p className="text-muted-foreground mb-4">
              Select a competition from the sidebar or create a new one
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPortal;
