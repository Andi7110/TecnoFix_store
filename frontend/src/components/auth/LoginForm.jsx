import {
  Alert,
  Box,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ShieldCheck, Sparkle } from "../../icons/phosphor";

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
  submitting,
  onChange,
  onSubmit,
}) {
  return (
    <form className="auth-card" onSubmit={onSubmit}>
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
            sx={{ color: "#72808d", fontFamily: "inherit" }}
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
          <TextField
            id="username"
            label="Usuario o email"
            type="text"
            value={values.username}
            onChange={(event) => onChange("username", event.target.value)}
            autoComplete="username"
            error={Boolean(errors.username)}
            helperText={errors.username?.[0] ?? " "}
            fullWidth
            size="medium"
            sx={fieldStyles}
            required
          />

          <TextField
            id="password"
            label="Contrasena"
            type="password"
            value={values.password}
            onChange={(event) => onChange("password", event.target.value)}
            autoComplete="current-password"
            error={Boolean(errors.password)}
            helperText={errors.password?.[0] ?? " "}
            fullWidth
            size="medium"
            sx={fieldStyles}
            required
          />

          <FormControlLabel
            className="auth-form__check"
          control={
              <Checkbox
                checked={values.remember}
                onChange={(event) => onChange("remember", event.target.checked)}
                sx={{
                  color: "#8f97a3",
                  "&.Mui-checked": { color: "#0b4052" },
                }}
              />
            }
            label="Recordar sesion"
            sx={{ color: "#586371", m: 0 }}
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
  "& .MuiInputLabel-root": {
    color: "#465465",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#0b4052",
  },
  "& .MuiOutlinedInput-root": {
    color: "#18202a",
    backgroundColor: "#ffffff",
    borderRadius: "0.75rem",
    "& fieldset": {
      borderColor: "#d6dee7",
    },
    "&:hover fieldset": {
      borderColor: "#a7b5c5",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#0b4052",
      borderWidth: "1px",
    },
  },
  "& .MuiFormHelperText-root": {
    marginLeft: 0,
    color: "#7a8694",
  },
  "& .MuiFormHelperText-root.Mui-error": {
    color: "#d54c63",
  },
};

export default LoginForm;
