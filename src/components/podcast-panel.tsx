import { useEffect, useState } from "react";
import {
  Grid,
  List,
  ListItem,
  ExpansionPanel,
  ExpansionPanelSummary,
  Typography,
  ExpansionPanelDetails,
  Button,
  Box,
  Divider,
} from "@material-ui/core";
import IconExpandMore from "@material-ui/icons/ExpandMore";
import IconNewWindow from "@material-ui/icons/OpenInNew";
import IconShare from "@material-ui/icons/Share";
import IconCopy from "@material-ui/icons/FileCopy";
import IconCopySuccess from "@material-ui/icons/CheckCircle";
import { rssUrl } from "../urls";
import { IRoom } from "../app-schema/IRoom";
import useSharing from "../hooks/useSharing";
import { useClipboard } from "use-clipboard-copy";
import { AdminInstructionsLayout } from "./admin/layout/admin-instruction-layout";

type SubscribeLink = { url: string; label: string };

export const PodcastPanel = ({ room }: { room: IRoom }) => {
  const [didCopy, setDidCopy] = useState<string | undefined>(undefined);
  const [subscribeLinks, setSubscribeLinks] = useState<SubscribeLink[]>([]);
  const clipboard = useClipboard();
  const { hasNativeShare, nativeShare } = useSharing();

  useEffect(() => {
    setSubscribeLinks(subscribeLinksForCurrentHost(room.slug));
  }, []);

  const handleCopy = (url: string) => {
    clipboard.copy(url);
    setDidCopy(url);
  };

  return (
    <ExpansionPanel square>
      <ExpansionPanelSummary
        expandIcon={<IconExpandMore />}
        aria-controls="subscribe-content"
        id="subscribe-header"
      >
        <Typography>Luisteren via een Podcast app</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails id="subscribe-content">
        <Box width="100%">
          {subscribeLinks.map((link) => (
            <Box key={`${link.url}${link.label}`} mb={2}>
              <Typography variant="subtitle2">{link.label}</Typography>
              <Grid container>
                <Button href={link.url}>
                  <IconNewWindow fontSize="small" style={{ marginRight: 8 }} />
                  Open
                </Button>
                {hasNativeShare && (
                  <Button
                    onClick={() =>
                      nativeShare(
                        `Podcast: ${room.title}`,
                        `${link.label} – powered by Tapes.me`,
                        link.url
                      )
                    }
                  >
                    <IconShare fontSize="small" style={{ marginRight: 8 }} />{" "}
                    Deel
                  </Button>
                )}
                <Button onClick={() => handleCopy(link.url)}>
                  {link.url === didCopy ? (
                    <>
                      <IconCopySuccess
                        fontSize="small"
                        style={{ marginRight: 8 }}
                      />{" "}
                      Gekopieerd
                    </>
                  ) : (
                    <>
                      <IconCopy fontSize="small" style={{ marginRight: 8 }} />{" "}
                      Kopieer
                    </>
                  )}
                </Button>
              </Grid>
              <Box mt={1}>
                <Divider />
              </Box>
            </Box>
          ))}
          <AdminInstructionsLayout
            items={[
              {
                title:
                  "Abonneer in een Podcast App en blijf altijd up-to-date.",
                text:
                  "Kies één van de bovenstaande opties. Open direct of deel de link met anderen.",
              },
            ]}
          />
        </Box>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

const subscribeLinksForCurrentHost = (slug: IRoom["slug"]) => {
  // Only works correctly on client side
  const host = typeof window !== "undefined" ? window.location.host : "";
  const protocol =
    typeof window !== "undefined" ? window.location.protocol : "";

  const subscribeLinks: SubscribeLink[] = [
    {
      label: "Apple Podcast (iPad / iPhone)",
      url: rssUrl("podcast:", host, slug),
    },
    {
      label: "Apple Podcast (Mac)",
      url: rssUrl("pcast:", host, slug),
    },
    { label: "RSS Feed", url: rssUrl("feed:", host, slug) },
    {
      label: "XML Feed",
      url: rssUrl(protocol, host, slug),
    },
  ];
  return subscribeLinks;
};
