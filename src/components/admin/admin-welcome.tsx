import { IRoom } from "@/app-schema/IRoom";
import AdminDualPaneLayout from "@/components/admin/layout/admin-dual-pane";
import { AdminInstructionsLayout } from "@/components/admin/layout/admin-instruction-layout";
import { ImageCoverLayout } from "@/components/admin/layout/image-cover-layout";
import { useRouter } from "@/hooks/useRouter";
import useSharing from "@/hooks/useSharing";
import {
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  Typography,
} from "@material-ui/core";
import IconCopySuccess from "@material-ui/icons/CheckCircle";
import IconChevronRight from "@material-ui/icons/ChevronRight";
import IconHeadset from "@material-ui/icons/Headset";
import IconMic from "@material-ui/icons/Mic";
import { useEffect, useState } from "react";
import { useClipboard } from "use-clipboard-copy";
import { AppColors } from "../../theme";

export const AdminWelcome = ({ room }: { room: IRoom }) => {
  const [basePath, setBasePath] = useState<string>();
  const router = useRouter();
  const clipboard = useClipboard();
  const { hasNativeShare, nativeShare } = useSharing();
  useEffect(() => {
    setBasePath(`${window.location.protocol}//${window.location.host}`);
  }, []);

  return (
    <AdminDualPaneLayout
      title={room.title}
      subtitle={"Besloten luisterbibliotheek"}
      action={<Chip color="secondary" label="Tapes.me beta" />}
      firstItem={
        <Box position="relative">
          <Box textAlign="center">
            <ImageCoverLayout
              style={{
                width: 240,
                height: 240,
                marginTop: 16,
                display: "inline-block",
                marginLeft: "-10%",
                backgroundColor: AppColors.BLUE,
              }}
              centeredChildren={
                <>
                  <Badge badgeContent={1} color="secondary">
                    <IconMic fontSize="large" />
                  </Badge>
                  <Box pt={2} p={2}>
                    <Typography variant="body1">
                      Oma's en opa's lezen voor in de opname studio.
                    </Typography>
                  </Box>
                  <Box pt={2} ml={-1} mr={-1}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      onClick={
                        hasNativeShare
                          ? () =>
                              nativeShare(
                                "Opname studio",
                                "Opname studio",
                                `${basePath}/rooms/${room.slug}/admin`
                              )
                          : () =>
                              clipboard.copy(
                                `${basePath}/rooms/${room.slug}/admin`
                              )
                      }
                    >
                      {clipboard.copied && (
                        <IconCopySuccess
                          fontSize="small"
                          style={{ marginRight: 8 }}
                        />
                      )}
                      {hasNativeShare
                        ? "Deel Opname studio"
                        : "Kopieer link opname studio"}
                    </Button>
                  </Box>
                </>
              }
            />
          </Box>

          <Box pt={2} />

          <Box textAlign="center">
            <ImageCoverLayout
              style={{
                width: 240,
                height: 240,
                display: "inline-block",
                transform: "rotate(2deg)",
                marginTop: -20,
                marginRight: "-10%",
                backgroundColor: AppColors.MAGENTA,
              }}
              centeredChildren={
                <>
                  <Badge badgeContent={2} color="secondary">
                    <IconHeadset fontSize="large" />
                  </Badge>
                  <Box pt={2} p={1}>
                    <Typography variant="body1">
                      Kinderen luisteren in de luisterkamer.
                    </Typography>
                  </Box>
                  <Box pt={2} ml={-1} mr={-1}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      onClick={
                        hasNativeShare
                          ? () =>
                              nativeShare(
                                "Luisterkamer",
                                "Luisterkamer",
                                `${basePath}/rooms/${room.slug}`
                              )
                          : () =>
                              clipboard.copy(`${basePath}/rooms/${room.slug}`)
                      }
                    >
                      {clipboard.copied && (
                        <IconCopySuccess
                          fontSize="small"
                          style={{ marginRight: 8 }}
                        />
                      )}
                      {hasNativeShare
                        ? "Deel luisterkamer"
                        : "Kopieer link luisterkamer"}
                    </Button>
                  </Box>
                </>
              }
            />
          </Box>
          <Box pt={2} />
        </Box>
      }
      secondItem={
        <>
          <Typography variant="h6">Beta Notities</Typography>
          <AdminInstructionsLayout
            items={[
              {
                title: "Op dit moment is alles nog publiek.",
                text:
                  "Ieder die de naam kent kan in principe de kamer vinden. Maar ja, niemand kent dit nog.",
              },
              {
                title: "Alvast wat luistervoer.",
                text:
                  "De luisterkamer bevat al wat voorleesvoer van mijn eigen moeder :)",
              },
              {
                title: "Benieuwd naar feedback!",
                text:
                  "Stuur me een mailtje of een appje als je een vet idee hebt of iets enorm frustreert!",
              },
            ]}
          />
          <Typography variant="body2" color="textSecondary">
            – Jasper
          </Typography>

          <Box pt={2} />
          <Divider />
          <Box pt={2} />
          <Button
            fullWidth
            variant="outlined"
            onClick={() =>
              router.push(
                `/rooms/[roomSlug]/admin`,
                `/rooms/${room.slug}/admin`
              )
            }
          >
            Opname Studio{" "}
            <IconChevronRight fontSize="small" color="secondary" />
          </Button>
          <Box pt={2} />
          <Button
            fullWidth
            variant="outlined"
            onClick={() =>
              router.push(`/rooms/[roomSlug]`, `/rooms/${room.slug}`)
            }
          >
            Luisterkamer <IconChevronRight fontSize="small" color="secondary" />
          </Button>
          <Box pt={2} />
        </>
      }
    />
  );
};
