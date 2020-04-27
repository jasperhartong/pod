import { ReactNode } from "react";
import { Paper, Box, Grid } from "@material-ui/core";
import AdminHeader, { AdminHeaderProps } from "./admin-header";

interface Props extends AdminHeaderProps {
  firstItem: ReactNode;
  secondItem: ReactNode;
}

const AdminDualPaneLayout = (props: Props) => {
  return (
    <>
      <AdminHeader
        image={props.image}
        title={props.title}
        subtitle={props.subtitle}
        action={props.action}
      />
      <Paper square={true}>
        <Box p={2}>
          <Grid container spacing={2}>
            <Grid item sm={6} xs={12}>
              {props.firstItem}
            </Grid>
            <Grid item sm={6}>
              {props.secondItem}
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </>
  );
};

export default AdminDualPaneLayout;
