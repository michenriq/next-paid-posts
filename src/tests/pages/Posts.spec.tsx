import { render, screen } from "@testing-library/react";
import Post, { getStaticProps } from "../../pages/posts";
import { getPrismicClient } from "../../services/prismic";
import { mocked } from "ts-jest/utils";

jest.mock("../../services/stripe");

const posts = [
  {
    slug: "my-new-post",
    title: "My new post",
    excerpt: "Post excerpt",
    updatedAt: "10 de Abril",
  },
];

jest.mock("../../services/prismic");

describe("Posts page", () => {
  it("render correctly", () => {
    render(<Post posts={posts} />);

    expect(screen.getByText(/My new Post/i)).toBeInTheDocument();
  });

  it("loads initial data", async () => {
    const getPrismicClientMocked = mocked(getPrismicClient);

    getPrismicClientMocked.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: "my-new-post",
            data: {
              title: [{ type: "heading", text: "My new post" }],
              content: [{ type: "paragraph", text: "Post excerpt" }],
            },
            last_publication_date: "04-01-2021",
          },
        ],
      }),
    } as any);

    const response = await getStaticProps({});

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [
            {
              slug: "my-new-post",
              title: "My new post",
              excerpt: "Post excerpt",
              updatedAt: "01 de abril de 2021",
            },
          ],
        },
      })
    );
  });
});
