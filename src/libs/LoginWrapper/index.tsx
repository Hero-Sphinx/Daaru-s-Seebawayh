import { login } from "@/server/actions/auth";
import AuthForm from "../shared/AuthForm";

export default function LoginWrapper({ next, canResetByEmail }: { next: string; canResetByEmail: boolean }) {
  return <AuthForm mode="login" action={login} next={next} canResetByEmail={canResetByEmail} />;
}
