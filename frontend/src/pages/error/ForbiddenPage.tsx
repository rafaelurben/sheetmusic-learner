/*
 * (C) 2026. - Rafael Urben
 */
import ErrorPage from "./ErrorPage.tsx";
import { useNavigate } from "react-router-dom";

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <ErrorPage
      title="Access Denied"
      description="You don't have permission to access this resource. If you believe this is an error, please contact support."
      /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
      action={() => navigate("/")}
    />
  );
}
