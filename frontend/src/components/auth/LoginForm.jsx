import { useState } from "react";
import {
  Alert,
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { CheckCircle, Eye, EyeSlash, ShieldCheck, Sparkle } from "../../icons/phosphor";

function PowerLogo() {
  return (
    <span className="app-power-logo auth-card__menu-logo" aria-hidden="true">
      <svg viewBox="0 0 64 64" role="img">
        <circle className="app-power-logo__ring" cx="32" cy="32" r="24" />
        <path
          className="app-power-logo__arc"
          d="M23 22a14 14 0 1 0 18 0"
        />
        <path className="app-power-logo__line" d="M32 18v12" />
      </svg>
    </span>
  );
}

function LoginForm({
  values,
  errors,
  message,
  successMessage,
  submitting,
  onChange,
  onSubmit,
  onAcceptSuccess,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="auth-card" onSubmit={onSubmit}>
      {successMessage ? (
        <div className="auth-success-modal" role="dialog" aria-modal="true" aria-labelledby="auth-success-title">
          <div className="auth-success-modal__card">
            <CheckCircle className="auth-success-modal__icon" size={70} weight="fill" aria-hidden="true" />
            <h2 id="auth-success-title">{successMessage}</h2>
            <p>Se registro correctamente.</p>
            <button type="button" className="btn auth-success-modal__button" onClick={onAcceptSuccess}>
              Aceptar
            </button>
          </div>
        </div>
      ) : null}
      <Box className="auth-card__panel auth-card__panel--brand">
        <Typography className="auth-card__brand" component="p">
          TecnoFix
        </Typography>
        <Typography className="auth-card__tagline" component="p">
          Gestion tecnica simple, clara y lista para crecer con nuevos modulos.
        </Typography>

        <Box className="auth-card__visual" aria-hidden="true">
          <span className="auth-card__halo auth-card__halo--one" />
          <span className="auth-card__halo auth-card__halo--two" />
          <Box className="auth-card__device">
            <PowerLogo />
          </Box>
        </Box>

        <Stack className="auth-card__feature-list" spacing={1.25}>
          <Box className="auth-card__feature">
            <ShieldCheck size={18} weight="fill" />
            <span>Acceso seguro por roles</span>
          </Box>
          <Box className="auth-card__feature">
            <Sparkle size={18} weight="fill" />
            <span>Base lista para nuevos submodulos</span>
          </Box>
        </Stack>
      </Box>

      <Box className="auth-card__panel auth-card__panel--form">
        <Box className="auth-card__header">
          <Typography
            className="auth-card__eyebrow"
            sx={{ color: "#d4d4d4", fontFamily: "inherit" }}
          >
            Bienvenido
          </Typography>
          <Typography className="auth-card__title" component="h1">
            Login
          </Typography>
          <Typography className="auth-card__description">
            Ingresa con tus credenciales para continuar en el sistema.
          </Typography>
        </Box>

        {message ? <Alert severity="error">{message}</Alert> : null}

        <Stack spacing={2.2}>
          <Box className="auth-form__field">
            <Typography component="label" htmlFor="username" className="auth-form__label">
              Usuario o email
            </Typography>
            <TextField
              id="username"
              type="text"
              value={values.username}
              onChange={(event) => onChange("username", event.target.value)}
              autoComplete="username"
              error={Boolean(errors.username)}
              helperText={errors.username?.[0] ?? " "}
              placeholder="Usuario o email"
              fullWidth
              size="medium"
              sx={fieldStyles}
              required
            />
          </Box>

          <Box className="auth-form__field">
            <Typography component="label" htmlFor="password" className="auth-form__label">
              Contrasena
            </Typography>
            <TextField
              id="password"
              type={showPassword ? "text" : "password"}
              value={values.password}
              onChange={(event) => onChange("password", event.target.value)}
              autoComplete="current-password"
              error={Boolean(errors.password)}
              helperText={errors.password?.[0] ?? " "}
              placeholder="Contrasena"
              fullWidth
              size="medium"
              sx={fieldStyles}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        className="auth-form__password-toggle"
                        type="button"
                        edge="end"
                        aria-label={showPassword ? "Ocultar contrasena" : "Ver contrasena"}
                        onClick={() => setShowPassword((current) => !current)}
                      >
                        {showPassword ? <EyeSlash size={21} /> : <Eye size={21} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              required
            />
          </Box>

          <FormControlLabel
            className="auth-form__check"
          control={
              <Checkbox
                checked={values.remember}
                onChange={(event) => onChange("remember", event.target.checked)}
                sx={{
                  color: "#8f8f8f",
                  "&.Mui-checked": { color: "#ffffff" },
                }}
              />
            }
            label="Recordar sesion"
            sx={{ color: "#c4c4c4", m: 0 }}
          />

          <button
            type="submit"
            className="btn auth-form__submit"
            disabled={submitting}
          >
            {submitting ? "Ingresando..." : "Login"}
          </button>
        </Stack>
      </Box>
    </form>
  );
}

const fieldStyles = {
  "& .MuiOutlinedInput-root": {
    color: "#f5f5f5",
    backgroundColor: "#181818",
    borderRadius: "0.75rem",
    "& fieldset": {
      borderColor: "#2c2c2c",
    },
    "&:hover fieldset": {
      borderColor: "#4b4b4b",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#ffffff",
      borderWidth: "1px",
    },
  },
  "& .MuiInputBase-input::placeholder": {
    color: "#7a7a7a",
    opacity: 1,
  },
  "& .MuiFormHelperText-root": {
    marginLeft: 0,
    marginTop: "0.45rem",
    color: "#8f8f8f",
  },
  "& .MuiFormHelperText-root.Mui-error": {
    color: "#f87171",
  },
};

export default LoginForm;
