"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Archive,
  ChevronDown,
  Filter,
  MailPlus,
  RefreshCcw,
  Search,
  Trash,
} from "lucide-react";

export function InboxHeader() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm">
            <MailPlus className="mr-2 h-4 w-4" />
            Compose
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Tabs
          defaultValue="all"
          className="w-full md:w-auto"
          onValueChange={setActiveTab}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="flagged">Flagged</TabsTrigger>
            <TabsTrigger value="mentions">Mentions</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex w-full items-center gap-2 md:w-auto">
          <div className="relative flex-1 md:w-64 md:flex-none">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search messages..." className="pl-8" />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Sort by Date</DropdownMenuItem>
              <DropdownMenuItem>Sort by Sender</DropdownMenuItem>
              <DropdownMenuItem>Sort by Priority</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {activeTab !== "all" && (
        <div className="flex items-center justify-between rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <div className="text-sm">
            {activeTab === "unread" && "Showing 8 unread messages"}
            {activeTab === "flagged" && "Showing 3 flagged messages"}
            {activeTab === "mentions" && "Showing 5 messages with mentions"}
          </div>
          <Button variant="ghost" size="sm">
            Clear Filter
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2 border-b pb-4">
        <Button variant="ghost" size="sm" className="text-xs">
          <Archive className="mr-2 h-4 w-4" />
          Archive
        </Button>
        <Button variant="ghost" size="sm" className="text-xs">
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs">
              More
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Mark as Read</DropdownMenuItem>
            <DropdownMenuItem>Mark as Unread</DropdownMenuItem>
            <DropdownMenuItem>Flag Message</DropdownMenuItem>
            <DropdownMenuItem>Add Label</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
