import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";

import {
  Competition,
  CompetitionFormData,
  defaultCompetition,
  competitionCategories,
  competitionDifficulties,
  competitionStatuses,
} from "@/types/competition";

interface CompetitionEditorProps {
  competition?: Competition;
  onSave: (data: CompetitionFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  imageUrl: z
    .string()
    .url("Must be a valid URL")
    .min(1, "Image URL is required"),
  competitionUrl: z.string().url("Must be a valid URL").optional(),
  category: z.string().min(1, "Category is required"),
  difficulty: z.enum(["Easy", "Medium", "Hard", "Expert"]),
  prizeValue: z.string().min(1, "Prize value is required"),
  requirements: z.string().min(1, "Requirements are required"),
  rules: z.array(z.string().min(1, "Rule cannot be empty")),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["active", "upcoming", "past", "archived"]),
});

const CompetitionEditor: React.FC<CompetitionEditorProps> = ({
  competition,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const [imagePreview, setImagePreview] = useState<string>("");

  const form = useForm<CompetitionFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: competition
      ? {
          title: competition.title,
          description: competition.description || "",
          imageUrl: competition.imageUrl,
          competitionUrl: competition.competitionUrl || "",
          category: competition.category,
          difficulty: competition.difficulty,
          prizeValue: competition.prizeValue,
          requirements: competition.requirements,
          rules: competition.rules,
          startDate: competition.startDate || "",
          endDate: competition.endDate || "",
          status: competition.status,
        }
      : defaultCompetition,
  });

  const { watch, setValue, getValues } = form;
  const imageUrl = watch("imageUrl");

  useEffect(() => {
    if (imageUrl) {
      setImagePreview(imageUrl);
    }
  }, [imageUrl]);

  const handleAddRule = () => {
    const currentRules = getValues("rules");
    setValue("rules", [...currentRules, ""]);
  };

  const handleRemoveRule = (index: number) => {
    const currentRules = getValues("rules");
    setValue(
      "rules",
      currentRules.filter((_, i) => i !== index),
    );
  };

  const onSubmit = async (data: CompetitionFormData) => {
    try {
      await onSave(data);
      toast({
        title: "Success",
        description: `Competition ${competition ? "updated" : "created"} successfully`,
      });
    } catch (error) {
      console.error("Error saving competition:", error);
      toast({
        title: "Error",
        description: `Failed to ${competition ? "update" : "create"} competition`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {competition ? "Edit Competition" : "Create New Competition"}
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Competition"}
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Competition title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of the competition"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter a URL for the competition image
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="competitionUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Competition URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/competition"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        External link to the competition (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {competitionCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {competitionDifficulties.map((difficulty) => (
                              <SelectItem key={difficulty} value={difficulty}>
                                {difficulty}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="prizeValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prize Value</FormLabel>
                      <FormControl>
                        <Input placeholder="$1,000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6">
                {imagePreview && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="aspect-video relative rounded-md overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Competition preview"
                          className="w-full h-full object-cover"
                          onError={() => setImagePreview("")}
                        />
                      </div>
                      <p className="text-xs text-center mt-2 text-muted-foreground">
                        Image Preview
                      </p>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              onSelect={(date) =>
                                field.onChange(
                                  date ? date.toISOString() : undefined,
                                )
                              }
                              disabled={(date) => date < new Date("1900-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              onSelect={(date) =>
                                field.onChange(
                                  date ? date.toISOString() : undefined,
                                )
                              }
                              disabled={(date) => date < new Date("1900-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {competitionStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requirements</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Competition requirements"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <FormLabel>Rules</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddRule}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Rule
                </Button>
              </div>

              {form.watch("rules").length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No rules added yet. Click "Add Rule" to add competition
                    rules.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  {form.watch("rules").map((_, index) => (
                    <FormField
                      key={index}
                      control={form.control}
                      name={`rules.${index}`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input
                                placeholder={`Rule ${index + 1}`}
                                {...field}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveRule(index)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CompetitionEditor;
