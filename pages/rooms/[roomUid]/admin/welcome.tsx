import { IResponse } from "@/api/IResponse";
import roomFetch from "@/api/rpc/commands/room.fetch";
import { IRoom } from "@/app-schema/IRoom";
import { AdminWelcome } from "@/components/admin/admin-welcome";
import { LoaderCentered } from "@/components/admin/layout/loader-centered";
import { ErrorPage } from "@/components/error-page";
import { useRouter } from "@/hooks/useRouter";
import { useSWRRoom } from "@/hooks/useSWRRoom";
import { GetStaticPaths, GetStaticProps } from "next";

const revalidationInterval = 60 * 60 * 24; // 24 hour

interface PageProps {
  preFetchedRoomResponse?: IResponse<IRoom>;
}

const WelcomePage = ({ preFetchedRoomResponse }: PageProps) => {
  const router = useRouter();
  const { data } = useSWRRoom(
    router.isFallback ? null : (router.query.roomUid as string),
    preFetchedRoomResponse
  );

  if (!data || router.isFallback) {
    return <LoaderCentered />;
  }

  if (!data.ok) {
    return <ErrorPage error={data.error} />;
  }

  return <AdminWelcome room={data.data} />;
};

export default WelcomePage;

export const getStaticProps: GetStaticProps<PageProps> = async ({ params }) => {
  return {
    props: {
      // Runs serverside, call rpc handler directly
      preFetchedRoomResponse: await roomFetch.call({
        uid: params?.roomUid as string,
      }),
    },
    // we will attempt to re-generate the page:
    // - when a request comes in
    // - at most once every revalidate seconds
    revalidate: revalidationInterval,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    // Not pre-rendering any paths yet :)
    paths: [],
    fallback: true,
  };
};
