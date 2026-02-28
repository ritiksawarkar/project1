import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { routePaths } from "../../../app/router/routePaths.js";
import { useAssignments } from "../../../features/assignments/model/useAssignments.js";
import { useMissions } from "../../../features/missions/model/useMissions.js";
import {
  formatDateTime,
  formatMissionStatus,
} from "../../../features/missions/lib/missionPresentation.js";
import { Badge } from "../../../shared/ui/badge/Badge.jsx";
import { Button, buttonVariants } from "../../../shared/ui/button/Button.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../shared/ui/card/Card.jsx";
import { cn } from "../../../shared/lib/utils.js";

function AssignmentBoardPage() {
  const { missions, isLoading: isMissionsLoading } = useMissions();
  const {
    assignments,
    volunteers,
    assignVolunteerToMission,
    isLoading: isAssignmentsLoading,
    error: assignmentsError,
    refreshAssignments,
  } = useAssignments();

  const [selectedVolunteerByMission, setSelectedVolunteerByMission] = useState(
    {},
  );
  const [actionErrorByMission, setActionErrorByMission] = useState({});
  const [assigningMissionId, setAssigningMissionId] = useState("");

  const sortedMissions = useMemo(
    () =>
      [...missions].sort(
        (firstMission, secondMission) =>
          new Date(secondMission.updatedAt).getTime() -
          new Date(firstMission.updatedAt).getTime(),
      ),
    [missions],
  );

  const assignmentByMissionId = useMemo(
    () =>
      new Map(
        assignments
          .filter((assignment) => assignment.status !== "canceled")
          .map((assignment) => [assignment.missionId, assignment]),
      ),
    [assignments],
  );

  const volunteerById = useMemo(
    () => new Map(volunteers.map((volunteer) => [volunteer.id, volunteer])),
    [volunteers],
  );

  const availableVolunteerIds = useMemo(() => {
    const activeVolunteerIds = new Set(
      assignments
        .filter(
          (assignment) =>
            assignment.status === "assigned" ||
            assignment.status === "inProgress",
        )
        .map((assignment) => assignment.volunteerId),
    );

    return new Set(
      volunteers
        .filter((volunteer) => !activeVolunteerIds.has(volunteer.id))
        .map((volunteer) => volunteer.id),
    );
  }, [assignments, volunteers]);

  const availableVolunteers = useMemo(
    () =>
      volunteers.filter((volunteer) => availableVolunteerIds.has(volunteer.id)),
    [availableVolunteerIds, volunteers],
  );

  const unassignedMissions = useMemo(
    () => sortedMissions.filter((mission) => !assignmentByMissionId.get(mission.id)),
    [assignmentByMissionId, sortedMissions],
  );

  const activeAssignments = useMemo(
    () =>
      assignments
        .filter(
          (assignment) =>
            assignment.status !== "canceled" &&
            assignment.status !== "completed",
        )
        .sort(
          (firstAssignment, secondAssignment) =>
            new Date(secondAssignment.updatedAt).getTime() -
            new Date(firstAssignment.updatedAt).getTime(),
        ),
    [assignments],
  );

  const handleVolunteerSelection = (missionId, volunteerId) => {
    setSelectedVolunteerByMission((currentSelections) => ({
      ...currentSelections,
      [missionId]: volunteerId,
    }));

    setActionErrorByMission((currentErrors) => {
      if (!currentErrors[missionId]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[missionId];
      return nextErrors;
    });
  };

  const handleAssignVolunteer = async (mission) => {
    const selectedVolunteerId = selectedVolunteerByMission[mission.id] ?? "";

    if (!selectedVolunteerId) {
      setActionErrorByMission((currentErrors) => ({
        ...currentErrors,
        [mission.id]: "Select a volunteer before assigning.",
      }));
      return;
    }

    setAssigningMissionId(mission.id);

    const result = await assignVolunteerToMission({
      missionId: mission.id,
      volunteerId: selectedVolunteerId,
    });

    if (!result.ok) {
      setAssigningMissionId("");
      setActionErrorByMission((currentErrors) => ({
        ...currentErrors,
        [mission.id]: result.error ?? "Unable to assign volunteer.",
      }));
      return;
    }

    setActionErrorByMission((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[mission.id];
      return nextErrors;
    });

    setSelectedVolunteerByMission((currentSelections) => {
      const nextSelections = { ...currentSelections };
      delete nextSelections[mission.id];
      return nextSelections;
    });

    setAssigningMissionId("");
  };

  if (isMissionsLoading || isAssignmentsLoading) {
    return (
      <section className="space-y-4">
        <Badge variant="success">Protected · Auth Required</Badge>
        <Card>
          <CardHeader>
            <CardTitle>Loading assignment board...</CardTitle>
            <CardDescription>
              Syncing missions, assignments, and volunteers from backend.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <Badge variant="success">Protected · Auth Required</Badge>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Volunteer Assignment Board
        </h1>
        <p className="text-sm text-slate-600">
          Review unassigned missions, active assignments, and volunteer
          availability in one operational view.
        </p>
        {assignmentsError ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {assignmentsError}
          </p>
        ) : null}
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Unassigned Missions</CardTitle>
            <CardDescription>
              Missions that need volunteer allocation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {unassignedMissions.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Assignments</CardTitle>
            <CardDescription>
              Assignments currently in progress.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {activeAssignments.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Available Volunteers</CardTitle>
            <CardDescription>
              Volunteers ready for assignment right now.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {availableVolunteers.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mission Queue</CardTitle>
            <CardDescription>
              Latest missions and current assignment state.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sortedMissions.length === 0 ? (
              <p className="text-sm text-slate-600">
                No missions available in queue.
              </p>
            ) : (
              sortedMissions.map((mission) => {
                const missionAssignment = assignmentByMissionId.get(mission.id);
                const assignedVolunteer = missionAssignment
                  ? volunteerById.get(missionAssignment.volunteerId)
                  : null;
                const assignableVolunteers = availableVolunteers;
                const selectedVolunteerId =
                  selectedVolunteerByMission[mission.id] ??
                  assignableVolunteers[0]?.id ??
                  "";
                const isAssigning = assigningMissionId === mission.id;

                return (
                  <div
                    key={mission.id}
                    className="rounded-md border border-slate-200 p-3 text-sm"
                  >
                    <p className="font-medium text-slate-900">
                      {mission.id} · {mission.title}
                    </p>
                    <p className="mt-1 text-slate-600">
                      Status: {formatMissionStatus(mission.status)}
                    </p>
                    <p className="mt-1 text-slate-600">
                      Assignment:{" "}
                      {assignedVolunteer
                        ? `${assignedVolunteer.name} (${missionAssignment.status})`
                        : "Pending"}
                    </p>
                    <p className="mt-1 text-slate-500">
                      Updated: {formatDateTime(mission.updatedAt)}
                    </p>

                    {!missionAssignment ? (
                      <div className="mt-3 space-y-2 rounded-md border border-slate-100 bg-slate-50 p-2">
                        {assignableVolunteers.length === 0 ? (
                          <p className="text-xs text-slate-600">
                            No available volunteers currently.
                          </p>
                        ) : (
                          <>
                            <label
                              htmlFor={`assign-${mission.id}`}
                              className="block text-xs font-medium text-slate-700"
                            >
                              Assign volunteer
                            </label>
                            <select
                              id={`assign-${mission.id}`}
                              value={selectedVolunteerId}
                              onChange={(event) =>
                                handleVolunteerSelection(
                                  mission.id,
                                  event.target.value,
                                )
                              }
                              className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                            >
                              {assignableVolunteers.map((volunteer) => (
                                <option key={volunteer.id} value={volunteer.id}>
                                  {volunteer.name} · {volunteer.email}
                                </option>
                              ))}
                            </select>
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={isAssigning}
                              onClick={() => handleAssignVolunteer(mission)}
                            >
                              {isAssigning
                                ? "Assigning..."
                                : "Assign Volunteer"}
                            </Button>
                          </>
                        )}

                        {actionErrorByMission[mission.id] ? (
                          <p className="text-xs text-red-700">
                            {actionErrorByMission[mission.id]}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Volunteer Directory</CardTitle>
            <CardDescription>
              Active users eligible for assignment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {volunteers.length === 0 ? (
              <p className="text-sm text-slate-600">No volunteers available.</p>
            ) : (
              volunteers.map((volunteer) => {
                const isAvailable = availableVolunteerIds.has(volunteer.id);

                return (
                  <div
                    key={volunteer.id}
                    className="rounded-md border border-slate-200 p-3 text-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-slate-900">
                        {volunteer.name}
                      </p>
                      <Badge variant={isAvailable ? "success" : "info"}>
                        {isAvailable ? "Available" : "Assigned"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-slate-600">Email: {volunteer.email}</p>
                    <p className="mt-1 text-slate-600">Role: {volunteer.role}</p>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="secondary" onClick={refreshAssignments}>
          Refresh Board
        </Button>
        <Link
          to={routePaths.missions}
          className={cn(buttonVariants({ variant: "outline", size: "md" }))}
        >
          Back to Missions
        </Link>
      </div>
    </section>
  );
}

export default AssignmentBoardPage;
