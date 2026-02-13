import { useAuth } from "react-oidc-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shadcn/components/ui/card.tsx";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@/shadcn/components/ui/field.tsx";
import { Button } from "@/shadcn/components/ui/button.tsx";

export default function Unauthenticated() {
  const auth = useAuth();

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Login to your account</CardTitle>
              <CardDescription>Please click below to sign in.</CardDescription>
            </CardHeader>
            <CardContent>
              <form>
                <FieldGroup>
                  <Field>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => void auth.signinRedirect()}
                      disabled={
                        auth.isLoading ||
                        auth.activeNavigator === "signinSilent"
                      }
                    >
                      Login with OIDC Provider
                    </Button>
                    {auth.error && (
                      <FieldError>
                        Error: Oops... {auth.error.source} caused{" "}
                        {auth.error.message}
                      </FieldError>
                    )}
                    {auth.isLoading && (
                      <FieldDescription>
                        Loading... Please wait!
                      </FieldDescription>
                    )}
                    {auth.activeNavigator === "signinSilent" && (
                      <FieldDescription>
                        Signing in... Please wait!
                      </FieldDescription>
                    )}
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
