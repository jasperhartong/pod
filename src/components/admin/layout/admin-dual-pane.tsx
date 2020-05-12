import AppContainer from "@/components/app-container";
import PageFooter from "@/components/page-footer";
import {
  Box,
  Container,
  Grid,
  Paper,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import { ReactNode } from "react";
import AdminHeader, { AdminHeaderProps } from "./admin-header";

interface Props extends AdminHeaderProps {
  firstItem: ReactNode;
  secondItem: ReactNode;
}

const AdminDualPaneLayout = (props: Props) => {
  const theme = useTheme();
  const onMobile = useMediaQuery(theme.breakpoints.down("xs"));

  return (
    <AppContainer maxWidth="md">
      <Container maxWidth="sm" style={{ padding: 0 }}>
        <AdminHeader
          image={props.image}
          blur={props.blur}
          title={props.title}
          subtitle={props.subtitle}
          action={props.action}
        />

        <Paper square={true}>
          <Box p={2}>
            <Grid container spacing={2}>
              <Grid item sm={6} xs={12}>
                <Box mt={onMobile ? -12 : 0}>{props.firstItem}</Box>
              </Grid>
              <Grid item sm={6} xs={12}>
                {props.secondItem}
              </Grid>
            </Grid>
          </Box>
        </Paper>

        <PageFooter />
      </Container>
    </AppContainer>
  );
};

export default AdminDualPaneLayout;
