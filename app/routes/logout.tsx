import { redirect } from "react-router";

export const loader = async ({ request }: { request: Request }) => {
  const { logoutUser } = await import("../utils/auth.server");
  return logoutUser(request);
};

export default function Logout() {
  return redirect("/login");
}
