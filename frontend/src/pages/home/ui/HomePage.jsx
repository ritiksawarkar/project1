import { Link } from "react-router-dom";
import { routePaths } from "../../../app/router/routePaths.js";
import { useAuth } from "../../../features/auth/model/useAuth.js";
import { Badge } from "../../../shared/ui/badge/Badge.jsx";
import { buttonVariants } from "../../../shared/ui/button/buttonVariants.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../shared/ui/card/Card.jsx";
import { cn } from "../../../shared/lib/utils.js";

const valueCards = [
  {
    title: "Operational Mission Control",
    description:
      "Track every donation flow from intake to closure with structured status transitions.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M4 7h16M4 12h16M4 17h10"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Volunteer Dispatch Orchestration",
    description:
      "Assign volunteers by area, monitor active allocations, and reduce response delays.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM5 20a7 7 0 0 1 14 0"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Evidence-Driven Verification",
    description:
      "Capture proof submissions and move them through a role-guarded review workflow.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M7 12.5 10 15.5 17 8.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="4"
          y="4"
          width="16"
          height="16"
          rx="2.5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    ),
  },
  {
    title: "Audit-Ready Accountability",
    description:
      "Maintain traceable timelines for mission ownership, assignment actions, and proof decisions.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M8 4h8M8 20h8M6 8h12M6 12h12M6 16h12"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const processSteps = [
  {
    step: "01",
    title: "Create Mission Intake",
    description:
      "Capture donation details, category, area, and priority in a standardized mission record.",
  },
  {
    step: "02",
    title: "Dispatch and Execute",
    description:
      "Assign the right volunteer, monitor transitions, and keep field execution aligned with policy.",
  },
  {
    step: "03",
    title: "Verify and Close",
    description:
      "Submit proof, review outcomes, and close missions with complete delivery confidence.",
  },
];

const impactMetrics = [
  {
    label: "Faster Assignment Turnaround",
    value: "63%",
    description:
      "Reduction in time required to move missions from creation to volunteer allocation.",
  },
  {
    label: "Manual Coordination Reduction",
    value: "41%",
    description:
      "Less overhead through centralized mission state and assignment visibility.",
  },
  {
    label: "Proof Visibility Coverage",
    value: "99%",
    description:
      "Missions with traceable submission and verification history available to stakeholders.",
  },
  {
    label: "Operational Decision Speed",
    value: "2.4x",
    description:
      "Faster exception handling with role-based dashboards and review queues.",
  },
];

const roleCards = [
  {
    title: "User Operations",
    description:
      "Create missions, track lifecycle updates, and coordinate field execution with structured workflows.",
    actionLabel: "Open Missions",
    actionPath: routePaths.missions,
  },
  {
    title: "Reviewer Workflow",
    description:
      "Evaluate submitted evidence, approve or reject proof transitions, and maintain verification quality.",
    actionLabel: "Open Proof Review",
    actionPath: routePaths.proofReview,
  },
  {
    title: "Admin Oversight",
    description:
      "Monitor trust, compliance, and escalations with end-to-end accountability across all missions.",
    actionLabel: "Open Admin Panel",
    actionPath: routePaths.admin,
  },
];

function HomePage() {
  const { isAuthenticated, currentRole } = useAuth();

  return (
    <div className="mx-auto w-full max-w-7xl">
      <section className="py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <Badge variant="info">Mission Delivery Intelligence Platform</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Coordinate high-trust donation delivery with complete operational
              visibility.
            </h1>
            <p className="max-w-xl text-base leading-7 text-slate-600">
              Social Mentor eliminates fragmented coordination across donors,
              volunteers, and verification teams by centralizing mission intake,
              dispatch, evidence review, and closure accountability.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to={routePaths.missionCreate}
                    className={cn(
                      buttonVariants({ variant: "primary", size: "lg" }),
                    )}
                  >
                    Launch Mission
                  </Link>
                  <Link
                    to={routePaths.missions}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                    )}
                  >
                    Explore Operations
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={routePaths.login}
                    className={cn(
                      buttonVariants({ variant: "primary", size: "lg" }),
                    )}
                  >
                    Access Platform
                  </Link>
                  <Link
                    to={routePaths.register}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                    )}
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Operational Snapshot</CardTitle>
              <CardDescription>
                Real-time governance across critical workflows.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Current Focus
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  Mission Lifecycle Control
                </p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Primary Workflow
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  Dispatch and Verification
                </p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Signed-in Context
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {isAuthenticated
                    ? `Authenticated session · Role: ${currentRole ?? "user"}`
                    : "Public session · Sign in to access protected workflows"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16" aria-label="Value proposition">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Core Platform Capabilities
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            Purpose-built modules unify field execution and governance into one
            decision-ready interface.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {valueCards.map((valueCard) => (
            <Card
              key={valueCard.title}
              className="border-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <CardHeader className="space-y-3">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-700">
                  {valueCard.icon}
                </div>
                <CardTitle className="text-base">{valueCard.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-slate-600">
                  {valueCard.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-16" aria-label="How it works">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            How the Workflow Operates
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            A deterministic three-stage process ensures every mission is
            coordinated, validated, and closed with confidence.
          </p>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {processSteps.map((stepItem) => (
            <Card key={stepItem.step} className="border-slate-200">
              <CardHeader>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Step {stepItem.step}
                </p>
                <CardTitle className="text-base">{stepItem.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-slate-600">
                  {stepItem.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-16" aria-label="Impact and trust metrics">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Impact and Trust Indicators
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            Operational telemetry highlights speed, consistency, and reliability
            improvements across the delivery chain.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {impactMetrics.map((metric) => (
            <Card key={metric.label} className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">
                  {metric.value}
                </CardTitle>
                <CardDescription className="text-sm font-medium text-slate-700">
                  {metric.label}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-slate-600">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-16" aria-label="Role based capabilities">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Role-Based Responsibility Model
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            Access controls align each team with the workflows required for
            secure, accountable mission delivery.
          </p>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {roleCards.map((roleCard) => (
            <Card key={roleCard.title} className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">{roleCard.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-slate-600">
                  {roleCard.description}
                </p>
                <Link
                  to={isAuthenticated ? roleCard.actionPath : routePaths.login}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                  )}
                >
                  {isAuthenticated ? roleCard.actionLabel : "Login to Access"}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-16" aria-label="Final call to action">
        <Card className="border-slate-200 bg-white">
          <CardContent className="flex flex-col items-center gap-6 px-6 py-12 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Ready to run reliable social impact operations at scale?
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-slate-600">
                Standardize mission execution, strengthen verification, and
                enable faster decisions from one unified platform.
              </p>
            </div>

            <Link
              to={isAuthenticated ? routePaths.missions : routePaths.login}
              className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
            >
              {isAuthenticated ? "Go to Mission Control" : "Get Started"}
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default HomePage;
