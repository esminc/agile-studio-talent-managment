import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/auth/layout.tsx", [route("login", "./routes/auth/login.tsx")]),
  layout("./routes/protected/layout.tsx", [index("routes/home.tsx")]),
] satisfies RouteConfig;
