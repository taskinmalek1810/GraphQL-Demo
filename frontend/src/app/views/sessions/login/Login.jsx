import { useLocation, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { Formik } from "formik";
import * as Yup from "yup";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid2";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import { styled, useTheme } from "@mui/material/styles";
import LoadingButton from "@mui/lab/LoadingButton";
// GLOBAL CUSTOM COMPONENTS
import { Paragraph } from "app/components/Typography";
// GLOBAL CUSTOM HOOKS
import { gql, useMutation } from "@apollo/client";

// STYLED COMPONENTS
const MainContainer = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#1A2038",
  minHeight: "100vh !important",
  "& .card": { maxWidth: 800, margin: "1rem" },
  "& .cardLeft": {
    color: "#fff",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundSize: "cover",
    background: "#161c37 url(/assets/images/bg-3.png) no-repeat",
    [theme.breakpoints.down("sm")]: { minWidth: 200 },
  },
  "& .mainTitle": {
    fontSize: 18,
    lineHeight: 1.3,
    marginBottom: 24,
  },
  "& .item": {
    position: "relative",
    marginBottom: 12,
    paddingLeft: 16,
    "&::after": {
      top: 8,
      left: 0,
      width: 4,
      height: 4,
      content: '""',
      borderRadius: 4,
      position: "absolute",
      backgroundColor: theme.palette.error.main,
    },
  },
}));

const LOGIN_MUTATION = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        userId
        name
        email
      }
    }
  }
`;

// initial login credentials
const initialValues = {
  email: "",
  password: "",
  remember: false,
};

// form field validation schema
const validationSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, "Password must be 6 character length")
    .required("Password is required!"),
  email: Yup.string()
    .email("Invalid Email address")
    .required("Email is required!"),
});

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const [login, { loading, error }] = useMutation(LOGIN_MUTATION);

  const handleFormSubmit = async (values) => {
    console.log("values", values);
    try {
      const { data } = await login({
        variables: {
          email: values.email,
          password: values.password,
        },
      });

      // Store the token in localStorage
      localStorage.setItem("token", data.login.token);

      // Navigate to the intended page or dashboard
      navigate(state?.from || "/");

      enqueueSnackbar("Logged In Successfully", { variant: "success" });
    } catch (error) {
      console.error("Login error:", error);
      enqueueSnackbar(error.message || "Login failed", { variant: "error" });
    }
  };

  return (
    <MainContainer>
      <Card className="card">
        <Grid container>
          <Grid size={{ md: 6, xs: 12 }}>
            <div className="cardLeft">
              <img src="/assets/images/login.png" alt="logo" />
            </div>
          </Grid>

          <Grid
            size={{ md: 6, xs: 12 }}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Box p={4}>
              <Formik
                onSubmit={handleFormSubmit}
                initialValues={initialValues}
                validationSchema={validationSchema}
              >
                {({
                  values,
                  errors,
                  touched,
                  isSubmitting,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                }) => (
                  <form onSubmit={handleSubmit}>
                    <TextField
                      fullWidth
                      size="small"
                      type="email"
                      name="email"
                      label="Email"
                      variant="outlined"
                      onBlur={handleBlur}
                      value={values.email}
                      onChange={handleChange}
                      helperText={touched.email && errors.email}
                      error={Boolean(errors.email && touched.email)}
                      sx={{ mb: 3 }}
                    />

                    <TextField
                      fullWidth
                      size="small"
                      name="password"
                      type="password"
                      label="Password"
                      variant="outlined"
                      onBlur={handleBlur}
                      value={values.password}
                      onChange={handleChange}
                      helperText={touched.password && errors.password}
                      error={Boolean(errors.password && touched.password)}
                      sx={{ mb: 1.5 }}
                    />

                    <Box display="flex" justifyContent="space-between">
                      <Box display="flex" alignItems="center" gap={1}>
                        <Checkbox
                          size="small"
                          name="remember"
                          onChange={handleChange}
                          checked={values.remember}
                          sx={{ padding: 0 }}
                        />

                        <Paragraph>Remember Me</Paragraph>
                      </Box>

                      <span
                        onClick={() => navigate("/forgot-password")}
                        style={{ color: theme.palette.primary.main }}
                      >
                        Forgot password?
                      </span>
                    </Box>

                    <LoadingButton
                      type="submit"
                      color="primary"
                      loading={isSubmitting || loading}
                      variant="contained"
                      sx={{ my: 2 }}
                    >
                      Login
                    </LoadingButton>

                    <Paragraph>
                      Don't have an account?
                      <span
                        onClick={() => navigate("/signup")}
                        style={{
                          marginInlineStart: 5,
                          color: theme.palette.primary.main,
                        }}
                      >
                        Register
                      </span>
                    </Paragraph>
                  </form>
                )}
              </Formik>
            </Box>
          </Grid>
        </Grid>
      </Card>
    </MainContainer>
  );
};

export default Login;
