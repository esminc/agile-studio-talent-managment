import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/auth/layout.tsx", [route("login", "./routes/auth/login.tsx")]),
  layout("./routes/protected/layout.tsx", [
    index("routes/home.tsx"),
    route("accounts", "routes/accounts.tsx"),
    route("accounts/new", "routes/accounts/new.tsx"),
    route("accounts/:accountId", "routes/accounts/$accountId/index.tsx"),
    route("accounts/:accountId/edit", "routes/accounts/$accountId/edit.tsx"),
    route("projects", "routes/projects.tsx"),
    route("projects/new", "routes/projects/new.tsx"),
    route("projects/:projectId", "routes/projects/$projectId/index.tsx"),
    route("projects/:projectId/edit", "routes/projects/$projectId/edit.tsx"),
    route("project-technologies", "routes/project-technologies.tsx"),
    route("project-technologies/new", "routes/project-technologies/new.tsx"),
    route(
      "project-technologies/:projectTechnologyId",
      "routes/project-technologies/$projectTechnologyId/index.tsx",
    ),
    route(
      "project-technologies/:projectTechnologyId/edit",
      "routes/project-technologies/$projectTechnologyId/edit.tsx",
    ),
  ]),
] satisfies RouteConfig;
