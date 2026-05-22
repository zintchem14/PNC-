import type { NewsArticle } from './types'

export const healthNewsArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'Le Cameroun renforce son programme de santé maternelle',
    excerpt: 'Le ministère de la Santé publique lance une nouvelle initiative pour améliorer l\'accès aux soins prénataux dans les zones rurales.',
    category: 'Politique de santé',
    date: '2 mai 2026',
    imageUrl: '/images/news-maternal.jpg',
    source: 'Cameroon Tribune',
  },
  {
    id: '2',
    title: 'Formation des sages-femmes : 500 nouvelles diplômées',
    excerpt: 'Une promotion record de sages-femmes qualifiées pour répondre aux besoins des régions sous-dotées.',
    category: 'Formation',
    date: '30 avr. 2026',
    imageUrl: '/images/news-training.jpg',
    source: 'MINSANTE',
  },
  {
    id: '3',
    title: 'Vaccination infantile : objectifs atteints dans 7 régions',
    excerpt: 'Le programme élargi de vaccination affiche des résultats encourageants dans la majorité des régions.',
    category: 'Vaccination',
    date: '28 avr. 2026',
    imageUrl: '/images/news-vaccine.jpg',
    source: 'OMS Cameroun',
  },
  {
    id: '4',
    title: 'Nouveau centre de santé à Maroua',
    excerpt: 'Inauguration d\'une structure moderne équipée d\'une unité de soins intensifs néonataux.',
    category: 'Infrastructure',
    date: '25 avr. 2026',
    imageUrl: '/images/news-hospital.jpg',
    source: 'CRTV',
  },
  {
    id: '5',
    title: 'Mortalité maternelle : tendances et défis',
    excerpt: 'Analyse des progrès réalisés et des obstacles persistants dans la lutte contre la mortalité maternelle.',
    category: 'Recherche',
    date: '22 avr. 2026',
    imageUrl: '/images/news-research.jpg',
    source: 'Lancet Global Health',
  },
]
