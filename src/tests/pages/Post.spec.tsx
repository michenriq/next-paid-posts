import { render, screen } from "@testing-library/react";
import Post, { getServerSideProps } from "../../pages/posts/[slug]";
import { mocked } from "ts-jest/utils";
import { getSession } from "next-auth/client";
import { getPrismicClient } from "../../services/prismic";

jest.mock("../../services/stripe");

const post = {
  slug: "my-new-post",
  title: "My new post",
  content: "<p>Post excerpt</p>",
  updatedAt: "10 de Abril",
};
jest.mock("next-auth/client");
jest.mock("../../services/prismic");

describe("Post page", () => {
  it("render correctly", () => {
    render(<Post post={post} />);

    expect(screen.getByText(/My new Post/i)).toBeInTheDocument();
    expect(screen.getByText(/Post excerpt/i)).toBeInTheDocument();
  });

  it("redirects user if no subscription is found", async () => {
    const getSessinMocked = mocked(getSession);
    const getPrismicClientMocked = mocked(getPrismicClient);

    getSessinMocked.mockResolvedValueOnce(null);
    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValue({
        data: {
          title: [{ type: "heading", text: "My new post" }],
          content: [{ type: "paragraph", text: "Post content" }],
        },
        last_publication_date: "04-01-2021",
      }),
    } as any);

    const response = await getServerSideProps({
      params: { slug: "my-new-post" },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: "/",
        }),
      })
    );
  });

  it("loads initial data", async () => {
    const getSessinMocked = mocked(getSession);
    const getPrismicClientMocked = mocked(getPrismicClient);

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValue({
        data: {
          title: [{ type: "heading", text: "My new post" }],
          content: [{ type: "paragraph", text: "Post content" }],
        },
        last_publication_date: "04-01-2021",
      }),
    } as any);

    getSessinMocked.mockResolvedValueOnce({
      activeSubscription: "fake-active-subscription",
    } as any);

    const response = await getServerSideProps({
      params: { slug: "my-new-post" },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: "my-new-post",
            title: "My new post",
            content: "<p>Post content</p>",
            updatedAt: "01 de abril de 2021",
          },
        },
      })
    );
  });
});
