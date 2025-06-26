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

export const listPosts = async (req: Request, res: Response) => {
  try {
    const { published, page = '1', limit = '10' } = req.query

    const pageNumber = parseInt(page as string, 10)
    const perPage = parseInt(limit as string, 10)
    const skip = (pageNumber - 1) * perPage

    const whereClause =
      published === 'false'
        ? {} // todos os posts
        : { published: true } // padrão: só publicados

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage,
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
      }),
      prisma.post.count({ where: whereClause })
    ])

    return res.json({
      data: posts,
      total,
      page: pageNumber,
      perPage,
      totalPages: Math.ceil(total / perPage)
    })
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

export const listPublicHighlights = async (_req: Request, res: Response) => {
  try {
    // Primeiro, busca os destacados
    const highlightedPosts = await prisma.post.findMany({
      where: { highlighted: true, published: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        author: { select: { name: true, avatar: true } },
        PostTagsOnPosts: {
          include: { tag: true }
        },
        category: true
      }
    })

    // Se já tem 3 ou mais, retorna só eles
    if (highlightedPosts.length >= 3) {
      return res.json(highlightedPosts)
    }

    // Se tiver menos de 3, completa com os mais recentes que não estão destacados
    const remaining = 3 - highlightedPosts.length

    const recentPosts = await prisma.post.findMany({
      where: {
        highlighted: false,
         published: true
      },
      orderBy: { createdAt: 'desc' },
      take: remaining,
      include: {
        author: { select: { name: true, avatar: true } },
        PostTagsOnPosts: {
          include: { tag: true }
        },
        category: true
      }
    })

    const finalPosts = [...highlightedPosts, ...recentPosts]

    return res.json(finalPosts)
  } catch (error) {
    console.error('[listPublicHighlights]', error)
    return res.status(500).json({ error: 'Erro ao listar posts para home pública' })
  }
}

export const togglePostPublished = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    // Busca o post atual
    const post = await prisma.post.findUnique({
      where: { id }
    })

    if (!post) {
      return res.status(404).json({ error: 'Post não encontrado' })
    }

    // Inverte o status
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        published: !post.published
      }
    })

    return res.json(updatedPost)
  } catch (error) {
    console.error('[togglePostPublished]', error)
    return res.status(500).json({ error: 'Erro ao alternar status do post' })
  }
}