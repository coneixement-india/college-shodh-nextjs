"use client";
import { client } from "@/sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import Link from "next/link";
import { useState, useEffect } from "react";

const POSTS_PER_PAGE = 6;

const builder = imageUrlBuilder(client);
function urlFor(source) {
  return builder.image(source);
}

const fetchPosts = async (page) => {
  const start = (page - 1) * POSTS_PER_PAGE;
  const end = start + POSTS_PER_PAGE;
  const query = `*[_type == "post" && defined(publishedAt)] | order(publishedAt desc) [${start}...${end}] {
    _id,
    title,
    slug,
    publishedAt,
    mainImage {
      asset -> {
        _id,
        url
      },
      alt
    }
  }`;
  return client.fetch(query);
};

export default function BlogListPage() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  useEffect(() => {
    fetchPosts(page).then((newPosts) => {
      setPosts(newPosts);
    });

    // Fetch total post count
    client.fetch(`count(*[_type == "post" && defined(publishedAt)])`).then(setTotalPosts);
  }, [page]);

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  return (
    <main className="container mx-auto p-10">
      <h1 className="text-3xl font-extrabold mb-12">Blog Posts</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post._id} post={post} />)
        ) : (
          <p>No blog posts found.</p>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          {/* Previous Arrow */}
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-3 py-2 rounded-md bg-gray-300 disabled:opacity-50"
          >
            ←
          </button>

          {/* Page Numbers */}
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-4 py-2 rounded-md ${
                page === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}

          {/* Next Arrow */}
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-2 rounded-md bg-gray-300 disabled:opacity-50"
          >
            →
          </button>
        </div>
      )}
    </main>
  );
}

// Post Card Component
const PostCard = ({ post }) => {
  const postImageUrl = post.mainImage?.asset
    ? urlFor(post.mainImage).width(800).height(450).url()
    : "/placeholder.jpg";

  return (
    <div className="border rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
      <Link href={`/blog/${post.slug.current}`}>
        <img
          src={postImageUrl}
          alt={post.mainImage?.alt || post.title}
          className="w-full h-56 object-cover"
        />
        <div className="p-6">
          <h2 className="text-3xl font-bold">{post.title}</h2>
          <p className="text-gray-500 mt-2">
            {new Date(post.publishedAt).toLocaleDateString()}
          </p>
        </div>
      </Link>
    </div>
  );
};
