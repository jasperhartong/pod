import roomCreateMeta from "@/api/rpc/commands/room.create.meta";
import AppContainer from "@/components/app-container";
import { useRPC } from "@/hooks/useRPC";
import { Box, Button } from "@material-ui/core";

const Dynamo = () => {
  const { call: createRoom, isValidating, data, error } = useRPC(
    roomCreateMeta
  );

  return (
    <AppContainer>
      <Box textAlign="center" p={4}>
        <Button
          disabled={isValidating}
          onClick={() => createRoom({ data: { title: "test" } })}
        >
          Create room
        </Button>
        {data && (
          <Box textAlign="center" p={4}>
            Created: {data.title}
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
