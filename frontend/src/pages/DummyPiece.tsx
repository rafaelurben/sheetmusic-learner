import { useParams } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/shadcn/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shadcn/components/ui/card";
import { Label } from "@/shadcn/components/ui/label";
import { Input } from "@/shadcn/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shadcn/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/components/ui/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shadcn/components/ui/avatar";
import {
  CheckIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  TrashIcon,
  UploadIcon,
  UsersIcon,
} from "lucide-react";

import { usePageTitle } from "@/zustand/pageTitleStore.ts";

export default function DummyPiece() {
  const { id } = useParams();
  const [isEditingPiece, setIsEditingPiece] = useState(false);
  const [isManagingPermissions, setIsManagingPermissions] = useState(false);

  // Mock data
  const piece = {
    title: "Piece Title",
    composer: "Composer Name",
    year: "2024",
    description: "A beautiful piece of music",
    bpmRange: "60-120 BPM",
  };

  usePageTitle(`Piece: ${piece.title}`);

  const permissions = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      avatar: "",
      role: "owner",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      avatar: "",
      role: "editor",
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob.johnson@example.com",
      avatar: "",
      role: "reader",
    },
  ];

  const sections = [
    {
      id: 1,
      name: "Section A",
      bars: 8,
      bpm: 110,
      timeSignature: "2/4",
      sheet: 1,
      isEditing: false,
    },
    {
      id: 2,
      name: "Section B",
      bars: 4,
      bpm: 120,
      timeSignature: "4/4",
      sheet: 1,
      isEditing: true,
    },
  ];

  return (
    <div className="flex h-full flex-col gap-4 p-2 pt-0">
      {/* Header with title and play button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-4 items-center justify-center rounded-full bg-green-500 text-white text-xs font-semibold">
            ●
          </div>
          <h1 className="text-2xl font-bold">Piece #{id}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={() => {
              setIsManagingPermissions(true);
            }}
          >
            <UsersIcon className="size-5" />
            Permissions
          </Button>
          <Button size="lg" className="gap-2">
            <PlayIcon className="size-5" />
            Play
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-auto lg:flex-row lg:overflow-hidden">
        {/* Main content area */}
        <div className="flex flex-1 flex-col gap-4 lg:overflow-auto">
          {/* Title Card */}
          <Card>
            <CardHeader>
              <CardTitle>{piece.title}</CardTitle>
              <CardAction>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    setIsEditingPiece(true);
                  }}
                >
                  <PencilIcon />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Composer:</span>{" "}
                  {piece.composer}
                </div>
                <div>
                  <span className="text-muted-foreground">Year:</span>{" "}
                  {piece.year}
                </div>
                <div>
                  <span className="text-muted-foreground">Description:</span>{" "}
                  {piece.description}
                </div>
                <div>
                  <span className="text-muted-foreground">BPM Range:</span>{" "}
                  {piece.bpmRange}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Card */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Score</CardTitle>
              <CardAction>
                <Button variant="ghost" size="icon-sm">
                  <UploadIcon />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex h-100 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg font-medium">Sheet Music Display</p>
                  <p className="text-sm">
                    Music notation will be rendered here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar - Sections */}
        <div className="w-full lg:w-100 lg:shrink-0">
          <Card className="h-full">
            <CardHeader className="border-b">
              <CardTitle>Sections</CardTitle>
              <CardAction>
                <Button variant="ghost" size="icon-sm">
                  <PlusIcon />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-4">
              {sections.map((section) => (
                <Card key={section.id} className="border-2">
                  <CardContent>
                    {section.isEditing ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <Input
                            defaultValue={section.name}
                            className="flex-1 font-semibold"
                          />
                          <Select defaultValue={section.sheet.toString()}>
                            <SelectTrigger size="sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Sheet 1</SelectItem>
                              <SelectItem value="2">Sheet 2</SelectItem>
                              <SelectItem value="3">Sheet 3</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Label className="text-xs text-muted-foreground">
                              Time
                            </Label>
                            <Select defaultValue={section.timeSignature}>
                              <SelectTrigger className="mt-1" size="sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="2/4">2/4</SelectItem>
                                <SelectItem value="3/4">3/4</SelectItem>
                                <SelectItem value="4/4">4/4</SelectItem>
                                <SelectItem value="6/8">6/8</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs text-muted-foreground">
                              Bars
                            </Label>
                            <Input
                              type="number"
                              defaultValue={section.bars}
                              className="mt-1"
                            />
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs text-muted-foreground">
                              BPM
                            </Label>
                            <Input
                              type="number"
                              defaultValue={section.bpm}
                              className="mt-1"
                            />
                          </div>
                          <div className="flex gap-1 self-end">
                            <Button variant="default" size="icon-sm">
                              <CheckIcon />
                            </Button>
                            <Button variant="outline" size="icon-sm">
                              <TrashIcon className="text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{section.name}</span>
                          <span className="text-muted-foreground text-sm">
                            Sheet {section.sheet}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Label className="text-xs text-muted-foreground">
                              Time
                            </Label>
                            <div className="mt-1 font-medium">
                              {section.timeSignature}
                            </div>
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs text-muted-foreground">
                              Bars
                            </Label>
                            <div className="mt-1 font-medium">
                              {section.bars}
                            </div>
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs text-muted-foreground">
                              BPM
                            </Label>
                            <div className="mt-1 font-medium">
                              {section.bpm}
                            </div>
                          </div>
                          <div className="flex gap-1 self-end">
                            <Button variant="outline" size="icon-sm">
                              <PencilIcon />
                            </Button>
                            <Button variant="outline" size="icon-sm">
                              <TrashIcon className="text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Piece Modal */}
      <Dialog open={isEditingPiece} onOpenChange={setIsEditingPiece}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Piece Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" defaultValue={piece.title} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="composer">Composer</Label>
              <Input id="composer" defaultValue={piece.composer} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input id="year" defaultValue={piece.year} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" defaultValue={piece.description} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bpmRange">BPM Range</Label>
              <Input id="bpmRange" defaultValue={piece.bpmRange} />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditingPiece(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsEditingPiece(false);
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Permissions Modal */}
      <Sheet
        open={isManagingPermissions}
        onOpenChange={setIsManagingPermissions}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Manage Permissions</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 p-4">
            {/* Add new user section */}
            <div className="space-y-2">
              <Label>Add User</Label>
              <div className="flex gap-2">
                <Input placeholder="Search by name or email..." />
                <Button>
                  <PlusIcon className="size-4" />
                </Button>
              </div>
            </div>

            {/* Users list */}
            <div className="space-y-3">
              <Label>Users with access</Label>
              {permissions.map((user) => (
                <Card key={user.id}>
                  <CardContent className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{user.name}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </div>
                    </div>
                    <Select defaultValue={user.role}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="reader">Reader</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <SheetFooter>
            <Button
              onClick={() => {
                setIsManagingPermissions(false);
              }}
            >
              Done
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
