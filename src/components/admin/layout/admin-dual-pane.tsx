import { ReactNode } from "react";
import {
  Container,
  Paper,
  Box,
  Grid,
  useTheme,
  useMediaQuery,
} from "@material-ui/core";
import AdminHeader, { AdminHeaderProps } from "./admin-header";
import AppContainer from "../../app-container";
import PageFooter from "../../page-footer";

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
              <Grid item sm={6}>
                {props.secondItem}
              </Grid>
            </Grid>
          </Box>
        </Paper>

        <PageFooter secondaryText="admin" />
      </Container>
    </AppContainer>
  );
};

export default AdminDualPaneLayout;
