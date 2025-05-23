import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AdminSidenav from "./AdminSidenav";
import CompetitionEditor from "./CompetitionEditor";
import AdminLogin from "./AdminLogin";
import { Competition, CompetitionFormData } from "@/types/competition";
import { Loader2, LogOut } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const AdminPortal: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
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
  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // Verify if user is an admin
          const { data: adminData, error: adminError } = await supabase
            .from("admin_users")
            .select("*")
            .eq("user_id", session.user.id)
            .single();

          if (!adminError && adminData) {
            setIsAuthenticated(true);
          } else {
            // Not an admin, sign out
            await supabase.auth.signOut();
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Auth check error:", err);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  useEffect(() => {
    // Only fetch competitions if authenticated
    if (!isAuthenticated) return;

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
        description: data.description || null,
        image_url: data.imageUrl,
        competition_url: data.competitionUrl || null,
        category: data.category,
        difficulty: data.difficulty,
        prize_value: data.prizeValue,
        requirements: data.requirements,
        rules: data.rules,
        start_date: data.startDate || null,
        end_date: data.endDate || null,
        deadline: data.endDate || null, // Using endDate for deadline as well
        entry_difficulty: data.difficulty, // Using the same difficulty for entry_difficulty
        entry_url: data.competitionUrl || null,
        status: data.status,
        updated_at: new Date().toISOString(),
      };

      // Get current user if authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        competitionData.created_by = user.id;
      }

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

      console.log("Supabase result:", result);

      if (result.error) throw result.error;

      // If this is a new competition and we have requirements in the form data,
      // add them to the competition_requirements table
      if (!selectedCompetitionId && result.data && result.data[0]) {
        const competitionId = result.data[0].id;

        // Add eligibility criteria if available
        if (data.requirements) {
          const eligibilityCriteria = data.requirements
            .split("\n")
            .filter((line) => line.trim());
          if (eligibilityCriteria.length > 0) {
            await supabase.from("competition_eligibility").insert(
              eligibilityCriteria.map((criteria) => ({
                competition_id: competitionId,
                criteria: criteria.trim(),
              })),
            );
          }
        }

        // Add requirements from rules
        if (data.rules && data.rules.length > 0) {
          await supabase.from("competition_requirements").insert(
            data.rules.map((rule) => ({
              competition_id: competitionId,
              requirement: rule,
            })),
          );
        }
      }

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

  if (isCheckingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Checking authentication...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

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
        <div className="p-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-1"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
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
