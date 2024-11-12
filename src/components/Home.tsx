import { useState } from 'react'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Star } from "lucide-react"

interface Product {
  title: string
  price: string
  rating: number
  image: string
  url: string
}

interface AmazonProduct {
  product_title: string
  product_price: string
  product_star_rating: string
  product_photo: string
  product_url: string
}

interface FlipkartProduct {
  title: string
  price: number
  rating: { average: number }
  images: string[]
  url: string
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [amazonProducts, setAmazonProducts] = useState<Product[]>([])
  const [flipkartProducts, setFlipkartProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  const searchProducts = async () => {
    setLoading(true)
    setAmazonProducts([])
    setFlipkartProducts([])
    try {
      // Amazon API call
      const amazonResponse = await axios.get('https://real-time-amazon-data.p.rapidapi.com/search', {
        params: {
          query: query,
          page: '1',
          country: 'IN',
          sort_by: 'RELEVANCE'
        },
        headers: {
          'x-rapidapi-key': '2b70d8addfmshd5e8412fd97d1d9p1bb0d8jsn681a84580eb5',
          'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com'
        }
      })
      const amazonProductsData: Product[] = amazonResponse.data.data.products.slice(0, 5).map((product: AmazonProduct) => ({
        title: product.product_title,
        price: product.product_price,
        rating: parseFloat(product.product_star_rating),
        image: product.product_photo,
        url: product.product_url
      }))
      setAmazonProducts(amazonProductsData)

      // Flipkart API call
      const flipkartResponse = await axios.get('https://real-time-flipkart-api.p.rapidapi.com/product-search', {
        params: {
          q: query,
          page: '1',
          // sort_by: 'popularity'
        },
        headers: {
          'x-rapidapi-key': '2b70d8addfmshd5e8412fd97d1d9p1bb0d8jsn681a84580eb5',
          'x-rapidapi-host': 'real-time-flipkart-api.p.rapidapi.com'
        }
      })
      const flipkartProductsData: Product[] = flipkartResponse.data.products.slice(0, 5).map((product: FlipkartProduct) => ({
        title: product.title,
        price: `₹${product.price}`,
        rating: product.rating.average,
        image: product.images[0],
        url: product.url
      }))
      setFlipkartProducts(flipkartProductsData)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
    setLoading(false)
  }

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="w-full h-full flex flex-col">
      <CardContent className="p-4 flex flex-col flex-grow">
        <div className="aspect-square relative mb-4 flex-shrink-0">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-contain"
          />
        </div>
        <h3 className="font-semibold text-sm mb-2 line-clamp-2 flex-grow">{product.title}</h3>
        <div className="flex justify-between items-center mt-2">
          <span className="font-bold">{product.price}</span>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 mr-1" />
            <span>{product.rating.toFixed(1)}</span>
          </div>
        </div>
        <Button className="w-full mt-4" asChild>
          <a href={product.url} target="_blank" rel="noopener noreferrer">View Product</a>
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold my-16 text-center">Product Price Comparison</h1>
      <div className="flex space-x-4 mb-8 max-w-[500px] mx-auto">
        <Input
          type="text"
          placeholder="Search for products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-grow"
        />
        <Button onClick={searchProducts} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Search'}
        </Button>
      </div>

      {amazonProducts.length === 0 && flipkartProducts.length === 0 ? (
        <div className='flex justify-center items-center'>
          {loading ? <Loader2 className="mt-20 h-10 w-10 animate-spin" /> : <p className='mt-10 text-2xl font-semibold opacity-40'>Search for a  product</p>}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 md:w-11/12 mx-auto">
            <div className=''>
              <h2 className="text-2xl font-semibold mb-4">Amazon Results</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {amazonProducts.map((product, index) => (
                  <ProductCard key={`amazon-${index}`} product={product} />
                ))}
              </div>
            </div>
            <div className=''>
              <h2 className="text-2xl font-semibold mb-4">Flipkart Results</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {flipkartProducts.map((product, index) => (
                  <ProductCard key={`flipkart-${index}`} product={product} />
                ))}
              </div>
            </div>
          </div>
        </>
      )
      }

    </div>
  )
}