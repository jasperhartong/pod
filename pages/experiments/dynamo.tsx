import roomImportMeta from "@/api/rpc/commands/room.import.meta";
import AppContainer from "@/components/app-container";
import { useRPC } from "@/hooks/useRPC";
import { Box, Button } from "@material-ui/core";

const slug = "famhartong";

const Dynamo = () => {
  const { call: importRoom, isValidating, data, error } = useRPC(
    roomImportMeta
  );

  return (
    <AppContainer>
      <Box textAlign="center" p={4}>
        <Button
          disabled={isValidating}
          onClick={() => importRoom({ uid: slug })}
        >
          Import room: {slug}
        </Button>
        {data && (
          <Box textAlign="center" p={4}>
            Imported: {data.title} : {data.uid}
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
