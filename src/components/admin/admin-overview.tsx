import { MouseEvent } from "react";
import NextLink from "next/link";
import {
  Link,
  Button,
  List,
  Box,
  Fab,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Container,
  Typography,
} from "@material-ui/core";
import PlaylistHeader from "../playlist-header";
import SubscribePanel from "../subscribe-panel";
import { useState, ChangeEvent } from "react";
import AdminHeader from "./layout/admin-header";
import IconAdd from "@material-ui/icons/Add";
import { IPlaylist } from "../../app-schema/IPlaylist";
import { parseDbDate } from "../../api/collection-storage/backends/directus-utils";
import { IEpisode } from "../../app-schema/IEpisode";
import SurroundSound from "@material-ui/icons/SurroundSound";
import { IResponse } from "../../api/IResponse";
import { IRoom } from "../../app-schema/IRoom";
import AppContainer from "../app-container";
import { useRouter } from "next/dist/client/router";

const panelIdFromPlaylistId = (id: IPlaylist["id"]) => `panel-playlist-${id}`;

export const AdminOverview = ({ room }: { room: IResponse<IRoom> }) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (
    _: ChangeEvent<{}>,
    isExpanded: boolean
  ) => {
    setExpanded(isExpanded ? panel : false);
  };

  if (!room.ok) {
    return <>error</>;
  }
  const slug = room.data.slug;

  return (
    <AppContainer maxWidth="md">
      <Container maxWidth="sm" style={{ padding: 0 }}>
        <AdminHeader
          image={room.data.cover_file.data.full_url}
          title={room.data.title}
          subtitle="admin"
        />

        <Box>
          {room.data.playlists.map((p, index) => (
            <ExpansionPanel
              square={true}
              key={p.id}
              expanded={expanded === panelIdFromPlaylistId(p.id)}
              onChange={handleChange(panelIdFromPlaylistId(p.id))}
            >
              <ExpansionPanelSummary
                style={{ padding: 0 }}
                aria-controls={`playlist-content-${p.id}`}
                id={`playlist-header-${p.id}`}
              >
                <Box style={{ width: "100%" }}>
                  {index === 0 && (
                    <Box pl={2} pr={2}>
                      <Typography variant="overline">Collecties</Typography>
                    </Box>
                  )}
                  <List style={{ padding: 0, width: "100%" }}>
                    <PlaylistHeader
                      key={p.id}
                      playlist={p}
                      secondaryAction={
                        <Fab
                          size="small"
                          onClick={(event: MouseEvent<HTMLElement>) => {
                            event.preventDefault();
                            event.stopPropagation();
                            router.push(
                              "/rooms/[roomSlug]/admin/[playlistId]/new-episode",
                              `/rooms/${slug}/admin/${p.id}/new-episode`
                            );
                          }}
                        >
                          <IconAdd />
                        </Fab>
                      }
                    />
                  </List>
                </Box>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails
                id={`playlist-content-${p.id}`}
                style={{ padding: 0 }}
              >
                <AdminEpisodeList
                  roomSlug={room.data.slug}
                  playlistId={p.id}
                  episodes={p.episodes}
                />
              </ExpansionPanelDetails>
            </ExpansionPanel>
          ))}
          <ExpansionPanel square={true} key={"new"} expanded={false}>
            <ExpansionPanelSummary>
              {/* <Box textAlign="center" p={2}> */}
              <Button fullWidth onClick={() => alert("😅 Coming soon!")}>
                Nieuwe collectie beginnen
              </Button>
              {/* </Box> */}
            </ExpansionPanelSummary>
          </ExpansionPanel>
        </Box>

        <Box pt={4}>
          <SubscribePanel slug={room.data.slug} />
        </Box>
        <Box pt={4}>
          <NextLink href="/rooms/[roomSlug]" as={`/rooms/${slug}`}>
            <Button fullWidth>Open Luisterkamer</Button>
          </NextLink>
        </Box>
        <Box p={4} textAlign="center">
          <SurroundSound fontSize="large" color="disabled" />
          <Typography
            component="div"
            variant="overline"
            style={{ lineHeight: "110%" }}
          >
            Tapes.me ©2020
          </Typography>
          <Typography component="div" variant="overline" color="textSecondary">
            {room.data.slug || ""}
          </Typography>
        </Box>
      </Container>
    </AppContainer>
  );
};

const initialMaxLength = 3;
const AdminEpisodeList = ({
  roomSlug,
  playlistId,
  episodes,
}: {
  roomSlug: IRoom["slug"];
  playlistId: IPlaylist["id"];
  episodes: IEpisode[];
}) => {
  const [maxLength, setMaxLength] = useState<number | undefined>(
    initialMaxLength
  );
  const router = useRouter();

  const limitedEpisodes =
    maxLength === undefined ? episodes : episodes.slice(0, maxLength);

  return (
    <List style={{ width: "100%", padding: 0 }}>
      {limitedEpisodes.map((episode) => (
        <ListItem
          key={episode.id}
          onClick={() =>
            router.push(
              "/rooms/[roomSlug]/admin/[playlistId]/episode/[episodeId]",
              `/rooms/${roomSlug}/admin/${playlistId}/episode/${episode.id}`
            )
          }
          button
        >
          <ListItemAvatar>
            <Avatar
              variant="square"
              alt={episode.title}
              src={
                episode.image_file.data.thumbnails.find((t) => t.width > 100)
                  ?.url
              }
            />
          </ListItemAvatar>
          <ListItemText
            primary={episode.title}
            secondary={parseDbDate(episode.created_on).toRelative()}
          />
        </ListItem>
      ))}

      <Box p={2} pt={1}>
        {maxLength === undefined && (
          <Link
            color="textSecondary"
            href="#"
            onClick={() => setMaxLength(initialMaxLength)}
          >
            <Typography variant="subtitle2">Minder...</Typography>
          </Link>
        )}

        {maxLength !== undefined && episodes.length > maxLength && (
          <Link
            color="textSecondary"
            href="#"
            onClick={() => setMaxLength(undefined)}
          >
            <Typography variant="subtitle2">
              {episodes.length - maxLength} meer...
            </Typography>
          </Link>
        )}
      </Box>
    </List>
  );
};
