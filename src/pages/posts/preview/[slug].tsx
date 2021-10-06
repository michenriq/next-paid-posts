import { GetStaticPaths, GetStaticProps } from "next"
import { getPrismicClient } from "../../../services/prismic"
import { RichText } from 'prismic-dom'
import Head from "next/head"
import styles from '../post.module.scss'
import Link from 'next/link'
import { useSession } from "next-auth/client"
import { useEffect } from "react"
import router, { useRouter } from "next/router"

interface PostPreviewProps {
  post: {
    title: string,
    slug: string,
    content: string,
    updatedAt: string
  }
}


export default function PostPreview({ post }: PostPreviewProps) {
  const [session] = useSession()
  const router = useRouter()

  useEffect(() => {
    if(session?.activeSubscription) {
      router.push(`/posts/${post.slug}`)
    }
  },[session])
  return (
    <>
      <Head>
        <title> {post.title} | Ignews </title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div 
            className={`${styles.postContent} ${styles.previewContent}`}
            dangerouslySetInnerHTML={{ __html: post.content}} 
          />
          <div className={styles.continueReading}>
            Wanna continue reading?
            <Link href="/">
              <a>Subscrine now 🤗 </a>
            </Link>
          </div>
        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  
  const prismic = getPrismicClient();

  const response = await prismic.getByUID('publi', String(slug), {})

  const post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content.splice(0, 3)),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return {
    props: {
      post
    },
    revalidate: 60 * 30 // 30 minutes
  }

}