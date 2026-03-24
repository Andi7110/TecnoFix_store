import { Navigate, useLocation } from "react-router-dom";
import { useState } from "react";
import LoginForm from "../../components/auth/LoginForm";
import { useAuth } from "../../hooks/auth/useAuth";
import { useLoginForm } from "../../hooks/auth/useLoginForm";

function LoginPage() {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const redirectTo = location.state?.from?.pathname ?? "/";
  const [nodes, setNodes] = useState([]);
  const { values, errors, message, submitting, updateValue, submit } =
    useLoginForm(redirectTo);

  if (!loading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  function handleBackgroundClick(event) {
    if (event.target !== event.currentTarget) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const node = {
      id: `${Date.now()}-${Math.random()}`,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    setNodes((current) => [...current.slice(-39), node]);

    window.setTimeout(() => {
      setNodes((current) => current.filter((item) => item.id !== node.id));
    }, 1400);
  }

  return (
    <div className="auth-screen" onClick={handleBackgroundClick}>
      <div className="auth-screen__nodes" aria-hidden="true">
        {nodes.map((node) => (
          <span
            key={node.id}
            className="auth-screen__node"
            style={{ left: `${node.x}px`, top: `${node.y}px` }}
          />
        ))}
      </div>

      <div className="auth-screen__form">
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
