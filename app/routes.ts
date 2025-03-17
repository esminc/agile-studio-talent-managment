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
    route("projects", "routes/projects.tsx"),
    route("projects/new", "routes/projects/new.tsx"),
  ]),
] satisfies RouteConfig;
