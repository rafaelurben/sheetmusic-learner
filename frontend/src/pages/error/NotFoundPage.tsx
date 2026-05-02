/*
 * (C) 2026. - Rafael Urben
 */
import ErrorPage from "./ErrorPage.tsx";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <ErrorPage
      title="Page Not Found"
      description="Sorry, the page you're looking for doesn't exist. It may have been moved or deleted."
      /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
      action={() => navigate("/")}
    />
  );
}
