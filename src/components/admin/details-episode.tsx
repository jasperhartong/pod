import Link from "next/link";
import { Box, Button, Typography } from "@material-ui/core";
import { IRoom } from "../../app-schema/IRoom";
import { IPlaylist } from "../../app-schema/IPlaylist";
import AdminDualPaneLayout from "./layout/admin-dual-pane";
import { EpisodeCoverLayout } from "./layout/episode-cover-layout";
import { IEpisode } from "../../app-schema/IEpisode";
import AdminHeaderCloseToOverview from "./layout/admin-header-close-to-overview";
import { RPCClientFactory } from "../../api/rpc/rpc-client";
import episodeUpdateMeta from "../../api/rpc/commands/episode.update.meta";
import { useRouter } from "next/dist/client/router";
import { useState } from "react";

interface Props {
  room: IRoom;
  playlist: IPlaylist;
  episode: IEpisode;
}

const DetailsEpisode = ({ room, playlist, episode }: Props) => {
  const router = useRouter();
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const handlePublish = async () => {
    setIsValidating(true);
    const updating = await RPCClientFactory(episodeUpdateMeta).call({
      id: episode.id,
      data: {
        status: "published",
      },
    });
    if (updating.ok) {
      router.push(`/rooms/[roomSlug]/admin`, `/rooms/${room.slug}/admin`);
    } else {
      alert("Publiceren mislukt, probeer nogmaals");
      setIsValidating(false);
    }
  };
  return (
    <AdminDualPaneLayout
      image={episode.image_file.data.thumbnails.find((e) => e.width > 100)?.url}
      blur={40}
      title={episode.title}
      subtitle={"in " + playlist.title}
      action={<AdminHeaderCloseToOverview roomSlug={room.slug} />}
      firstItem={
        <Box p={2} pb={0} textAlign="center">
          <Box style={{ display: "inline-block" }}>
            <EpisodeCoverLayout
              imageUrl={
                episode.image_file.data.thumbnails.find((t) => t.width > 240)
                  ?.url
              }
              style={{ width: 240, height: 240 }}
            />
          </Box>
        </Box>
      }
      secondItem={
        <>
          <Box mt={2}>
            <audio
              style={{ width: "100%" }}
              src={episode.audio_file}
              controls
            />
          </Box>
          <Box mt={4}>
            {episode.status === "draft" && (
              <>
                <Button
                  disabled={isValidating}
                  onClick={handlePublish}
                  variant="contained"
                  fullWidth
                >
                  Publiceer nu
                </Button>
                <Box mt={2}>
                  <Typography variant="body2" gutterBottom>
                    Deze aflevering is nog niet gepubliceerd
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Pas na publiceren wordt deze zichtbaar in de
                    <Link href="/rooms/[roomSlug]" as={`/rooms/${room.slug}`}>
                      <Typography
                        style={{ display: "inline" }}
                        variant="body2"
                        color="textPrimary"
                      >
                        {" "}
                        Luisterkamer
                      </Typography>
                    </Link>
                  </Typography>
                </Box>
              </>
            )}
          </Box>
          {/* We can easily allow to re-record stuff :) */}
          {/* <Box mt={2}>
            <Link
              href={`/rooms/[roomSlug]/admin/[playListId]/record-episode/[episodeId]`}
              as={`/rooms/${room.slug}/admin/${playlist.id}/record-episode/${episode.id}`}
            >
              <Button fullWidth>Neem opnieuw op</Button>
            </Link>
          </Box> */}
        </>
      }
    />
  );
};

export default DetailsEpisode;
