import { IRoom } from "@/app-schema/IRoom";
import useSharing from "@/hooks/useSharing";
import {
  Box,
  Button,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Grid,
  Typography,
} from "@material-ui/core";
import IconCopySuccess from "@material-ui/icons/CheckCircle";
import IconExpandMore from "@material-ui/icons/ExpandMore";
import IconCopy from "@material-ui/icons/FileCopy";
import IconRadio from "@material-ui/icons/Radio";
import IconShare from "@material-ui/icons/Share";
import NextLink from "next/link";
import { useState } from "react";
import { useClipboard } from "use-clipboard-copy";
import { AdminInstructionsLayout } from "../layout/admin-instruction-layout";

export const ListenRoomPanel = ({ room }: { room: IRoom }) => {
  const [didCopy, setDidCopy] = useState<string | undefined>(undefined);
  const clipboard = useClipboard();
  const { hasNativeShare, nativeShare } = useSharing();

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
        <Grid container alignContent="center">
          <IconRadio fontSize="small" style={{ marginRight: 8 }} />
          <Typography>Deel via de Luisterkamer</Typography>
        </Grid>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails id="subscribe-content">
        <Box width="100%">
          {hasNativeShare && (
            <>
              <Button
                fullWidth
                variant="contained"
                onClick={() =>
                  nativeShare(
                    `${room.title}`,
                    `Luisterkamer – powered by Tapes.me`,
                    `/rooms/${room.slug}`
                  )
                }
              >
                <IconShare fontSize="small" style={{ marginRight: 8 }} /> Deel
                luisterkamer
              </Button>
              <Box pt={2} />
            </>
          )}

          <Button
            fullWidth
            variant={hasNativeShare ? "outlined" : "contained"}
            onClick={() => handleCopy(`/rooms/${room.slug}`)}
          >
            {`/rooms/${room.slug}` === didCopy ? (
              <>
                <IconCopySuccess fontSize="small" style={{ marginRight: 8 }} />{" "}
                Gekopieerd
              </>
            ) : (
              <>
                <IconCopy fontSize="small" style={{ marginRight: 8 }} /> Kopieer
                Luisterkamer link
              </>
            )}
          </Button>
          <Box pt={2} />

          <NextLink href="/rooms/[roomSlug]" as={`/rooms/${room.slug}`}>
            <Button fullWidth variant="outlined">
              Open Luisterkamer
            </Button>
          </NextLink>

          <AdminInstructionsLayout
            items={[
              {
                title: "Laat anderen luisteren via de Luisterkamer",
                text:
                  "Deze luisterkamer is zo simpel mogelijk en werkt op telefoons, tablets en desktops.",
              },
            ]}
          />
        </Box>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};