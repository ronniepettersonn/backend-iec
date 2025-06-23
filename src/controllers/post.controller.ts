import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import { z } from 'zod'

const createPostSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  slug: z.string().min(3),
  image: z.string().url().optional(),
  categoryId: z.string().uuid().optional(),
  published: z.boolean().default(false),
  tags: z.array(z.string().min(1)).optional()
})

export const createPost = async (req: Request, res: Response) => {
  const userId = req.userId!
  const churchId = req.churchId

  try {
    if (!userId || !churchId) {
      return res.status(401).json({ error: 'Usuário não autenticado ou igreja não identificada' })
    }

    const validated = createPostSchema.parse(req.body)
    const { tags = [], ...postData } = validated

    // Garante que os nomes das tags sejam únicos
    const uniqueTags = [...new Set(tags.map(tag => tag.trim().toLowerCase()))]

    // Verifica quais já existem
    const existingTags = await prisma.postTag.findMany({
      where: {
        name: { in: uniqueTags },
        churchId
      }
    })

    const existingNames = existingTags.map(t => t.name)
    const newTagNames = uniqueTags.filter(name => !existingNames.includes(name))

    // Cria novas tags que ainda não existem
    const newTags = await Promise.all(
      newTagNames.map(name =>
        prisma.postTag.create({ data: { name, churchId } })
      )
    )

    const allTags = [...existingTags, ...newTags]

    // Cria o post e relaciona as tags
    const post = await prisma.post.create({
      data: {
        ...postData,
        authorId: userId,
        churchId,
        PostTagsOnPosts: {
          create: allTags.map(tag => ({
            tag: {
              connect: { id: tag.id }
            }
          }))
        }
      },
      include: {
        PostTagsOnPosts: {
          include: { tag: true }
        }
      }
    })

    return res.status(201).json(post)
  } catch (error: any) {
    console.error('[createPost]', error)
    return res.status(400).json({ error: error.message })
  }
}


export const listPosts = async (_req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        PostTagsOnPosts: {
          include: {
            tag: true
          }
        }
      }
    })

    return res.json(posts)
  } catch (error) {
    console.error('[listPosts]', error)
    return res.status(500).json({ error: 'Erro ao listar posts' })
  }
}

export const getPostBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params

  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        category: true,
        author: { select: { id: true, name: true, avatar: true } }
      }
    })

    if (!post) return res.status(404).json({ error: 'Post não encontrado' })

    return res.json(post)
  } catch (error) {
    console.error('[getPostBySlug]', error)
    return res.status(500).json({ error: 'Erro ao buscar post' })
  }
}
