import { IResponse } from "@/api/IResponse";
import roomFetch from "@/api/rpc/commands/room.fetch";
import { IRoom } from "@/app-schema/IRoom";
import { LoaderCentered } from "@/components/admin/layout/loader-centered";
import { ErrorPage } from "@/components/error-page";
import { ListenRoom } from "@/components/listen-room";
import { useRouter } from "@/hooks/useRouter";
import { useSWRRoom } from "@/hooks/useSWRRoom";
import { GetStaticPaths, GetStaticProps } from "next";

interface PageProps {
  preFetchedRoomResponse?: IResponse<IRoom>;
}

const ListenRoomPage = ({ preFetchedRoomResponse }: PageProps) => {
  const router = useRouter();
  const { data } = useSWRRoom(
    router.isFallback ? null : (router.query.roomSlug as string),
    preFetchedRoomResponse
  );

  if (!data || router.isFallback) {
    return <LoaderCentered />;
  }

  if (!data.ok) {
    return <ErrorPage error={data.error} />;
  }

  return <ListenRoom room={data.data} />;
};

export default ListenRoomPage;

export const getStaticProps: GetStaticProps<PageProps> = async ({ params }) => {
  return {
    props: {
      // Runs serverside, call rpc handler directly
      preFetchedRoomResponse: await roomFetch.handle({
        slug: params?.roomSlug as string,
      }),
    },
    // we will attempt to re-generate the page:
    // - when a request comes in
    // - at most once every second
    unstable_revalidate: 1,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    // Not pre-rendering any paths yet :)
    paths: [],
    fallback: true,
  };
};
