import { describe, it, expect, vi, beforeEach } from 'vitest'
import { helpService } from '../helpService'
import { supabase } from '../../lib/supabase'

// Interfaces para tipagem dos mocks
interface MockSupabaseClient {
  from: ReturnType<typeof vi.fn>
}

// Mock do Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      then: vi.fn()
    }))
  }
}))

const mockSupabase = supabase as MockSupabaseClient

describe('HelpService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('FAQ Methods', () => {
    describe('getFAQs', () => {
      it('should return all active FAQs', async () => {
        const mockFAQs = [
          {
            id: 'faq1',
            question: 'How to book an appointment?',
            answer: 'You can book through our app',
            category: 'appointments',
            is_active: true,
            sort_order: 1
          }
        ]

        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: mockFAQs,
                error: null
              })
            })
          })
        })

        const result = await helpService.getFAQs()

        expect(mockSupabase.from).toHaveBeenCalledWith('faq_pet')
        expect(result).toEqual(mockFAQs)
      })

      it('should filter FAQs by category', async () => {
        const mockFAQs = [
          {
            id: 'faq1',
            question: 'How to book an appointment?',
            category: 'appointments'
          }
        ]

        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  data: mockFAQs,
                  error: null
                })
              })
            })
          })
        })

        const result = await helpService.getFAQs('appointments')
        expect(result).toEqual(mockFAQs)
      })

      it('should throw error when database query fails', async () => {
        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database error' }
              })
            })
          })
        })

        await expect(helpService.getFAQs()).rejects.toThrow('Erro ao buscar FAQ: Database error')
      })

      it('should return empty array when no FAQs found', async () => {
        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: null,
                error: null
              })
            })
          })
        })

        const result = await helpService.getFAQs()
        expect(result).toEqual([])
      })
    })

    describe('getFAQById', () => {
      it('should return specific FAQ', async () => {
        const mockFAQ = {
          id: 'faq1',
          question: 'How to book an appointment?',
          answer: 'You can book through our app'
        }

        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockFAQ,
                error: null
              })
            })
          })
        })

        const result = await helpService.getFAQById('faq1')
        expect(result).toEqual(mockFAQ)
      })

      it('should return null when FAQ not found', async () => {
        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' }
              })
            })
          })
        })

        const result = await helpService.getFAQById('nonexistent')
        expect(result).toBeNull()
      })

      it('should throw error for other database errors', async () => {
        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database error', code: 'OTHER' }
              })
            })
          })
        })

        await expect(helpService.getFAQById('faq1')).rejects.toThrow('Erro ao buscar FAQ: Database error')
      })
    })

    describe('createFAQ', () => {
      it('should create new FAQ', async () => {
        const faqData = {
          question: 'New question?',
          answer: 'New answer',
          category: 'general'
        }

        const mockCreatedFAQ = {
          id: 'faq1',
          ...faqData,
          created_at: '2024-01-01T10:00:00Z'
        }

        mockSupabase.from.mockReturnValue({
          insert: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockCreatedFAQ,
              error: null
            })
          })
        })

        const result = await helpService.createFAQ(faqData)
        expect(result).toEqual(mockCreatedFAQ)
      })

      it('should throw error when creation fails', async () => {
        mockSupabase.from.mockReturnValue({
          insert: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Creation failed' }
            })
          })
        })

        await expect(helpService.createFAQ({})).rejects.toThrow('Erro ao criar FAQ: Creation failed')
      })
    })

    describe('updateFAQ', () => {
      it('should update FAQ', async () => {
        const updates = { answer: 'Updated answer' }
        const mockUpdatedFAQ = {
          id: 'faq1',
          question: 'Question?',
          answer: 'Updated answer'
        }

        mockSupabase.from.mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockUpdatedFAQ,
                error: null
              })
            })
          })
        })

        const result = await helpService.updateFAQ('faq1', updates)
        expect(result).toEqual(mockUpdatedFAQ)
      })

      it('should throw error when update fails', async () => {
        mockSupabase.from.mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Update failed' }
              })
            })
          })
        })

        await expect(helpService.updateFAQ('faq1', {})).rejects.toThrow('Erro ao atualizar FAQ: Update failed')
      })
    })

    describe('deleteFAQ', () => {
      it('should delete FAQ', async () => {
        mockSupabase.from.mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              error: null
            })
          })
        })

        await helpService.deleteFAQ('faq1')
        expect(mockSupabase.from).toHaveBeenCalledWith('faq_pet')
      })

      it('should throw error when deletion fails', async () => {
        mockSupabase.from.mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              error: { message: 'Deletion failed' }
            })
          })
        })

        await expect(helpService.deleteFAQ('faq1')).rejects.toThrow('Erro ao deletar FAQ: Deletion failed')
      })
    })

    describe('incrementFAQViewCount', () => {
      it('should increment FAQ view count', async () => {
        mockSupabase.from.mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              error: null
            })
          })
        })

        await helpService.incrementFAQViewCount('faq1')
        expect(mockSupabase.from).toHaveBeenCalledWith('faq_pet')
      })

      it('should throw error when increment fails', async () => {
        mockSupabase.from.mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              error: { message: 'Increment failed' }
            })
          })
        })

        await expect(helpService.incrementFAQViewCount('faq1')).rejects.toThrow('Erro ao incrementar visualizações: Increment failed')
      })
    })

    describe('markFAQAsHelpful', () => {
      it('should mark FAQ as helpful', async () => {
        mockSupabase.from.mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              error: null
            })
          })
        })

        await helpService.markFAQAsHelpful('faq1')
        expect(mockSupabase.from).toHaveBeenCalledWith('faq_pet')
      })

      it('should throw error when marking fails', async () => {
        mockSupabase.from.mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              error: { message: 'Mark failed' }
            })
          })
        })

        await expect(helpService.markFAQAsHelpful('faq1')).rejects.toThrow('Erro ao marcar FAQ como útil: Mark failed')
      })
    })

    describe('searchFAQs', () => {
      it('should search FAQs by query', async () => {
        const mockFAQs = [
          {
            id: 'faq1',
            question: 'How to book appointment?',
            answer: 'Use the app'
          }
        ]

        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              or: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: mockFAQs,
                  error: null
                })
              })
            })
          })
        })

        const result = await helpService.searchFAQs('appointment')
        expect(result).toEqual(mockFAQs)
      })

      it('should throw error when search fails', async () => {
        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              or: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Search failed' }
                })
              })
            })
          })
        })

        await expect(helpService.searchFAQs('test')).rejects.toThrow('Erro ao buscar FAQ: Search failed')
      })
    })

    describe('getFAQCategories', () => {
      it('should return unique FAQ categories', async () => {
        const mockData = [
          { category: 'appointments' },
          { category: 'billing' },
          { category: 'appointments' },
          { category: 'general' }
        ]

        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              not: vi.fn().mockResolvedValue({
                data: mockData,
                error: null
              })
            })
          })
        })

        const result = await helpService.getFAQCategories()
        expect(result).toEqual(['appointments', 'billing', 'general'])
      })

      it('should throw error when fetching categories fails', async () => {
        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              not: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Fetch failed' }
              })
            })
          })
        })

        await expect(helpService.getFAQCategories()).rejects.toThrow('Erro ao buscar categorias de FAQ: Fetch failed')
      })
    })
  })

  describe('Help Articles Methods', () => {
    describe('getHelpArticles', () => {
      it('should return published help articles', async () => {
        const mockArticles = [
          {
            id: 'article1',
            title: 'How to use our service',
            content: 'Article content',
            is_published: true
          }
        ]

        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: mockArticles,
                error: null
              })
            })
          })
        })

        const result = await helpService.getHelpArticles()
        expect(result).toEqual(mockArticles)
      })

      it('should filter articles by category', async () => {
        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null
              })
            })
          })
        })

        await helpService.getHelpArticles('tutorials')
        expect(mockSupabase.from).toHaveBeenCalledWith('help_articles_pet')
      })

      it('should include unpublished articles when requested', async () => {
        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        })

        await helpService.getHelpArticles(undefined, false)
        expect(mockSupabase.from).toHaveBeenCalledWith('help_articles_pet')
      })

      it('should throw error when fetching fails', async () => {
        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Fetch failed' }
              })
            })
          })
        })

        await expect(helpService.getHelpArticles()).rejects.toThrow('Erro ao buscar artigos de ajuda: Fetch failed')
      })
    })

    describe('getHelpArticleBySlug', () => {
      it('should return article by slug', async () => {
        const mockArticle = {
          id: 'article1',
          title: 'Test Article',
          slug: 'test-article',
          content: 'Content'
        }

        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockArticle,
                error: null
              })
            })
          })
        })

        const result = await helpService.getHelpArticleBySlug('test-article')
        expect(result).toEqual(mockArticle)
      })

      it('should return null when article not found', async () => {
        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' }
              })
            })
          })
        })

        const result = await helpService.getHelpArticleBySlug('nonexistent')
        expect(result).toBeNull()
      })
    })

    describe('createHelpArticle', () => {
      it('should create new help article', async () => {
        const articleData = {
          title: 'New Article',
          content: 'Article content',
          author_id: 'user1'
        }

        const mockCreatedArticle = {
          id: 'article1',
          ...articleData,
          created_at: '2024-01-01T10:00:00Z'
        }

        mockSupabase.from.mockReturnValue({
          insert: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockCreatedArticle,
              error: null
            })
          })
        })

        const result = await helpService.createHelpArticle(articleData)
        expect(result).toEqual(mockCreatedArticle)
      })

      it('should throw error when creation fails', async () => {
        mockSupabase.from.mockReturnValue({
          insert: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Creation failed' }
            })
          })
        })

        await expect(helpService.createHelpArticle({})).rejects.toThrow('Erro ao criar artigo de ajuda: Creation failed')
      })
    })

    describe('publishHelpArticle', () => {
      it('should publish help article', async () => {
        const mockPublishedArticle = {
          id: 'article1',
          title: 'Test Article',
          is_published: true,
          published_at: expect.any(String)
        }

        mockSupabase.from.mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockPublishedArticle,
                error: null
              })
            })
          })
        })

        const result = await helpService.publishHelpArticle('article1')
        expect(result.is_published).toBe(true)
      })
    })

    describe('unpublishHelpArticle', () => {
      it('should unpublish help article', async () => {
        const mockUnpublishedArticle = {
          id: 'article1',
          title: 'Test Article',
          is_published: false,
          published_at: null
        }

        mockSupabase.from.mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockUnpublishedArticle,
                error: null
              })
            })
          })
        })

        const result = await helpService.unpublishHelpArticle('article1')
        expect(result.is_published).toBe(false)
      })
    })

    describe('searchHelpArticles', () => {
      it('should search help articles by query', async () => {
        const mockArticles = [
          {
            id: 'article1',
            title: 'How to book appointment',
            content: 'Content about booking'
          }
        ]

        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              or: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: mockArticles,
                  error: null
                })
              })
            })
          })
        })

        const result = await helpService.searchHelpArticles('appointment')
        expect(result).toEqual(mockArticles)
      })
    })
  })

  describe('Feedback Methods', () => {
    describe('getFeedback', () => {
      it('should return user feedback', async () => {
        const mockFeedback = [
          {
            id: 'feedback1',
            user_id: 'user1',
            subject: 'Bug report',
            message: 'Found a bug'
          }
        ]

        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: mockFeedback,
                error: null
              })
            })
          })
        })

        const result = await helpService.getFeedback('user1')
        expect(result).toEqual(mockFeedback)
      })

      it('should throw error when fetching fails', async () => {
        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Fetch failed' }
              })
            })
          })
        })

        await expect(helpService.getFeedback('user1')).rejects.toThrow('Erro ao buscar feedback: Fetch failed')
      })
    })

    describe('createFeedback', () => {
      it('should create new feedback', async () => {
        const feedbackData = {
          user_id: 'user1',
          subject: 'Bug report',
          message: 'Found a bug'
        }

        const mockCreatedFeedback = {
          id: 'feedback1',
          ...feedbackData,
          created_at: '2024-01-01T10:00:00Z'
        }

        mockSupabase.from.mockReturnValue({
          insert: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockCreatedFeedback,
              error: null
            })
          })
        })

        const result = await helpService.createFeedback(feedbackData)
        expect(result).toEqual(mockCreatedFeedback)
      })

      it('should throw error when creation fails', async () => {
        mockSupabase.from.mockReturnValue({
          insert: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Creation failed' }
            })
          })
        })

        await expect(helpService.createFeedback({})).rejects.toThrow('Erro ao criar feedback: Creation failed')
      })
    })

    describe('resolveFeedback', () => {
      it('should resolve feedback', async () => {
        const mockResolvedFeedback = {
          id: 'feedback1',
          status: 'resolved',
          resolution: 'Fixed the bug',
          resolved_at: expect.any(String)
        }

        mockSupabase.from.mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockResolvedFeedback,
                error: null
              })
            })
          })
        })

        const result = await helpService.resolveFeedback('feedback1', 'Fixed the bug', 'admin1')
        expect(result.status).toBe('resolved')
      })
    })

    describe('getFeedbackByStatus', () => {
      it('should return feedback by status', async () => {
        const mockFeedback = [
          {
            id: 'feedback1',
            status: 'pending',
            subject: 'Bug report'
          }
        ]

        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: mockFeedback,
                error: null
              })
            })
          })
        })

        const result = await helpService.getFeedbackByStatus('pending')
        expect(result).toEqual(mockFeedback)
      })
    })

    describe('getFeedbackStats', () => {
      it('should return feedback statistics', async () => {
        const mockFeedbackData = [
          { status: 'pending' },
          { status: 'pending' },
          { status: 'resolved' },
          { status: 'in_review' },
          { status: 'closed' }
        ]

        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: mockFeedbackData,
            error: null
          })
        })

        const result = await helpService.getFeedbackStats()

        expect(result).toEqual({
          total: 5,
          pending: 2,
          inReview: 1,
          resolved: 1,
          closed: 1
        })
      })

      it('should throw error when fetching stats fails', async () => {
        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Stats failed' }
          })
        })

        await expect(helpService.getFeedbackStats()).rejects.toThrow('Erro ao buscar estatísticas de feedback: Stats failed')
      })
    })
  })

  describe('Search Methods', () => {
    describe('searchAll', () => {
      it('should search both FAQs and articles', async () => {
        const mockFAQs = [{ id: 'faq1', question: 'Test FAQ' }]
        const mockArticles = [{ id: 'article1', title: 'Test Article' }]

        // Mock FAQ search
        mockSupabase.from.mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              or: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: mockFAQs,
                  error: null
                })
              })
            })
          })
        })

        // Mock article search
        mockSupabase.from.mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              or: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: mockArticles,
                  error: null
                })
              })
            })
          })
        })

        const result = await helpService.searchAll('test')

        expect(result).toEqual({
          faqs: mockFAQs,
          articles: mockArticles
        })
      })
    })

    describe('getPopularContent', () => {
      it('should return popular FAQs and articles', async () => {
        const mockPopularFAQs = [{ id: 'faq1', helpful_count: 10 }]
        const mockPopularArticles = [{ id: 'article1', helpful_count: 15 }]

        // Mock popular FAQs
        mockSupabase.from.mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: mockPopularFAQs,
                  error: null
                })
              })
            })
          })
        })

        // Mock popular articles
        mockSupabase.from.mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: mockPopularArticles,
                  error: null
                })
              })
            })
          })
        })

        const result = await helpService.getPopularContent()

        expect(result).toEqual({
          popularFAQs: mockPopularFAQs,
          popularArticles: mockPopularArticles
        })
      })

      it('should throw error when fetching popular FAQs fails', async () => {
        mockSupabase.from.mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'FAQ fetch failed' }
                })
              })
            })
          })
        })

        await expect(helpService.getPopularContent()).rejects.toThrow('Erro ao buscar FAQs populares: FAQ fetch failed')
      })

      it('should throw error when fetching popular articles fails', async () => {
        // Mock successful FAQ fetch
        mockSupabase.from.mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: [],
                  error: null
                })
              })
            })
          })
        })

        // Mock failed article fetch
        mockSupabase.from.mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Article fetch failed' }
                })
              })
            })
          })
        })

        await expect(helpService.getPopularContent()).rejects.toThrow('Erro ao buscar artigos populares: Article fetch failed')
      })
    })
  })
})
