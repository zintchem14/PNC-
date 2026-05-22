'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Newspaper, Clock, ChevronRight, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getNews } from '@/lib/api'
import { cn } from '@/lib/utils'

interface NewsArticle {
  titre: string
  source: string
  date: string
  resume: string
  url: string
  image: string
  tag: string
  couleur: string
}

export function NewsFeed() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const resolveUrl = (article: NewsArticle) => {
    if (article.url && article.url.trim().length > 0) return article.url
    // si une news n'a pas d'URL, on ouvre une recherche Google News sur le titre
    return `https://news.google.com/search?q=${encodeURIComponent(article.titre)}`
  }

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsData = await getNews()
        if (newsData && newsData.articles) {
          setArticles(newsData.articles)
        } else {
          setArticles([])
        }
      } catch (err) {
        console.error('Erreur lors du chargement des actualités:', err)
        setError("Impossible de charger les actualités. Vérifie que le backend est démarré et que GNEWS_API_KEY est configurée.")
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  if (loading) {
    return (
      <aside className="fixed right-0 top-0 z-30 hidden h-screen w-80 flex-col border-l border-border bg-card xl:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Newspaper className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Health News Feed</h2>
            <p className="text-xs text-muted-foreground">Actualités santé au Cameroun</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Chargement des actualités...</span>
          </div>
        </div>
      </aside>
    )
  }
  return (
    <aside className="fixed right-0 top-0 z-30 hidden h-screen w-80 flex-col border-l border-border bg-card xl:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Newspaper className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Health News Feed</h2>
          <p className="text-xs text-muted-foreground">Actualités santé au Cameroun</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article, index) => (
              <motion.article
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => window.open(resolveUrl(article), '_blank', 'noopener,noreferrer')}
              >
                <Card className="overflow-hidden border-border/50 transition-all hover:border-primary/30 hover:shadow-md">
                  <div className="relative h-28 w-full overflow-hidden bg-muted">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    {article.image ? (
                      <Image
                        src={article.image}
                        alt={article.titre}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `data:image/svg+xml,${encodeURIComponent(`
                            <svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
                              <rect fill="${article.couleur || '#2E5496'}" width="400" height="200"/>
                              <text x="50%" y="50%" fill="white" font-family="system-ui" font-size="14" text-anchor="middle" dy=".3em">Santé Cameroun</text>
                            </svg>
                          `)}`
                        }}
                      />
                    ) : (
                      <div 
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ backgroundColor: article.couleur || '#2E5496' }}
                      >
                        <span className="text-white text-sm font-medium">Santé Cameroun</span>
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 z-20">
                      <span 
                        className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                        style={{ backgroundColor: article.couleur || '#3b82f6' }}
                      >
                        {article.tag}
                      </span>
                    </div>
                  </div>
                  
                  <CardContent className="p-3">
                    <h3 className="mb-1.5 line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                      {article.titre}
                    </h3>
                    <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {article.resume}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(article.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {article.source}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border p-4">
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary/10 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          onClick={() =>
            window.open(
              'https://news.google.com/search?q=sant%C3%A9%20maternelle%20Cameroun',
              '_blank',
              'noopener,noreferrer',
            )
          }
        >
          Voir plus d&apos;actualités
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </aside>
  )
}
