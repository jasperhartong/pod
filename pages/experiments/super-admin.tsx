import roomAllMeta from "@/api/rpc/commands/room.all.meta";
import roomCreateMeta from "@/api/rpc/commands/room.create.meta";
import roomImportMeta from "@/api/rpc/commands/room.import.meta";
import { IRoom } from "@/app-schema/IRoom";
import { ImageCoverDropZone } from "@/components/admin/components/image-cover-dropzone";
import { LoaderCentered } from "@/components/admin/layout/loader-centered";
import AppContainer from "@/components/app-container";
import { ErrorPage } from "@/components/error-page";
import { useRouter } from "@/hooks/useRouter";
import { useRPC } from "@/hooks/useRPC";
import { Box, Button, Divider, List, ListItem, ListItemText, Typography } from "@material-ui/core";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";

const SuperAdmin = () => {
  const [roomCoverUrl, setRoomCoverUrl] = useState<IRoom["cover_file"]["data"]["full_url"]>("");
  const router = useRouter();
  const secret = router.query.secret as string;

  const {
    call: fetchRooms,
    isValidating: isFetchingRooms,
    data: currentRooms,
    error,
  } = useRPC(roomAllMeta);

  const {
    call: createRoom,
    isValidating: isCreatingRoom,
    data: createdRoom,
    error: creationRoomError,
  } = useRPC(roomCreateMeta);

  const {
    call: importRoom,
    isValidating: isImporting,
    data: importedRooms,
    error: importError,
  } = useRPC(roomImportMeta);

  useEffect(() => {
    fetchRooms({ secret });
  }, [secret]);

  useEffect(() => {
    // Refetch all rooms after creation
    if (createdRoom) {
      fetchRooms({ secret });
    }
  }, [createdRoom]);

  if (!currentRooms && error) {
    return <ErrorPage error={error} />;
  }

  if (!currentRooms || isFetchingRooms) {
    return <LoaderCentered />;
  }

  return (
    <AppContainer>
      <Box textAlign="center" p={4}>
        <Typography variant="h5">Current Rooms</Typography>
        <List>
          {currentRooms?.map((room) => (
            <ListItem
              key={room.uid}
              button
              onClick={() =>
                router.push(
                  `/rooms/[roomUid]/admin`,
                  `/rooms/${room.uid}/admin`
                )
              }
            >
              <ListItemText
                primary={room.title}
                secondary={DateTime.fromISO(room.created_on).toRelative()}
              />
            </ListItem>
          ))}
        </List>
        {!currentRooms?.length && <>No Rooms</>}

        <Box pt={8} />
        <Divider />
        <Box pt={4} />

        <Box p={2} textAlign="center">
          <ImageCoverDropZone
            onSuccess={(downloadUrl) =>
              setRoomCoverUrl(downloadUrl)
            }
            onDelete={() => setRoomCoverUrl("")}
          />
        </Box>

        <Button
          disabled={isCreatingRoom}
          onClick={() => {
            const title = prompt("Please enter room title");
            if (title) {
              createRoom({ data: { title, cover_file: { data: { full_url: roomCoverUrl } } } });
            }
          }}
        >
          Create room
        </Button>

        {creationRoomError && (
          <Box textAlign="center" p={4}>
            Error: {creationRoomError}
          </Box>
        )}

        <Box pt={8} />
        <Divider />
        <Box pt={4} />

        <Button
          disabled={isImporting}
          onClick={() =>
            confirm("Are you sure, this will lead to duplicates") &&
            importRoom({ secret })
          }
        >
          Import rooms from Directus
        </Button>

        {importedRooms && (
          <Box textAlign="center" p={4}>
            Imported: {importedRooms.map((d) => d.title + ":" + d.uid)}
          </Box>
        )}

        {importError && (
          <Box textAlign="center" p={4}>
            Error: {importError}
          </Box>
        )}
      </Box>
    </AppContainer>
  );
};

export default SuperAdmin;
