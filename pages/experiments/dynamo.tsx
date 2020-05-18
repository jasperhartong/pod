import roomImportMeta from "@/api/rpc/commands/room.import.meta";
import AppContainer from "@/components/app-container";
import { useRPC } from "@/hooks/useRPC";
import { Box, Button } from "@material-ui/core";

const slugs = ["famhartong", "v6p4vd", "yjcx3c", "3jyqrn", "678cp7", "demo"];

const Dynamo = () => {
  const { call: importRoom, isValidating, data, error } = useRPC(
    roomImportMeta
  );

  return (
    <AppContainer>
      <Box textAlign="center" p={4}>
        <Button
          disabled={isValidating}
          onClick={() => importRoom({ uids: slugs })}
        >
          Import rooms: {slugs.join(", ")}
        </Button>
        {data && (
          <Box textAlign="center" p={4}>
            Imported: {data.map((d) => d.title + ":" + d.uid)}
          </Box>
        )}

        {error && (
          <Box textAlign="center" p={4}>
            Error: {error}
          </Box>
        )}
      </Box>
    </AppContainer>
  );
};

export default Dynamo;
