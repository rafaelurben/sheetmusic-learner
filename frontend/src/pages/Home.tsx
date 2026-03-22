import { usePageTitle } from "@/zustand/pageTitleStore.ts";

export default function Home() {
  usePageTitle("Home");
  return <h1>Home</h1>;
}
