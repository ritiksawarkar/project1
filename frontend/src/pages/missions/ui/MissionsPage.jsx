import { Link } from "react-router-dom";
import { routePaths } from "../../../app/router/routePaths.js";
import { Badge } from "../../../shared/ui/badge/Badge.jsx";
import { Button } from "../../../shared/ui/button/Button.jsx";
import { buttonVariants } from "../../../shared/ui/button/buttonVariants.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../shared/ui/card/Card.jsx";
import { useMissions } from "../../../features/missions/model/useMissions.js";
import { useAuth } from "../../../features/auth/model/useAuth.js";
import { authRoles } from "../../../features/auth/model/authRoles.js";
import {
  formatDateTime,
  formatMissionStatus,
  getPriorityBadgeVariant,
} from "../../../features/missions/lib/missionPresentation.js";
import { cn } from "../../../shared/lib/utils.js";

function MissionsPage() {
  const { missions, isLoading, error, refreshMissions } = useMissions();
  const { currentRole } = useAuth();

  const sortedMissions = [...missions].sort(
    (firstMission, secondMission) =>
      new Date(secondMission.updatedAt).getTime() -
      new Date(firstMission.updatedAt).getTime(),
  );

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <Badge variant="success">Protected · Auth Required</Badge>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Mission Control
        </h1>
        <p className="text-sm text-slate-600">
          Manage active pickup and delivery missions with complete handoff
          tracking.
        </p>
        <p className="text-xs text-slate-500">
          Total missions:{" "}
          <span className="font-semibold text-slate-700">
            {sortedMissions.length}
          </span>
        </p>
      </header>

      {isLoading ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Loading missions...</CardTitle>
            <CardDescription>
              Syncing latest mission records from the backend.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : error ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Unable to load missions</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button size="sm" variant="secondary" onClick={refreshMissions}>
              Retry
            </Button>
          </CardFooter>
        </Card>
      ) : sortedMissions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No missions available</CardTitle>
            <CardDescription>
              Mission list will populate automatically after creating donation
              missions.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sortedMissions.map((mission) => (
            <Card key={mission.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2 text-base">
                  <span>{mission.id}</span>
                  <Badge variant={getPriorityBadgeVariant(mission.priority)}>
                    {mission.priority.toUpperCase()}
                  </Badge>
                </CardTitle>
                <CardDescription>{mission.title}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-slate-600">
                <p>
                  <span className="font-medium text-slate-800">Donor:</span>{" "}
                  {mission.donor}
                </p>
                <p>
                  <span className="font-medium text-slate-800">Category:</span>{" "}
                  {mission.category}
                </p>
                <p>
                  <span className="font-medium text-slate-800">Area:</span>{" "}
                  {mission.area}
                </p>
                <p>
                  <span className="font-medium text-slate-800">Status:</span>{" "}
                  {formatMissionStatus(mission.status)}
                </p>
                <p>
                  <span className="font-medium text-slate-800">Updated:</span>{" "}
                  {formatDateTime(mission.updatedAt)}
                </p>
              </CardContent>
              <CardFooter>
                <Link
                  to={routePaths.missionDetail(mission.id)}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                  )}
                >
                  View Details
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Link
          to={routePaths.missionCreate}
          className={cn(buttonVariants({ variant: "primary", size: "md" }))}
        >
          Create Mission
        </Link>
        {currentRole === authRoles.admin ? (
          <Link
            to={routePaths.assignments}
            className={cn(buttonVariants({ variant: "outline", size: "md" }))}
          >
            Open Dispatch Board
          </Link>
        ) : null}
      </div>
    </section>
  );
}

export default MissionsPage;
