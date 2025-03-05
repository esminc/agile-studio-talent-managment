import { Button } from "~/components/ui/button";
import { Welcome } from "../welcome/welcome";
import { signOut } from "aws-amplify/auth";
import { useNavigate } from "react-router";

export function meta() {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const logout = async () => {
    console.log("Logging out...");
    await signOut();
    navigate("/login");
  };
  return (
    <>
      <Welcome />
      <Button onClick={logout}>Logout</Button>
    </>
  );
}
