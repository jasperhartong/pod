import { NextPageContext } from "next";
import { Box, Container } from "@material-ui/core";
import HttpStatus from "http-status-codes";

// /previews/elshartong/voorloisenrobin?guest=2020-12-31_on9y8y => /rooms/famhartong
const PlaylistPreviewPage = (props: { ok: boolean }) => {
  return (
    <Container maxWidth="sm">
      <Box p={4} textAlign="center">
        Nothing to see here
      </Box>
    </Container>
  );
};

const expectedGuestSecret = "2020-12-31_on9y8y";
const locationRedirect = "/rooms/famhartong";

export async function getServerSideProps(context: NextPageContext) {
  const guest = context.query.guest;
  console.warn(`handle: ${guest}`);
  if (guest !== expectedGuestSecret) {
    return { props: { ok: false } };
  }

  if (context.res) {
    context.res.writeHead(HttpStatus.PERMANENT_REDIRECT, {
      Location: locationRedirect,
    });
    context.res.end();
  }
  return { props: { ok: false } };
}

export default PlaylistPreviewPage;
