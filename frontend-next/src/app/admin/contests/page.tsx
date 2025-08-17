import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockContests } from "@/lib/mock-data";
import {
  Calendar,
  Clock,
  Edit,
  Eye,
  Plus,
  Search,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function AdminContestsPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "default";
      case "active":
        return "destructive";
      case "completed":
        return "secondary";
      default:
        return "default";
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getChallengeCount = (challengeIds: string[]) => {
    return challengeIds.length;
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Manage Contests
          </h1>
          <p className="text-muted-foreground mt-2">
            Create, edit, and manage all platform contests
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/contests/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Contest
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search contests..." className="pl-10" />
        </div>
        <Select>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Durations</SelectItem>
            <SelectItem value="short">Short (&lt;=2h)</SelectItem>
            <SelectItem value="medium">Medium (2-4h)</SelectItem>
            <SelectItem value="long">Long (&gt;4h)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contests Grid */}
      <div className="grid gap-6">
        {mockContests.map((contest) => (
          <Card key={contest.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl">
                      <Link
                        href={`/admin/contests/${contest.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {contest.title}
                      </Link>
                    </CardTitle>
                    <Badge variant={getStatusColor(contest.status)}>
                      {contest.status.charAt(0).toUpperCase() +
                        contest.status.slice(1)}
                    </Badge>
                  </div>
                  <CardDescription className="mb-3">
                    {contest.description}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/contests/${contest.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/contests/${contest.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Start Time</div>
                    <div>{formatDateTime(contest.startTime)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Duration</div>
                    <div>
                      {Math.floor(contest.duration / 60)}h{" "}
                      {contest.duration % 60}m
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Participants</div>
                    <div>
                      {contest.participants}
                      {contest.maxParticipants
                        ? `/${contest.maxParticipants}`
                        : ""}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Trophy className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Problems</div>
                    <div>
                      {getChallengeCount(contest.challenges)} challenges
                    </div>
                  </div>
                </div>
              </div>

              {contest.prizes.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Prizes:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {contest.prizes.map((prize, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {prize}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
