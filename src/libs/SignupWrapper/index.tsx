import { signup } from "@/server/actions/auth";
import AuthForm from "../shared/AuthForm";

export default function SignupWrapper({ next }: { next: string }) {
  return <AuthForm mode="signup" action={signup} next={next} />;
}
