import { Navigate, useLocation } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";
import { useAuth } from "../../hooks/auth/useAuth";
import { useLoginForm } from "../../hooks/auth/useLoginForm";

function LoginPage() {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const redirectTo = location.state?.from?.pathname ?? "/";
  const { values, errors, message, submitting, updateValue, submit } =
    useLoginForm(redirectTo);

  if (!loading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div className="auth-screen">
      <div className="auth-screen__form auth-screen__form--wide">
        <LoginForm
          values={values}
          errors={errors}
          message={message}
          submitting={submitting}
          onChange={updateValue}
          onSubmit={submit}
        />
      </div>
    </div>
  );
}

export default LoginPage;
