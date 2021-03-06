import { IRoom } from "@/app-schema/IRoom";
import useSharing from "@/hooks/useSharing";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Divider, Grid, Typography } from "@material-ui/core";
import IconCopySuccess from "@material-ui/icons/CheckCircle";
import IconExpandMore from "@material-ui/icons/ExpandMore";
import IconCopy from "@material-ui/icons/FileCopy";
import IconNewWindow from "@material-ui/icons/OpenInNew";
import IconShare from "@material-ui/icons/Share";
import { useEffect, useState } from "react";
import { useClipboard } from "use-clipboard-copy";
import { rssUrl } from "../../../urls";
import { AdminInstructionsLayout } from "../layout/admin-instruction-layout";

type SubscribeLink = { url: string; label: string };

export const PodcastPanel = ({ room }: { room: IRoom }) => {
  const [didCopy, setDidCopy] = useState<string | undefined>(undefined);
  const [subscribeLinks, setSubscribeLinks] = useState<SubscribeLink[]>([]);
  const clipboard = useClipboard();
  const { hasNativeShare, nativeShare } = useSharing();

  useEffect(() => {
    setSubscribeLinks(subscribeLinksForCurrentHost(room.uid));
  }, []);

  const handleCopy = (url: string) => {
    clipboard.copy(url);
    setDidCopy(url);
  };

  return (
    <Accordion square>
      <AccordionSummary
        expandIcon={<IconExpandMore />}
        aria-controls="subscribe-content"
        id="subscribe-header"
      >
        <Grid container alignContent="center">
          <Typography>Abboneer op de Podcast feed</Typography>
        </Grid>
      </AccordionSummary>
      <AccordionDetails id="subscribe-content">
        <Box width="100%">
          {subscribeLinks.map((link) => (
            <Box key={`${link.url}${link.label}`} mb={2}>
              {/* <Typography variant="subtitle2">{link.label}</Typography> */}
              <Grid container justify="space-between">
                <Button href={link.url}>
                  <IconNewWindow fontSize="small" style={{ marginRight: 8 }} />{" "}
                  {link.label}
                </Button>
                <Grid item={true}>
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
                    </Button>
                  )}
                  <Button onClick={() => handleCopy(link.url)}>
                    {link.url === didCopy ? (
                      <>
                        <IconCopySuccess
                          fontSize="small"
                          style={{ marginRight: 8 }}
                        />
                      </>
                    ) : (
                        <>
                          <IconCopy fontSize="small" style={{ marginRight: 8 }} />
                        </>
                      )}
                  </Button>
                </Grid>
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
      </AccordionDetails>
    </Accordion>
  );
};

const subscribeLinksForCurrentHost = (uid: IRoom["uid"]) => {
  // Only works correctly on client side
  const host = typeof window !== "undefined" ? window.location.host : "";
  const protocol =
    typeof window !== "undefined" ? window.location.protocol : "";

  const subscribeLinks: SubscribeLink[] = [
    {
      label: "Apple Podcast",
      url: rssUrl("podcast:", host, uid),
    },
    // {
    //   label: "Apple Podcast (Mac)",
    //   url: rssUrl("pcast:", host, uid),
    // },
    { label: "RSS Feed", url: rssUrl("feed:", host, uid) },
    {
      label: "XML Feed",
      url: rssUrl(protocol, host, uid),
    },
  ];
  return subscribeLinks;
};
