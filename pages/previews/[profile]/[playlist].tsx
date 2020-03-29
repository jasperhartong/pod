import { NextPageContext } from "next";
import { Box, Typography, Container } from "@material-ui/core";

import { IDbPlaylist } from "../../../src/api/collection-storage/interfaces/IDbPlaylist";
// import { getPlaylist } from "../../../src/api/collections/backend/adaptors/directus";
import SurroundSound from "@material-ui/icons/SurroundSound";

// http://localhost:3000/previews/elshartong/voorloisenrobin?guest=2020-12-31_on9y8y
const PlaylistPreviewPage = ({
  feed,
  slug
}: {
  feed: IDbPlaylist;
  slug: string;
}) => {
  return (
    <Container maxWidth="sm">
      FIX ME
      <Box p={4} textAlign="center">
        <SurroundSound fontSize="large" color="disabled" />
        <Typography component="div" variant="overline">
          Tapes.me ©2020
        </Typography>
      </Box>
    </Container>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  // // For now use profile, should of should be based on profile + playlist
  // const slug = context.query.profile || null; // null is serializable
  // const guest = context.query.guest;
  // if (guest !== "2020-12-31_on9y8y") {
  //   // TODO: improve and implement this authentication
  //   if (context.res) {
  //     context.res.writeHead(401);
  //     return context.res.end();
  //   } else {
  //     return {};
  //   }
  // }
  // const feed = await getPlaylist(slug as string);
  // return {
  //   props: { feed, slug }
  // };
}

export default PlaylistPreviewPage;
